import { getCreatorAnalytics } from "@/dal/presets.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateQuery } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const analyticsQuerySchema = z.object({
	timeframe: z.enum(["7d", "30d", "90d"]).default("7d"),
});

export async function GET(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const { timeframe } = validateQuery(
			request.nextUrl.searchParams,
			analyticsQuerySchema,
		);

		const analytics = await getCreatorAnalytics(
			supabase,
			profile.id,
			timeframe,
		);

		return apiResponse(analytics);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
