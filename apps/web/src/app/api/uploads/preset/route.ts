import { preparePresetUpload } from "@/dal/uploads.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { UPLOAD_LIMITS } from "@/lib/api/uploads";
import { validateJson } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const presetUploadRequestSchema = z.discriminatedUnion("upload_type", [
	z.object({
		upload_type: z.literal("xml"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["application/xml", "text/xml", "text/plain"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.presetXml.maxBytes),
	}),
	z.object({
		upload_type: z.literal("qr"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.presetQr.maxBytes),
	}),
	z.object({
		upload_type: z.literal("thumbnail"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.thumbnail.maxBytes),
	}),
	z.object({
		upload_type: z.literal("presetVideo"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.presetVideo.maxBytes),
	}),
]);

export async function POST(request: NextRequest) {
	try {
		const { profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "upload:preset",
			limit: 10,
			windowMs: 60_000,
			userId: profile.id,
		});

		const body = await validateJson(request, presetUploadRequestSchema);

		const prepared = await preparePresetUpload(profile.id, {
			upload_type: body.upload_type,
			content_type: body.content_type,
			filename: body.filename,
			size: body.size,
		});

		return apiResponse({
			upload_url: prepared.upload_url,
			token: prepared.token,
			storage_path: prepared.storage_path,
			bucket: prepared.bucket,
			upload_type: body.upload_type,
			original_filename: prepared.original_filename,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
