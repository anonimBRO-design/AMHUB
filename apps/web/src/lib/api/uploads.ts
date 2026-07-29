import type { PresetFileType } from "@presethub/types";
import { z } from "zod";
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

export const uploadObjectPathSchema = z
	.string()
	.trim()
	.min(3)
	.max(500)
	.regex(/^[a-zA-Z0-9/_:.-]+$/)
	.refine((value) => !value.startsWith("/") && !value.endsWith("/"), {
		message: "Object path must be relative.",
	})
	.refine((value) => !value.split("/").includes(".."), {
		message: "Object path cannot traverse directories.",
	});

export const uploadFileMetadataSchema = z.object({
	file_name: z.string().trim().min(1).max(180),
	mime_type: z.string().trim().min(3).max(120),
	size: z
		.number()
		.int()
		.min(1)
		.max(10 * 1024 * 1024),
	object_path: uploadObjectPathSchema.optional(),
	checksum_sha256: z
		.string()
		.trim()
		.regex(/^[a-f0-9]{64}$/)
		.optional(),
	width: z.number().int().min(1).max(10000).optional(),
	height: z.number().int().min(1).max(10000).optional(),
});

const presetFileTypeSchema = z.enum(["xml", "qr", "link"]);

const uploadUrlSchema = z.string().trim().url().max(2048);

export const presetUploadMetadataSchema = z
	.object({
		file_type: presetFileTypeSchema,
		thumbnail_url: uploadUrlSchema,
		file_url: uploadUrlSchema.nullable().optional(),
		am_link: uploadUrlSchema.nullable().optional(),
		metadata: z
			.object({
				thumbnail: uploadFileMetadataSchema.optional(),
				preset_file: uploadFileMetadataSchema.optional(),
			})
			.optional(),
	})
	.superRefine((value, context) => {
		if (value.file_type === "link") {
			if (!value.am_link) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["am_link"],
					message: "Alight Motion link is required for link presets.",
				});
			}

			if (value.file_url) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["file_url"],
					message: "File URL is not allowed for link presets.",
				});
			}

			if (value.metadata?.preset_file) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["metadata", "preset_file"],
					message: "Preset file metadata is not allowed for link presets.",
				});
			}

			return;
		}

		if (!value.file_url) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["file_url"],
				message: "File URL is required for uploaded preset files.",
			});
		}

		if (value.am_link) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["am_link"],
				message: "Alight Motion link is only allowed for link presets.",
			});
		}
	});

export const avatarUploadMetadataSchema = z.object({
	avatar_url: uploadUrlSchema,
	metadata: uploadFileMetadataSchema.optional(),
});

export type UploadFileMetadataInput = z.infer<typeof uploadFileMetadataSchema>;
export type PresetUploadMetadataInput = z.infer<
	typeof presetUploadMetadataSchema
>;
export type AvatarUploadMetadataInput = z.infer<
	typeof avatarUploadMetadataSchema
>;

export function assertOwnedObjectPath(objectPath: string, ownerId: string) {
	const [pathOwnerId] = objectPath.split("/");

	if (pathOwnerId !== ownerId) {
		throw new ApiError({
			code: "forbidden",
			message: "Upload metadata must belong to the authenticated user.",
		});
	}
}

export function assertUploadMetadataOwnership(
	metadata: UploadFileMetadataInput | undefined,
	ownerId: string,
) {
	if (metadata?.object_path) {
		assertOwnedObjectPath(metadata.object_path, ownerId);
	}
}

export function assertUploadMetadataFileLimits(
	metadata: UploadFileMetadataInput | undefined,
	options: FileValidationOptions,
) {
	if (!metadata) {
		return;
	}

	if (metadata.size > options.maxBytes) {
		throw new ApiError({
			code: "payload_too_large",
			details: { maxBytes: options.maxBytes, actualBytes: metadata.size },
		});
	}

	if (!options.mimeTypes.includes(metadata.mime_type)) {
		throw new ApiError({
			code: "unsupported_media_type",
			details: {
				allowedTypes: options.mimeTypes,
				actualType: metadata.mime_type,
			},
		});
	}

	const extension = metadata.file_name.split(".").pop()?.toLowerCase();

	if (
		options.allowedExtensions &&
		(!extension || !options.allowedExtensions.includes(extension))
	) {
		throw new ApiError({
			code: "unsupported_media_type",
			message: "The upload metadata file extension is not supported.",
			details: { allowedExtensions: options.allowedExtensions, extension },
		});
	}
}

export function normalizeUploadMetadata(
	metadata: UploadFileMetadataInput | undefined,
	ownerId: string,
	options?: FileValidationOptions,
) {
	assertUploadMetadataOwnership(metadata, ownerId);
	assertUploadMetadataFileLimits(metadata, options ?? uploadLimits.presetFile);

	if (!metadata) {
		return null;
	}

	return {
		...metadata,
		owner_id: ownerId,
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
