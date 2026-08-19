import { listPublishedPresets } from "@/dal/presets.dal";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const searchSchema = z.object({
	q: z.string().trim().optional(),
	category: z.string().trim().optional(),
	difficulty: z.string().trim().optional(),
	fileType: z.string().trim().optional(),
	tags: z.string().transform((val) => val.split(",").map(t => t.trim()).filter(Boolean)).optional(),
	sort: z.string().trim().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(24),
	page: z.coerce.number().int().min(1).default(1),
});

/**
 * GET /api/search
 * Search endpoint for presets with filter options.
 */
export async function GET(request: NextRequest) {
	try {
		const qParam = request.nextUrl.searchParams.get("q") || undefined;
		const categoryParam = request.nextUrl.searchParams.get("category") || undefined;
		const difficultyParam = request.nextUrl.searchParams.get("difficulty") || undefined;
		const fileTypeParam = request.nextUrl.searchParams.get("fileType") || undefined;
		const tagsParam = request.nextUrl.searchParams.get("tags") || undefined;
		const sortParam = request.nextUrl.searchParams.get("sort") || undefined;
		const limitParam = request.nextUrl.searchParams.get("limit") || undefined;
		const pageParam = request.nextUrl.searchParams.get("page") || undefined;

		const parsed = searchSchema.safeParse({
			q: qParam,
			category: categoryParam,
			difficulty: difficultyParam,
			fileType: fileTypeParam,
			tags: tagsParam,
			sort: sortParam,
			limit: limitParam,
			page: pageParam,
		});

		if (!parsed.success) {
			return apiResponse({ error: "Invalid search query parameters" }, 400);
		}

		const params = parsed.data;
		const supabase = await createSupabaseServerClient();

		const items = await listPublishedPresets(supabase, {
			search: params.q,
			category: params.category,
			difficulty: params.difficulty,
			fileType: params.fileType as any,
			tags: params.tags,
			sort: params.sort as any,
			limit: params.limit,
			page: params.page,
		});

		return apiResponse(items);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
