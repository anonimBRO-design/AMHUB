import { ApiError } from "@/lib/api/errors";
import type { PresetFileType } from "@presethub/types";
import {
	createSupabaseServerClient,
	createSupabaseServiceClient,
} from "./server";
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

/**
 * Creates a signed upload URL for a given storage bucket and path.
 * Uses the service-role client directly because:
 * 1. This function only runs server-side (API routes / server actions).
 * 2. The service-role client bypasses RLS, which is required for
 *    createSignedUploadUrl to insert the upload token row in storage.objects.
 * 3. The resulting signed URL is short-lived and scoped to one object path,
 *    so it is safe to return to the authenticated client.
 */
export async function createSignedUploadUrl(
	bucket: StorageBucket,
	path: string,
) {
	const serviceClient = createSupabaseServiceClient();

	console.log(
		`[STORAGE SIGNED UPLOAD] Creating signed URL: bucket='${bucket}', path='${path}'`,
	);

	const { data, error } = await serviceClient.storage
		.from(bucket)
		.createSignedUploadUrl(path);

	if (error) {
		console.error(
			`[SUPABASE STORAGE ERROR] Bucket '${bucket}', Path '${path}':`,
			error,
		);
		throw new ApiError({
			code: "bad_request",
			message: `Storage signed upload URL creation failed for bucket '${bucket}': ${error.message}`,
			cause: error,
		});
	}

	return data;
}
