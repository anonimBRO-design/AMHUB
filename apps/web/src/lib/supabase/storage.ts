import type { PresetFileType } from "@presethub/types";
import { createSupabaseServerClient } from "./client";

export const storageBuckets = {
	avatars: "avatars",
	banners: "banners",
	presetFiles: "preset-files",
	presetMedia: "preset-media",
} as const;

export type StorageBucket =
	(typeof storageBuckets)[keyof typeof storageBuckets];

export function getPresetStorageBucket(
	fileType: PresetFileType,
): StorageBucket {
	if (fileType === "qr") {
		return storageBuckets.presetMedia;
	}

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
		throw error;
	}

	return data;
}
