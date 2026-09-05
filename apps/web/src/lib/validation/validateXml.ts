import type { ValidationCheck, ValidationResult } from "./types";

const MAX_XML_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_XML_ELEMENTS = 200000;
const MAX_XML_DEPTH = 100;

const UNSAFE_PATTERNS: { pattern: RegExp; label: string }[] = [
	{ pattern: /<!DOCTYPE/i, label: "DOCTYPE declaration" },
	{ pattern: /<!ENTITY/i, label: "ENTITY declaration (XXE risk)" },
	{ pattern: /<script[\s>]/i, label: "<script> tag" },
	{ pattern: /<iframe[\s>]/i, label: "<iframe> tag" },
	{ pattern: /<object[\s>]/i, label: "<object> tag" },
	{ pattern: /<embed[\s>]/i, label: "<embed> tag" },
	{ pattern: /javascript:/i, label: "javascript: URI" },
];

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
			id: "xml_safety",
			label: "No unsafe content (XXE/scripts)",
			status: "idle",
		},
		{
			id: "xml_complexity",
			label: "Complexity within limits",
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

	// 5. Safety scan: block XXE / billion-laughs vectors and active content.
	// DOMParser in modern browsers does not resolve external entities, but we
	// reject the declarations outright so malicious files never reach storage.
	const unsafeHit = UNSAFE_PATTERNS.find((u) => u.pattern.test(textContent));
	if (unsafeHit) {
		checks[4] = {
			...checks[4],
			status: "error",
			message: `Blocked unsafe content: ${unsafeHit.label}.`,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error:
				"File preset ditolak otomatis: konten tidak aman terdeteksi (risiko XXE/skrip).",
		};
	}
	checks[4] = {
		...checks[4],
		status: "success",
		message: "No DOCTYPE/ENTITY/scripts",
	};

	// 6. Complexity guard: cap element count and nesting depth so a single
	// file cannot freeze the importer or blow up storage rendering.
	let elementCount = 0;
	let maxDepth = 0;
	let tooComplex: string | null = null;
	const stack: { el: Element; depth: number }[] = [
		{ el: xmlDoc.documentElement, depth: 1 },
	];
	while (stack.length > 0) {
		const { el, depth } = stack.pop() as { el: Element; depth: number };
		elementCount += 1;
		if (depth > maxDepth) maxDepth = depth;
		if (elementCount > MAX_XML_ELEMENTS) {
			tooComplex = `Melebihi ${MAX_XML_ELEMENTS.toLocaleString("id-ID")} elemen.`;
			break;
		}
		if (maxDepth > MAX_XML_DEPTH) {
			tooComplex = `Kedalaman nesting melebihi ${MAX_XML_DEPTH} level.`;
			break;
		}
		const children = el.children;
		for (let i = children.length - 1; i >= 0; i--) {
			stack.push({ el: children[i], depth: depth + 1 });
		}
	}
	if (tooComplex) {
		checks[5] = {
			...checks[5],
			status: "error",
			message: tooComplex,
		};
		return {
			isValid: false,
			isValidating: false,
			checks,
			error: "File preset ditolak otomatis: struktur terlalu kompleks.",
		};
	}
	checks[5] = {
		...checks[5],
		status: "success",
		message: `${elementCount.toLocaleString("id-ID")} elemen, depth ${maxDepth}`,
	};

	// 7. Detect Alight Motion preset structure
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
		checks[6] = {
			...checks[6],
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

	checks[6] = {
		...checks[6],
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
