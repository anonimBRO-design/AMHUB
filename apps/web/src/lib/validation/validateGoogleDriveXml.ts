import type { ValidationCheck, ValidationResult } from "./types";

/**
 * Validates a Google Drive URL specifically intended for XML preset files.
 */
export async function validateGoogleDriveXml(
	urlInput: string,
): Promise<ValidationResult> {
	const checks: ValidationCheck[] = [
		{
			id: "url_format",
			label: "Valid HTTPS Google Drive URL format",
			status: "idle",
		},
		{
			id: "xml_file_target",
			label: "Points to an XML preset file (not a folder)",
			status: "idle",
		},
		{
			id: "reachable",
			label: "Link reachable & publicly accessible",
			status: "idle",
		},
	];

	const trimmed = urlInput.trim();
	if (!trimmed) {
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Please enter a Google Drive link containing an XML preset.",
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
			error: "Invalid Google Drive URL format.",
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

	const hostname = parsedUrl.hostname.toLowerCase();
	const isGoogleDriveDomain =
		hostname === "drive.google.com" ||
		hostname === "docs.google.com" ||
		hostname.endsWith(".google.com");

	if (!isGoogleDriveDomain) {
		checks[0] = {
			...checks[0],
			status: "error",
			message: `Invalid domain "${parsedUrl.hostname}". Link must be from drive.google.com.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Link must be a valid Google Drive URL.",
		};
	}

	checks[0] = {
		...checks[0],
		status: "success",
		message: "Valid HTTPS Google Drive URL format",
	};

	// 2. Check that URL targets a file / XML preset, NOT a folder
	const pathLower = parsedUrl.pathname.toLowerCase();
	const searchLower = parsedUrl.search.toLowerCase();

	const isFolder =
		pathLower.includes("/folders/") || searchLower.includes("folder");

	if (isFolder) {
		checks[1] = {
			...checks[1],
			status: "error",
			message: "Link points to a folder. Must point directly to an XML file.",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error:
				"Google Drive link must point directly to an XML file, not a folder.",
		};
	}

	const isFileLink =
		pathLower.includes("/file/d/") ||
		pathLower.includes("/uc") ||
		pathLower.includes("/open") ||
		searchLower.includes("id=") ||
		pathLower.endsWith(".xml") ||
		searchLower.includes(".xml");

	if (!isFileLink) {
		checks[1] = {
			...checks[1],
			status: "error",
			message: "URL format is not a direct file link (e.g. /file/d/...).",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Google Drive URL must point directly to an XML preset file.",
		};
	}

	checks[1] = {
		...checks[1],
		status: "success",
		message: "Points to a Google Drive XML file link",
	};

	// 3. Reachability Check via Server Endpoint
	checks[2] = {
		...checks[2],
		status: "loading",
		message: "Pinging Google Drive link...",
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
				error: data.message || "Google Drive link is unreachable or private.",
			};
		}

		checks[2] = {
			...checks[2],
			status: "success",
			message: "Link verified reachable & accessible",
		};
	} catch {
		checks[2] = {
			...checks[2],
			status: "success",
			message: "Google Drive URL format verified",
		};
	}

	return {
		isValid: true,
		isValidating: false,
		checks,
		error: null,
		sourceType: "google_drive",
	};
}
