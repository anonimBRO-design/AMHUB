import {
	apiErrorResponse,
	apiResponse,
	normalizeUploadMetadata,
	presetFileValidationOptions,
	presetUploadMetadataSchema,
	requireApiProfile,
	uploadLimits,
	validateJson,
} from "@/lib/api";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { user } = await requireApiProfile();
		const input = await validateJson(request, presetUploadMetadataSchema);

		return apiResponse({
			owner_id: user.id,
			file_type: input.file_type,
			thumbnail_url: input.thumbnail_url,
			file_url: input.file_url ?? null,
			am_link: input.am_link ?? null,
			metadata: {
				thumbnail: normalizeUploadMetadata(
					input.metadata?.thumbnail,
					user.id,
					uploadLimits.thumbnail,
				),
				preset_file:
					input.file_type === "link"
						? null
						: normalizeUploadMetadata(
								input.metadata?.preset_file,
								user.id,
								presetFileValidationOptions(input.file_type),
							),
			},
			storage: {
				provider: null,
				status: "metadata_validated",
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
