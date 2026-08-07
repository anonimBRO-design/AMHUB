import type { ValidationCheck, ValidationResult } from "./types";

const MAX_XML_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function validateXml(
	file: File | null,
): Promise<ValidationResult> {
	const checks: ValidationCheck[] = [
		{
			id: "file_selected",
			label: "XML file selected",
			status: "idle",
		},
		{
			id: "file_size",
			label: "File size within limit (≤15MB)",
			status: "idle",
		},
		{
			id: "file_readable",
			label: "File readable",
			status: "idle",
		},
		{
			id: "xml_syntax",
			label: "XML syntax valid",
			status: "idle",
		},
		{
			id: "preset_structure",
			label: "Alight Motion preset structure detected",
			status: "idle",
		},
	];

	if (!file) {
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "No file selected. Please select an Alight Motion XML file.",
		};
	}

	// 1. Check file selection and extension
	const filename = file.name.toLowerCase();
	if (!filename.endsWith(".xml")) {
		checks[0] = {
			...checks[0],
			status: "error",
			message: `Invalid file extension "${file.name.slice(file.name.lastIndexOf("."))}". Must be a .xml file.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Invalid file type. Only .xml files are supported.",
		};
	}
	checks[0] = {
		...checks[0],
		status: "success",
		message: `${file.name} selected`,
	};

	// 2. Check file size
	if (file.size === 0) {
		checks[1] = {
			...checks[1],
			status: "error",
			message: "File is empty (0 bytes).",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Selected file is empty.",
		};
	}
	if (file.size > MAX_XML_FILE_SIZE) {
		const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
		checks[1] = {
			...checks[1],
			status: "error",
			message: `File size (${sizeMb}MB) exceeds maximum limit of 15MB.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "File size exceeds 15MB limit.",
		};
	}
	checks[1] = {
		...checks[1],
		status: "success",
		message: `${(file.size / 1024).toFixed(1)} KB`,
	};

	// 3. Check file readability
	let textContent = "";
	try {
		textContent = await file.text();
		checks[2] = {
			...checks[2],
			status: "success",
			message: "File read successfully",
		};
	} catch (e) {
		checks[2] = {
			...checks[2],
			status: "error",
			message: `Unreadable file: ${e instanceof Error ? e.message : "Read error"}`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "Failed to read file content.",
		};
	}

	// 4. Check XML syntax with DOMParser
	if (!textContent.trim()) {
		checks[3] = {
			...checks[3],
			status: "error",
			message: "XML file has no text content.",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "XML file content is empty.",
		};
	}

	let xmlDoc: Document;
	try {
		const parser = new DOMParser();
		xmlDoc = parser.parseFromString(textContent, "text/xml");
		const parserError = xmlDoc.getElementsByTagName("parsererror");
		if (parserError.length > 0) {
			const errorText =
				parserError[0].textContent || "XML parsing syntax error";
			checks[3] = {
				...checks[3],
				status: "error",
				message: `Malformed XML: ${errorText.slice(0, 100)}`,
			};
			return {
				isValid: false,
				isValidating: false,
				checks,
				error: "Malformed XML file. Syntax error detected.",
			};
		}
		checks[3] = {
			...checks[3],
			status: "success",
			message: "Valid XML syntax",
		};
	} catch (e) {
		checks[3] = {
			...checks[3],
			status: "error",
			message: `XML Parser failure: ${e instanceof Error ? e.message : "Parse error"}`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "XML parsing failed.",
		};
	}

	// 5. Detect Alight Motion preset structure
	const rootElement = xmlDoc.documentElement;
	const rootName = rootElement.nodeName.toLowerCase();
	const xmlText = textContent.toLowerCase();

	const isAmPreset =
		rootName.includes("scene") ||
		rootName.includes("project") ||
		rootName.includes("preset") ||
		rootName.includes("am") ||
		xmlText.includes("alightmotion") ||
		xmlText.includes("am-") ||
		xmlText.includes("<shape") ||
		xmlText.includes("<layer") ||
		xmlText.includes("<effect") ||
		xmlText.includes("<property") ||
		xmlText.includes("<transform");

	if (!isAmPreset) {
		checks[4] = {
			...checks[4],
			status: "error",
			message:
				"XML does not contain recognized Alight Motion elements (<scene>, <layer>, <effect>, etc.).",
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "XML is missing Alight Motion preset structure.",
		};
	}

	checks[4] = {
		...checks[4],
		status: "success",
		message: `Alight Motion structure (${rootName || "preset"}) detected`,
	};

	return {
		isValid: true,
		isValidating: false,
		checks,
		error: null,
	};
}
