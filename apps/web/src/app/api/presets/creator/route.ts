import { listCreatorPresetsPaginated } from "@/dal/presets.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateQuery } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const listCreatorPresetsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(12),
	status: z.string().optional(),
	search: z.string().optional(),
	sort: z.enum(["newest", "oldest", "downloads", "likes", "views"]).optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const filter = validateQuery(
			request.nextUrl.searchParams,
			listCreatorPresetsSchema,
		);

		const result = await listCreatorPresetsPaginated(
			supabase,
			profile.id,
			filter,
		);

		return apiResponse(result.items, {
			meta: {
				pagination: {
					page: result.page,
					limit: result.limit,
					offset: (result.page - 1) * result.limit,
					total: result.total,
					hasMore: result.hasMore,
				},
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
