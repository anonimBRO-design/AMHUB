import type { PresetFileType } from "@presethub/types";
import { ApiError } from "@/lib/api/errors";
import { createSupabaseServerClient, createSupabaseServiceClient } from "./server";
export { resolveStorageUrl } from "./storage-url";

export const storageBuckets = {
	avatars: "avatars",
	thumbnails: "thumbnails",
	presetFiles: "preset-files",
	presetVideos: "preset-videos",
} as const;

export type StorageBucket =
	(typeof storageBuckets)[keyof typeof storageBuckets];

export function getPresetStorageBucket(
	fileType: PresetFileType,
): StorageBucket {
	void fileType;
	return storageBuckets.presetFiles;
}

export async function ensureStorageBucket(bucket: StorageBucket): Promise<void> {
	try {
		const serviceClient = createSupabaseServiceClient();
		const { data: bucketInfo, error: getError } = await serviceClient.storage.getBucket(bucket);

		if (getError || !bucketInfo) {
			console.log(`[SUPABASE STORAGE] Bucket '${bucket}' not found. Initializing bucket...`);
			const allowedMimeTypes =
				bucket === "preset-videos"
					? [
							"video/mp4",
							"video/webm",
							"video/quicktime",
							"video/x-m4v",
							"video/m4v",
							"video/x-matroska",
						]
					: bucket === "thumbnails"
						? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
						: bucket === "avatars"
							? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
							: undefined;

			const { error: createError } = await serviceClient.storage.createBucket(bucket, {
				public: true,
				fileSizeLimit: bucket === "preset-videos" ? 104857600 : 10485760,
				allowedMimeTypes,
			});

			if (createError && !createError.message?.includes("already exists")) {
				console.error(`[SUPABASE STORAGE BUCKET CREATE ERROR] Bucket '${bucket}':`, createError);
			} else {
				console.log(`[SUPABASE STORAGE] Bucket '${bucket}' initialized successfully.`);
			}
		}
	} catch (err) {
		console.warn(`[SUPABASE STORAGE BUCKET CHECK WARNING] Could not verify bucket '${bucket}':`, err);
	}
}

export async function createSignedDownloadUrl(path: string, expiresIn = 60) {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.storage
		.from(storageBuckets.presetFiles)
		.createSignedUrl(path, expiresIn);

	if (error) {
		throw error;
	}

	return data.signedUrl;
}

export async function createSignedUploadUrl(
	bucket: StorageBucket,
	path: string,
) {
	// Auto-ensure storage bucket exists on Supabase project
	await ensureStorageBucket(bucket);

	let supabase;
	try {
		supabase = await createSupabaseServerClient();
	} catch {
		supabase = createSupabaseServiceClient();
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUploadUrl(path);

	if (error) {
		console.warn(
			`[SUPABASE STORAGE SIGNED URL RETRY] Retrying with service client for bucket '${bucket}', Path '${path}':`,
			error.message,
		);
		const serviceClient = createSupabaseServiceClient();
		const { data: serviceData, error: serviceError } = await serviceClient.storage
			.from(bucket)
			.createSignedUploadUrl(path);

		if (serviceError) {
			console.error(
				`[SUPABASE STORAGE ERROR] Bucket '${bucket}', Path '${path}':`,
				serviceError,
			);
			throw new ApiError({
				code: "bad_request",
				message: `Storage signed upload URL creation failed for bucket '${bucket}': ${serviceError.message}`,
				cause: serviceError,
			});
		}

		return serviceData;
	}

	return data;
}
