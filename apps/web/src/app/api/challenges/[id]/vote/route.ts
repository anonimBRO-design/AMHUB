import { unvoteChallenge, voteChallengeEntry } from "@/dal/challenges.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
	apiCreated,
	apiErrorResponse,
	apiNoContent,
} from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const voteSchema = z.object({
	preset_id: z.string().uuid(),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: challengeId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, voteSchema);

		await enforceRateLimit({
			request,
			scope: "challenge:vote",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		await voteChallengeEntry(supabase, challengeId, body.preset_id, profile.id);
		return apiCreated({ voted_preset_id: body.preset_id });
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: challengeId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "challenge:vote",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		await unvoteChallenge(supabase, challengeId, profile.id);
		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
