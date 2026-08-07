import { listTags } from "@/dal/tags.dal";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateQuery } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const listTagsSchema = z.object({
	search: z.string().trim().max(40).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * GET /api/tags
 * Tag suggestions for the upload wizard / explore filters (ADR-037).
 * Public, no auth, no rate limit (read-only taxonomy, small dataset).
 */
export async function GET(request: NextRequest) {
	try {
		const { search, limit } = validateQuery(
			request.nextUrl.searchParams,
			listTagsSchema,
		);
		const supabase = await createSupabaseServerClient();

		const items = await listTags(supabase, { search, limit });

		return apiResponse(items);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
