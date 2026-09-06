import {
	UPLOAD_LIMITS,
	prepareUpload,
	storageBuckets,
} from "@/lib/api/uploads";

export interface UploadFileInput {
	content_type: string;
	filename: string;
	size: number;
}

export interface PresetUploadInput extends UploadFileInput {
	upload_type: "xml" | "qr" | "thumbnail" | "presetVideo";
}

export async function prepareAvatarUpload(
	ownerId: string,
	input: UploadFileInput,
) {
	if (!input.filename || input.filename.trim().length === 0) {
		throw new Error("Filename is required for avatar upload.");
	}
	if (!input.content_type) {
		throw new Error("Content type is required for avatar upload.");
	}
	if (!input.size || input.size <= 0) {
		throw new Error("File size must be greater than 0.");
	}
	return prepareUpload(
		storageBuckets.avatars,
		ownerId,
		input,
		UPLOAD_LIMITS.avatar,
	);
}

export async function preparePresetUpload(
	ownerId: string,
	input: PresetUploadInput,
) {
	const fileInput = {
		content_type: input.content_type,
		filename: input.filename,
		size: input.size,
	};

	switch (input.upload_type) {
		case "xml":
			return prepareUpload(
				storageBuckets.presetFiles,
				ownerId,
				fileInput,
				UPLOAD_LIMITS.presetXml,
			);
		case "qr":
			return prepareUpload(
				storageBuckets.presetFiles,
				ownerId,
				fileInput,
				UPLOAD_LIMITS.presetQr,
			);
		case "thumbnail":
			return prepareUpload(
				storageBuckets.thumbnails,
				ownerId,
				fileInput,
				UPLOAD_LIMITS.thumbnail,
			);
		case "presetVideo":
			return prepareUpload(
				storageBuckets.presetVideos,
				ownerId,
				fileInput,
				UPLOAD_LIMITS.presetVideo,
			);
		default:
			throw new Error(`Unsupported upload_type: ${input.upload_type}`);
	}
}
