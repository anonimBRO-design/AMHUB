import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateQuery, validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiCreated, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPaginationMeta } from "@/lib/api/pagination";
import { createComment, listComments } from "@/dal/comments.dal";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const listCommentsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createCommentSchema = z.object({
	body: z.string().trim().min(1).max(500),
	parent_id: z.string().uuid().nullable().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { page, limit } = validateQuery(request.nextUrl.searchParams, listCommentsQuerySchema);
		const supabase = await createSupabaseServerClient();

		const result = await listComments(supabase, id, { page, limit });

		return apiResponse(result.items, {
			meta: {
				pagination: createPaginationMeta({
					page,
					limit,
					offset: result.offset,
					total: result.total,
				}),
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "comment:create",
			limit: 15,
			windowMs: 60000,
			userId: profile.id,
		});

		const bodyInput = await validateJson(request, createCommentSchema);

		const comment = await createComment(supabase, id, profile.id, bodyInput);

		return apiCreated(comment);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
