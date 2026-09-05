import { listOffers, submitOffer } from "@/dal/requests.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const submitOfferSchema = z.object({
	price: z.number().int().min(1000).max(100000000),
	message: z.string().trim().max(1000).optional(),
	eta_days: z.number().int().min(1).max(90).optional(),
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();
		// RLS only reveals offers to request owner, offering creator, or staff
		const offers = authContext?.user?.id ? await listOffers(supabase, id) : [];
		return apiResponse(offers);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, submitOfferSchema);

		await enforceRateLimit({
			request,
			scope: "requests:offer",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const offer = await submitOffer(supabase, id, profile.id, {
			price: body.price,
			message: body.message,
			eta_days: body.eta_days,
		});
		return apiCreated(offer);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
