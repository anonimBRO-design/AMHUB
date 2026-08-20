import {
	type LeaderboardMetric,
	type LeaderboardPeriod,
	getLeaderboardData,
} from "@/dal/leaderboard.dal";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const period = (searchParams.get("period") || "weekly") as LeaderboardPeriod;
		const metric = (searchParams.get("metric") || "score") as LeaderboardMetric;
		const limit = Math.min(
			100,
			Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10)),
		);

		const supabase = await createSupabaseServerClient();
		const currentProfile = await getCurrentProfile();
		const currentUserId = currentProfile?.id;

		const data = await getLeaderboardData(supabase, {
			period,
			metric,
			currentUserId,
			limit,
		});

		return apiResponse(data, {
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
			},
		});
	} catch (error) {
		console.error("Leaderboard API error:", error);
		return apiErrorResponse(error);
	}
}
