import { createPreset, listPresets } from "@/dal/presets.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const createPresetSchema = z.object({
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
	status: z
		.enum(["pending", "published", "rejected", "removed"])
		.default("published"),
	am_version_min: z.string().optional(),
	am_version_max: z.string().optional(),
	device_support: z.array(z.enum(["android", "ios", "both"])).default(["both"]),
});

export async function POST(request: NextRequest) {
	try {
		const { supabase, user, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:create",
			limit: 10,
			windowMs: 60000,
			userId: profile.id,
		});

		const data = await validateJson(request, createPresetSchema);

		console.log("[PUBLISH AUTH DEBUG]", {
			userId: profile?.id ?? null,
			hasProfile: !!profile,
		});

		console.log("[PUBLISH DB CONTEXT]", {
			authenticatedUserExists: !!user,
			authenticatedUserId: user?.id,
			profileId: profile.id,
			supabaseProjectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
			ownershipColumn: "creator_id",
			ownershipValue: profile.id,
			category: data.category,
			fileType: data.file_type,
			status: data.status,
		});

		const preset = await createPreset(supabase, profile.id, data);

		return apiCreated(preset, {
			headers: { "X-AMHUB-PUBLISH-VERSION": "raw-insert-v2" },
		});
	} catch (error) {
		console.error("[PRESET CREATE API ERROR]", {
			code: (error as any)?.code,
			message: (error as any)?.message,
			details: (error as any)?.details,
			hint: (error as any)?.hint,
			error,
		});
		return apiErrorResponse(error, {
			headers: { "X-AMHUB-PUBLISH-VERSION": "raw-insert-v2" },
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
