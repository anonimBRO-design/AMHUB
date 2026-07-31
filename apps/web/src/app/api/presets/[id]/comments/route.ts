import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateQuery, validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiCreated, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import { createPaginationMeta } from "@/lib/api/pagination";

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

const commentSelect = `
	id,
	preset_id,
	user_id,
	parent_id,
	body,
	like_count,
	is_pinned,
	is_removed,
	created_at,
	updated_at,
	user:users!comments_user_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { page, limit } = validateQuery(request.nextUrl.searchParams, listCommentsQuerySchema);
		const supabase = await createSupabaseServerClient();

		const { data: preset, error: selectError } = await supabase
			.from("presets")
			.select("id")
			.eq("id", id)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!preset) {
			throw new ApiError({ code: "not_found", message: "Preset was not found." });
		}

		const offset = (page - 1) * limit;
		const to = offset + limit - 1;

		const { data: comments, count, error } = await supabase
			.from("comments")
			.select(commentSelect, { count: "exact" })
			.eq("preset_id", id)
			.eq("is_removed", false)
			.range(offset, to)
			.order("is_pinned", { ascending: false })
			.order("created_at", { ascending: false });

		if (error) throw error;

		const total = count ?? 0;

		return apiResponse(comments ?? [], {
			meta: {
				pagination: createPaginationMeta({
					page,
					limit,
					offset,
					total,
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

		const { data: preset, error: selectError } = await supabase
			.from("presets")
			.select("id")
			.eq("id", id)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!preset) {
			throw new ApiError({ code: "not_found", message: "Preset was not found." });
		}

		const { data: comment, error: insertError } = await supabase
			.from("comments")
			.insert([
				{
					preset_id: id,
					user_id: profile.id,
					body: bodyInput.body,
					parent_id: bodyInput.parent_id ?? null,
				},
			])
			.select(commentSelect)
			.single();

		if (insertError) throw insertError;

		const { count, error: countError } = await supabase
			.from("comments")
			.select("*", { count: "exact", head: true })
			.eq("preset_id", id)
			.eq("is_removed", false);

		if (!countError && count !== null) {
			await supabase.from("presets").update({ comment_count: count }).eq("id", id);
		}

		return apiCreated(comment);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
