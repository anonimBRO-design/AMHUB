import jsQR from "jsqr";
import type { ValidationCheck, ValidationResult } from "./types";

const MAX_QR_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_DOMAINS = [
	"alight.link",
	"am.link",
	"alightmotion.com",
	"drive.google.com",
	"dropbox.com",
	"mediafire.com",
	"github.com",
];

export async function validateQr(file: File | null): Promise<ValidationResult> {
	const checks: ValidationCheck[] = [
		{
			id: "qr_selected",
			label: "QR image selected",
			status: "idle",
		},
		{
			id: "qr_decoded",
			label: "QR code detected & decoded",
			status: "idle",
		},
		{
			id: "preset_payload",
			label: "Supported preset payload verified",
			status: "idle",
		},
	];

	if (!file) {
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "No QR image selected. Please upload a QR code image.",
		};
	}

	// 1. Check file type and size
	if (
		!file.type.startsWith("image/") &&
		!/\.(png|jpe?g|webp)$/i.test(file.name)
	) {
		checks[0] = {
			...checks[0],
			status: "error",
			message: `Invalid file type "${file.type || file.name}". Must be PNG, JPEG, or WebP.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Invalid file format. Please upload a QR image.",
		};
	}

	if (file.size > MAX_QR_FILE_SIZE) {
		checks[0] = {
			...checks[0],
			status: "error",
			message: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "QR Image size exceeds 10MB limit.",
		};
	}

	checks[0] = {
		...checks[0],
		status: "success",
		message: `${file.name} selected`,
	};

	// 2. Decode QR Code via HTML Canvas & jsQR
	let qrCodeText = "";
	try {
		const imageData = await readImageData(file);
		const code = jsQR(imageData.data, imageData.width, imageData.height);

		if (!code || !code.data.trim()) {
			checks[1] = {
				...checks[1],
				status: "error",
				message:
					"No readable QR code found in the image. Please upload a clear QR code screenshot.",
			};
			return {
				isValid: false,
				isValidating: false,
				checks,
				error: "Could not detect or decode QR code from the image.",
			};
		}

		qrCodeText = code.data.trim();
		checks[1] = {
			...checks[1],
			status: "success",
			message: "QR code decoded successfully",
		};
	} catch (e) {
		checks[1] = {
			...checks[1],
			status: "error",
			message: `Image processing error: ${e instanceof Error ? e.message : "Decode failed"}`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Failed to process QR image.",
		};
	}

	// 3. Validate Payload
	const lowerPayload = qrCodeText.toLowerCase();

	// Reject WiFi, vCard, Payment, or plain text non-URLs
	if (
		lowerPayload.startsWith("wifi:") ||
		lowerPayload.startsWith("begin:vcard") ||
		lowerPayload.startsWith("upi:") ||
		lowerPayload.startsWith("mailto:") ||
		lowerPayload.startsWith("tel:")
	) {
		checks[2] = {
			...checks[2],
			status: "error",
			message: "QR payload is a non-preset format (WiFi/Contact/Payment/Text).",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "QR code contains non-preset data (WiFi/Contact/Payment).",
		};
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(qrCodeText);
	} catch {
		checks[2] = {
			...checks[2],
			status: "error",
			message: `Decoded content ("${qrCodeText.slice(0, 40)}...") is not a valid web URL.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "QR code content is text-only, not a valid preset URL.",
		};
	}

	const hostname = parsedUrl.hostname.toLowerCase();
	const isSupportedDomain = ALLOWED_DOMAINS.some(
		(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
	);
	const isXmlPath = parsedUrl.pathname.toLowerCase().endsWith(".xml");

	if (!isSupportedDomain && !isXmlPath) {
		checks[2] = {
			...checks[2],
			status: "error",
			message: `Unsupported QR link domain "${hostname}". Must be alight.link, am.link, drive.google.com, etc.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "QR code link is not a recognized Alight Motion preset URL.",
		};
	}

	checks[2] = {
		...checks[2],
		status: "success",
		message: `Preset link detected: ${parsedUrl.hostname}`,
	};

	return {
		isValid: true,
		isValidating: false,
		checks,
		error: null,
		decodedPayload: qrCodeText,
	};
}

function readImageData(file: File): Promise<ImageData> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Could not get 2D canvas context."));
				return;
			}
			ctx.drawImage(img, 0, 0);
			const data = ctx.getImageData(0, 0, img.width, img.height);
			resolve(data);
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image into element."));
		};

		img.src = objectUrl;
	});
}
