import type {
	PresetSourceType,
	ValidationCheck,
	ValidationResult,
} from "./types";

const ALLOWED_DOMAINS = [
	"alight.link",
	"am.link",
	"alightmotion.com",
	"drive.google.com",
	"dropbox.com",
	"mediafire.com",
	"github.com",
];

/**
 * Classify the URL into one of the supported preset source types.
 * Returns { sourceType, domain } or { sourceType: "am_link" } as fallback.
 */
function classifyUrl(parsedUrl: URL): {
	sourceType: PresetSourceType;
	domain: string;
} {
	const hostname = parsedUrl.hostname.toLowerCase();

	// Alight Creative share links: https://alightcreative.com/am/share/...
	if (
		hostname === "alightcreative.com" &&
		parsedUrl.pathname.startsWith("/am/share/")
	) {
		return { sourceType: "alight_creative", domain: hostname };
	}

	// Google Drive share links: multiple formats
	if (hostname === "drive.google.com") {
		return { sourceType: "google_drive", domain: hostname };
	}

	// Legacy/shortener domains
	if (
		hostname === "alight.link" ||
		hostname === "am.link" ||
		hostname === "alightmotion.com"
	) {
		return { sourceType: "am_link", domain: hostname };
	}

	// Other allowed file hosts
	if (
		ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))
	) {
		return { sourceType: "am_link", domain: hostname };
	}

	// Direct XML file
	if (parsedUrl.pathname.toLowerCase().endsWith(".xml")) {
		return { sourceType: "am_link", domain: hostname };
	}

	// Fallback — treat as generic am_link; validation will fail later
	return { sourceType: "am_link", domain: hostname };
}

export async function validateAmLink(
	urlInput: string,
): Promise<ValidationResult> {
	const checks: ValidationCheck[] = [
		{
			id: "url_format",
			label: "URL format & HTTPS protocol valid",
			status: "idle",
		},
		{
			id: "supported_host",
			label: "Supported preset provider hostname",
			status: "idle",
		},
		{
			id: "reachable",
			label: "Link reachable (HTTP 200/301)",
			status: "idle",
		},
	];

	const trimmed = urlInput.trim();
	if (!trimmed) {
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Please enter an Alight Motion import link.",
		};
	}

	// 1. Check URL Syntax & HTTPS Protocol
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(trimmed);
	} catch {
		checks[0] = {
			...checks[0],
			status: "error",
			message: "Invalid URL syntax. URL must start with https://",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Invalid URL format.",
		};
	}

	if (parsedUrl.protocol !== "https:") {
		checks[0] = {
			...checks[0],
			status: "error",
			message: "Insecure protocol. Preset URLs must use HTTPS.",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "URL must use HTTPS.",
		};
	}

	if (trimmed.length > 2048) {
		checks[0] = {
			...checks[0],
			status: "error",
			message: "URL length exceeds 2048 characters.",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "URL is excessively long.",
		};
	}

	checks[0] = {
		...checks[0],
		status: "success",
		message: "Valid HTTPS URL format",
	};

	// 2. Check Supported Hostname & classify source
	const classification = classifyUrl(parsedUrl);
	const isSupported =
		classification.sourceType !== "am_link" ||
		ALLOWED_DOMAINS.some(
			(d) =>
				parsedUrl.hostname.toLowerCase() === d ||
				parsedUrl.hostname.toLowerCase().endsWith(`.${d}`),
		) ||
		parsedUrl.pathname.toLowerCase().endsWith(".xml");

	if (!isSupported) {
		checks[1] = {
			...checks[1],
			status: "error",
			message: `Unsupported hostname "${parsedUrl.hostname}". Must be alightcreative.com, alight.link, am.link, drive.google.com, etc.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Unsupported preset link domain.",
		};
	}

	checks[1] = {
		...checks[1],
		status: "success",
		message: `Supported provider (${classification.domain})`,
	};

	// 3. Reachability Check via Server Endpoint
	checks[2] = {
		...checks[2],
		status: "loading",
		message: "Pinging server...",
	};

	try {
		const res = await fetch("/api/validate-link", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: trimmed }),
		});

		const data = await res.json();
		if (!res.ok || !data.reachable) {
			checks[2] = {
				...checks[2],
				status: "error",
				message: data.message || "Link ping failed.",
			};
			return {
				isValid: false,
				isValidating: false,
				checks,
				error: data.message || "Preset link is unreachable.",
			};
		}

		checks[2] = {
			...checks[2],
			status: "success",
			message: "Link verified reachable",
		};
	} catch (e) {
		checks[2] = {
			...checks[2],
			status: "error",
			message: `Network check failed: ${e instanceof Error ? e.message : "Error"}`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Failed to verify link reachability.",
		};
	}

	return {
		isValid: true,
		isValidating: false,
		checks,
		error: null,
		sourceType: classification.sourceType,
	};
}
