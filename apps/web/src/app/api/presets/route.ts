import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

        const { data: preset, error } = await supabase
            .from("presets")
            .insert([{
                ...data,
                creator_id: profile.id,
            }])
            .select()
            .single();

        if (error) throw error;

        return apiCreated(preset);
    } catch (error) {
        return apiErrorResponse(error);
    }
}

const listPresetsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    category: z.string().optional(), // Maps to categories.slug
});

export async function GET(request: NextRequest) {
    try {
        const { page, limit, category } = validateQuery(request.nextUrl.searchParams, listPresetsSchema);
        const supabase = await createSupabaseServerClient();

        const offset = (page - 1) * limit;
        const to = offset + limit - 1;

        let query = supabase
            .from("presets")
            .select("*", { count: "exact" })
            .range(offset, to)
            .order("created_at", { ascending: false });

        if (category) {
            query = query.eq("category", category);
        }

        const { data: presets, count, error } = await query;

        if (error) throw error;

        const total = count ?? 0;
        const hasMore = (offset + (presets?.length ?? 0)) < total;

        return apiResponse(presets ?? [], {
            meta: {
                pagination: {
                    page,
                    limit,
                    offset,
                    total,
                    hasMore,
                },
            },
        });
    } catch (error) {
        return apiErrorResponse(error);
    }
}
