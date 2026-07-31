import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { UPLOAD_LIMITS } from "@/lib/api/uploads";
import { prepareAvatarUpload } from "@/dal/uploads.dal";

const avatarUploadRequestSchema = z.object({
	filename: z.string().trim().min(1).max(255),
	content_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
	size: z.number().int().min(1).max(UPLOAD_LIMITS.avatar.maxBytes),
});

export async function POST(request: NextRequest) {
	try {
		const { profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "upload:avatar",
			limit: 5,
			windowMs: 60_000,
			userId: profile.id,
		});

		const body = await validateJson(request, avatarUploadRequestSchema);

		const prepared = await prepareAvatarUpload(profile.id, {
			content_type: body.content_type,
			filename: body.filename,
			size: body.size,
		});

		return apiResponse({
			upload_url: prepared.upload_url,
			token: prepared.token,
			storage_path: prepared.storage_path,
			bucket: prepared.bucket,
			original_filename: prepared.original_filename,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
