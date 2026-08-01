import { likePreset, unlikePreset } from "@/dal/likes.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
	apiErrorResponse,
	apiNoContent,
	apiResponse,
} from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:like",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const result = await likePreset(supabase, id, profile.id);

		return apiResponse(result);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:like",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		await unlikePreset(supabase, id, profile.id);

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
