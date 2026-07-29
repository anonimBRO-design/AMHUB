import {
	apiErrorResponse,
	apiResponse,
	avatarUploadMetadataSchema,
	normalizeUploadMetadata,
	requireApiProfile,
	uploadLimits,
	validateJson,
} from "@/lib/api";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { user } = await requireApiProfile();
		const input = await validateJson(request, avatarUploadMetadataSchema);

		return apiResponse({
			owner_id: user.id,
			avatar_url: input.avatar_url,
			metadata: normalizeUploadMetadata(
				input.metadata,
				user.id,
				uploadLimits.avatar,
			),
			storage: {
				provider: null,
				status: "metadata_validated",
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
