import { getRequestById, updateRequestStatus } from "@/dal/requests.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const updateStatusSchema = z.object({
	status: z.enum(["completed", "cancelled"]),
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const supabase = await createSupabaseServerClient();
		const request = await getRequestById(supabase, id);
		return apiResponse(request);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, updateStatusSchema);

		await enforceRateLimit({
			request,
			scope: "requests:update",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		await updateRequestStatus(
			supabase,
			id,
			profile.id,
			body.status,
			Boolean((profile as { is_staff?: boolean }).is_staff),
		);
		return apiResponse({ id, status: body.status });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
