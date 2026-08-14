/**
 * Upload validation and storage path utilities.
 *
 * This module centralises all file constraint enforcement,
 * path generation, and filename sanitisation so that route
 * handlers stay thin and share zero duplicated logic.
 */
import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { createSignedUploadUrl } from "@/lib/supabase/storage";
import { type StorageBucket, storageBuckets } from "@/lib/supabase/storage";

// ─────────────────────────────────────────────────────────────────────────────
// Constraints
// ─────────────────────────────────────────────────────────────────────────────

export const UPLOAD_LIMITS = {
	avatar: {
		maxBytes: 5 * 1024 * 1024, // 5 MB
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
		allowedExtensions: ["jpg", "jpeg", "png", "webp"] as const,
	},
	thumbnail: {
		maxBytes: 10 * 1024 * 1024, // 10 MB
		allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
		allowedExtensions: ["jpg", "jpeg", "png", "webp"] as const,
	},
	presetXml: {
		maxBytes: 5 * 1024 * 1024, // 5 MB
		allowedMimeTypes: ["application/xml", "text/xml", "text/plain"] as const,
		allowedExtensions: ["xml"] as const,
	},
	presetQr: {
		maxBytes: 5 * 1024 * 1024, // 5 MB
		allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"] as const,
		allowedExtensions: ["png", "jpg", "jpeg", "webp"] as const,
	},
	presetVideo: {
		maxBytes: 100 * 1024 * 1024, // 100 MB
		allowedMimeTypes: [
			"video/mp4",
			"video/webm",
			"video/quicktime",
			"video/x-m4v",
			"video/m4v",
			"video/x-matroska",
		] as const,
		allowedExtensions: ["mp4", "webm", "mov", "m4v", "mkv"] as const,
	},
} satisfies Record<
	string,
	{
		maxBytes: number;
		allowedMimeTypes: readonly string[];
		allowedExtensions: readonly string[];
	}
>;

export type UploadKind = keyof typeof UPLOAD_LIMITS;
// 'avatar' | 'thumbnail' | 'presetXml' | 'presetQr' | 'presetVideo'

// ─────────────────────────────────────────────────────────────────────────────
// Filename helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips everything except alphanumerics, hyphens, underscores, and a
 * single dot before the extension. Prevents path traversal and injection.
 */
export function sanitizeFilename(raw: string): string {
	// Normalise unicode, strip null bytes
	const name = raw.normalize("NFC").replace(/\0/g, "").trim();
	// Reject absolute paths and directory traversal segments
	const basename = name.split(/[/\\]/).at(-1) ?? name;
	return basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

/** Extract and lower-case the final extension from a filename. */
export function getExtension(filename: string): string {
	const parts = filename.split(".");
	return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "") : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface FileMetadataInput {
	/** Reported MIME type from the client (verified here against allowlist). */
	content_type: string;
	/** Original filename provided by the client (stored as metadata only). */
	filename: string;
	/** Byte size the client reports it will upload. */
	size: number;
}

export interface FileValidationConstraints {
	maxBytes: number;
	allowedMimeTypes: readonly string[];
	allowedExtensions: readonly string[];
}

export function validateFileMetadata(
	file: FileMetadataInput,
	constraints: FileValidationConstraints,
): void {
	// 1. Size check
	if (file.size <= 0) {
		throw new ApiError({
			code: "bad_request",
			message: "File size must be greater than 0 bytes.",
		});
	}

	if (file.size > constraints.maxBytes) {
		throw new ApiError({
			code: "payload_too_large",
			message: `File exceeds the maximum allowed size of ${constraints.maxBytes / (1024 * 1024)} MB.`,
			details: { maxBytes: constraints.maxBytes, actualBytes: file.size },
		});
	}

	// 2. MIME type check (allowlist)
	const contentType =
		file.content_type.toLowerCase().split(";")[0]?.trim() ?? "";
	if (!constraints.allowedMimeTypes.includes(contentType)) {
		throw new ApiError({
			code: "unsupported_media_type",
			message: "The file type is not supported.",
			details: {
				allowed: constraints.allowedMimeTypes,
				received: file.content_type,
			},
		});
	}

	// 3. Extension check against sanitised filename
	const sanitized = sanitizeFilename(file.filename);
	const ext = getExtension(sanitized);
	if (!ext || !constraints.allowedExtensions.includes(ext)) {
		throw new ApiError({
			code: "unsupported_media_type",
			message: "The file extension is not supported.",
			details: {
				allowed: constraints.allowedExtensions,
				received: ext || "(none)",
			},
		});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage path generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a deterministic, owner-scoped, UUID-named storage object path.
 *
 * Pattern: `{ownerId}/{uuid}.{extension}`
 *
 * - The owner prefix lets Supabase RLS folder-ownership policies work.
 * - The UUID body ensures no filename collisions and prevents guessing.
 * - The extension is derived from the MIME type allowlist, not from the
 *   raw client filename, so client-supplied names never reach the path.
 */
export function buildStoragePath(ownerId: string, mimeType: string): string {
	const ext = mimeTypeToExtension(mimeType);
	const uuid = randomUUID();
	return `${ownerId}/${uuid}.${ext}`;
}

const MIME_TO_EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"application/xml": "xml",
	"text/xml": "xml",
	"text/plain": "xml",
	"video/mp4": "mp4",
	"video/webm": "webm",
	"video/quicktime": "mov",
	"video/x-m4v": "m4v",
	"video/m4v": "m4v",
	"video/x-matroska": "mkv",
};

function mimeTypeToExtension(mimeType: string): string {
	const normalized = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
	const ext = MIME_TO_EXT[normalized];
	if (!ext) {
		throw new ApiError({
			code: "unsupported_media_type",
			message: "Cannot derive storage extension from MIME type.",
		});
	}
	return ext;
}

// ─────────────────────────────────────────────────────────────────────────────
// Presigned URL factory
// ─────────────────────────────────────────────────────────────────────────────

export interface PreparedUpload {
	/** Signed upload URL the client uses to PUT the file directly to Storage. */
	upload_url: string;
	/** Opaque token from Supabase required alongside the upload URL. */
	token: string;
	/** Full object path inside the bucket (returned so caller can persist it). */
	storage_path: string;
	/** Bucket the file lives in. */
	bucket: StorageBucket;
	/** Sanitised original filename (store as user-visible metadata only). */
	original_filename: string;
}

export async function prepareUpload(
	bucket: StorageBucket,
	ownerId: string,
	file: FileMetadataInput,
	constraints: FileValidationConstraints,
): Promise<PreparedUpload> {
	validateFileMetadata(file, constraints);

	const contentType =
		file.content_type.toLowerCase().split(";")[0]?.trim() ?? "";
	const storagePath = buildStoragePath(ownerId, contentType);
	const { signedUrl, token } = await createSignedUploadUrl(bucket, storagePath);

	return {
		upload_url: signedUrl,
		token,
		storage_path: storagePath,
		bucket,
		original_filename: sanitizeFilename(file.filename),
	};
}

// Re-export bucket constants for convenience in route handlers
export { storageBuckets };
