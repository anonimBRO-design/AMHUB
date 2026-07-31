import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiErrorResponse } from "@/lib/api/responses";
import {
	UPLOAD_LIMITS,
	prepareUpload,
	storageBuckets,
} from "@/lib/api/uploads";

// ─────────────────────────────────────────────────────────────────────────────
// Request body schema
// ─────────────────────────────────────────────────────────────────────────────

const presetUploadRequestSchema = z.discriminatedUnion("upload_type", [
	z.object({
		upload_type: z.literal("xml"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["application/xml", "text/xml"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.presetXml.maxBytes),
	}),
	z.object({
		upload_type: z.literal("qr"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.presetQr.maxBytes),
	}),
	z.object({
		upload_type: z.literal("thumbnail"),
		filename: z.string().trim().min(1).max(255),
		content_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
		size: z.number().int().min(1).max(UPLOAD_LIMITS.thumbnail.maxBytes),
	}),
]);

type PresetUploadRequest = z.infer<typeof presetUploadRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

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
		const prepared = await resolvePresetUpload(body, profile.id);

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

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

async function resolvePresetUpload(body: PresetUploadRequest, ownerId: string) {
	const fileInput = {
		content_type: body.content_type,
		filename: body.filename,
		size: body.size,
	};

	switch (body.upload_type) {
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
	}
}
