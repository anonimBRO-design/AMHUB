export type CheckStatus = "idle" | "loading" | "success" | "error";

export type PresetSourceFormat = "xml" | "gdrive" | "link";

export interface ValidationCheck {
	id: string;
	label: string;
	status: CheckStatus;
	message?: string;
}

export interface ValidationResult {
	isValid: boolean;
	isValidating: boolean;
	checks: ValidationCheck[];
	error: string | null;
	decodedPayload?: string;
	sourceType?: PresetSourceType;
	activeSourceFormats?: PresetSourceFormat[];
}

export type PresetSourceType =
	| "xml_file"
	| "am_link"
	| "google_drive"
	| "alight_creative";
