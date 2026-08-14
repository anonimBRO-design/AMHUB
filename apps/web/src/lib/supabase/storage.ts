import type { PresetFileType } from "@presethub/types";
import { ApiError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "./server";
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
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUploadUrl(path);

	if (error) {
		console.error(`[SUPABASE STORAGE ERROR] Bucket '${bucket}', Path '${path}':`, error);
		throw new ApiError({
			code: "bad_request",
			message: `Storage signed upload URL creation failed for bucket '${bucket}': ${error.message}`,
			cause: error,
		});
	}

	return data;
}
