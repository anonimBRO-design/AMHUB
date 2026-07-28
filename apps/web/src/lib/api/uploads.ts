import type { PresetFileType } from "@presethub/types";
import { ApiError } from "./errors";

export const uploadLimits = {
	avatar: {
		maxBytes: 5 * 1024 * 1024,
		mimeTypes: ["image/jpeg", "image/png", "image/webp"],
	},
	thumbnail: {
		maxBytes: 10 * 1024 * 1024,
		mimeTypes: ["image/jpeg", "image/png", "image/webp"],
	},
	presetFile: {
		maxBytes: 5 * 1024 * 1024,
		mimeTypes: [
			"application/xml",
			"text/xml",
			"image/png",
			"image/jpeg",
			"image/webp",
		],
	},
} as const;

export interface FileValidationOptions {
	maxBytes: number;
	mimeTypes: readonly string[];
	allowedExtensions?: readonly string[];
}

export interface ValidatedUploadFile {
	file: File;
	name: string;
	size: number;
	type: string;
	extension?: string;
}

export function validateUploadFile(
	file: File | null | undefined,
	options: FileValidationOptions,
): ValidatedUploadFile {
	if (!file || file.size === 0) {
		throw new ApiError({
			code: "bad_request",
			message: "A file is required.",
		});
	}

	if (file.size > options.maxBytes) {
		throw new ApiError({
			code: "payload_too_large",
			details: { maxBytes: options.maxBytes, actualBytes: file.size },
		});
	}

	if (!options.mimeTypes.includes(file.type)) {
		throw new ApiError({
			code: "unsupported_media_type",
			details: { allowedTypes: options.mimeTypes, actualType: file.type },
		});
	}

	const extension = file.name.split(".").pop()?.toLowerCase();

	if (
		options.allowedExtensions &&
		(!extension || !options.allowedExtensions.includes(extension))
	) {
		throw new ApiError({
			code: "unsupported_media_type",
			message: "The uploaded file extension is not supported.",
			details: { allowedExtensions: options.allowedExtensions, extension },
		});
	}

	return {
		file,
		name: file.name,
		size: file.size,
		type: file.type,
		extension,
	};
}

export function presetFileValidationOptions(fileType: PresetFileType) {
	if (fileType === "link") {
		throw new ApiError({
			code: "bad_request",
			message: "Linked presets do not include an uploaded file.",
		});
	}

	return {
		...uploadLimits.presetFile,
		allowedExtensions:
			fileType === "xml" ? ["xml"] : ["png", "jpg", "jpeg", "webp"],
	} satisfies FileValidationOptions;
}
