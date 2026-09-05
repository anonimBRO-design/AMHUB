import { submitChallengeEntry } from "@/dal/challenges.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const submitEntrySchema = z.object({
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
		const body = await validateJson(request, submitEntrySchema);

		await enforceRateLimit({
			request,
			scope: "challenge:submit",
			limit: 10,
			windowMs: 60000,
			userId: profile.id,
		});

		const entry = await submitChallengeEntry(
			supabase,
			challengeId,
			body.preset_id,
			profile.id,
		);
		return apiCreated(entry);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
