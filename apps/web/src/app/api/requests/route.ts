import { createRequest, listRequests } from "@/dal/requests.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const listRequestsQuerySchema = z.object({
	status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createRequestSchema = z.object({
	title: z.string().trim().min(1).max(100),
	description: z.string().trim().min(1).max(2000),
	budget_min: z.number().int().min(0).default(0),
	budget_max: z.number().int().min(1000).max(100000000),
	deadline_at: z.string().datetime().nullable().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const query = validateQuery(
			request.nextUrl.searchParams,
			listRequestsQuerySchema,
		);
		const supabase = await createSupabaseServerClient();
		const items = await listRequests(supabase, query);
		return apiResponse(items);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, createRequestSchema);

		await enforceRateLimit({
			request,
			scope: "requests:create",
			limit: 10,
			windowMs: 60000,
			userId: profile.id,
		});

		const created = await createRequest(supabase, profile.id, {
			title: body.title,
			description: body.description,
			budget_min: body.budget_min,
			budget_max: body.budget_max,
			deadline_at: body.deadline_at,
		});
		return apiCreated(created);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
