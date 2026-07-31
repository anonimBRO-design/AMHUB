import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPreset, listPresets } from "@/dal/presets.dal";

const createPresetSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(100),
    description: z.string().max(2000).optional(),
    thumbnail_url: z.string().url(),
    preview_video_url: z.string().url().optional(),
    file_type: z.enum(["xml", "qr", "link"]),
    file_url: z.string().url().optional(),
    am_link: z.string().url().optional(),
    category: z.string(),
    style: z.array(z.string()).max(10).default([]),
    tags: z.array(z.string()).max(10).default([]),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    am_version_min: z.string().optional(),
    am_version_max: z.string().optional(),
    device_support: z.array(z.enum(["android", "ios", "both"])).default(["both"]),
});

export async function POST(request: NextRequest) {
    try {
        const { supabase, profile } = await requireApiProfile();

        await enforceRateLimit({
            request,
            scope: "preset:create",
            limit: 10,
            windowMs: 60000,
            userId: profile.id,
        });

        const data = await validateJson(request, createPresetSchema);

        const preset = await createPreset(supabase, profile.id, data);

        return apiCreated(preset);
    } catch (error) {
        return apiErrorResponse(error);
    }
}

const listPresetsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    category: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { page, limit, category } = validateQuery(request.nextUrl.searchParams, listPresetsSchema);
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
