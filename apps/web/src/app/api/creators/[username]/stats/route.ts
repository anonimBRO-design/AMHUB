import { getCreatorReputation } from "@/dal/reputation.dal";
import { getUserByUsername } from "@/dal/users.dal";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreatorStatsResponse } from "@presethub/types";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3)
		.max(24)
		.regex(/^[a-zA-Z0-9_]+$/),
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		const { username } = validateRouteParams(await params, routeParamsSchema);
		const supabase = await createSupabaseServerClient();

		const user = await getUserByUsername(supabase, username);
		if (!user) {
			throw new ApiError({
				code: "not_found",
				message: "Creator not found.",
			});
		}

		const rep = await getCreatorReputation(supabase, user.id);

		const response: CreatorStatsResponse = {
			creator_id: user.id,
			total_downloads: rep.totalDownloads,
			unique_downloads: rep.uniqueDownloads,
			like_count: rep.likeCount,
			quality_likes: rep.qualityLikes,
			follower_count: rep.followerCount,
			active_followers: rep.activeFollowers,
			reputation_score: rep.reputationScore,
			breakdown: {
				unique_downloads: rep.scoreBreakdown.uniqueDownloads,
				quality_likes: rep.scoreBreakdown.qualityLikes,
				active_followers: rep.scoreBreakdown.activeFollowers,
				account_age_bonus: rep.scoreBreakdown.accountAgeBonus,
				suspicious_penalty: rep.scoreBreakdown.suspiciousPenalty,
				total_score: rep.reputationScore,
			},
		};

		return apiResponse(response);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
