import { decideOffer, withdrawOffer } from "@/dal/requests.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
	offerId: z.string().uuid(),
});

const decideSchema = z.object({
	action: z.enum(["accept", "reject", "withdraw"]),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; offerId: string }> },
) {
	try {
		const { id, offerId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, decideSchema);

		await enforceRateLimit({
			request,
			scope: "requests:offer",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const isStaff = Boolean((profile as { is_staff?: boolean }).is_staff);
		if (body.action === "withdraw") {
			await withdrawOffer(supabase, id, offerId, profile.id);
		} else {
			await decideOffer(
				supabase,
				id,
				offerId,
				profile.id,
				body.action,
				isStaff,
			);
		}
		return apiResponse({ id: offerId, action: body.action });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
