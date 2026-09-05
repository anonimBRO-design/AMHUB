import { createPreset, listPresets } from "@/dal/presets.dal";
import { awardUserXp } from "@/dal/users.dal";
import { normalizeAmVersion } from "@/lib/am-version";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { XP_REWARDS } from "@/lib/gamification/xp";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const amVersionField = (label: string) =>
	z
		.string()
		.trim()
		.regex(/^\d{1,3}(\.\d{1,3}){0,2}$/, `${label}: format angka, cth. 5.0.5`)
		.transform((v) => normalizeAmVersion(v) ?? v)
		.optional();

const createPresetSchema = z
	.object({
		slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
		title: z.string().min(1).max(100),
		description: z.string().max(2000).optional(),
		thumbnail_url: z.string().min(1),
		preview_video_url: z.string().min(1).optional(),
		file_type: z.enum(["xml", "qr", "link", "google_drive", "alight_creative"]),
		file_types: z.array(z.string()).optional(),
		file_url: z.string().min(1).optional(),
		am_link: z.string().min(1).optional(),
		category: z.string(),
		style: z.array(z.string()).max(10).default([]),
		tags: z.array(z.string()).max(10).default([]),
		difficulty: z
			.enum(["beginner", "intermediate", "advanced"])
			.default("beginner"),
		status: z.enum(["pending", "published"]).default("published"),
		price: z.number().min(0).max(10000000).default(0),
		is_paid: z.boolean().default(false),
		currency: z.string().default("IDR"),
		commercial_price: z.number().min(0).max(10000000).default(0),
		am_version_min: amVersionField("Versi minimal"),
		am_version_max: amVersionField("Versi maksimal"),
		device_support: z
			.array(z.enum(["android", "ios", "both"]))
			.default(["both"]),
	})
	.superRefine((data, ctx) => {
		if (
			data.am_version_min &&
			data.am_version_max &&
			data.am_version_max < data.am_version_min
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["am_version_max"],
				message: "Versi maksimal harus >= versi minimal.",
			});
		}
	});

export async function POST(request: NextRequest) {
	const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	try {
		console.log(`[PUBLISH REQUEST DEBUG] [${requestId}]`, {
			buildVersion: "raw-insert-v2",
			requestMethod: request.method,
			url: request.url,
		});

		const { supabase, user, profile } = await requireApiProfile();

		console.log(`[PUBLISH AUTH DEBUG] [${requestId}]`, {
			authenticatedUserExists: !!user,
			authenticatedUserId: user?.id,
			profileId: profile?.id ?? null,
			hasProfile: !!profile,
		});

		await enforceRateLimit({
			request,
			scope: "preset:create",
			limit: 10,
			windowMs: 60000,
			userId: profile.id,
		});

		const data = await validateJson(request, createPresetSchema);

		console.log(`[PUBLISH ROUTE PATH] [${requestId}]`, {
			payloadCreatorId: profile.id,
			payloadCategory: data.category,
			payloadStatus: data.status,
			payloadSlug: data.slug,
			fileType: data.file_type,
		});

		const preset = await createPreset(supabase, profile.id, data, requestId);

		// Award creator XP for uploading a preset
		awardUserXp(
			supabase,
			profile.id,
			XP_REWARDS.UPLOAD_PRESET,
			"Upload preset",
		).catch((err) => {
			console.error("[XP_AWARD_ERROR] Failed to award upload XP:", err);
		});

		return apiCreated(preset, {
			headers: {
				"X-AMHUB-PUBLISH-VERSION": "raw-insert-v2",
				"X-AMHUB-REQUEST-ID": requestId,
			},
		});
	} catch (error) {
		console.error(`[PRESET CREATE API ERROR] [${requestId}]`, {
			code: (error as any)?.code,
			message: (error as any)?.message,
			details: (error as any)?.details,
			hint: (error as any)?.hint,
			error,
		});
		return apiErrorResponse(error, {
			headers: {
				"X-AMHUB-PUBLISH-VERSION": "raw-insert-v2",
				"X-AMHUB-REQUEST-ID": requestId,
			},
		});
	}
}

const listPresetsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	category: z.string().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { page, limit, category } = validateQuery(
			request.nextUrl.searchParams,
			listPresetsSchema,
		);
		const supabase = await createSupabaseServerClient();

		const result = await listPresets(supabase, { page, limit, category });

		return apiResponse(result.items, {
			meta: {
				pagination: {
					page,
					limit,
					offset: result.offset,
					total: result.total,
					hasMore: result.hasMore,
				},
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
