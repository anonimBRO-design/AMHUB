import {
	getActiveChallenge,
	getUserChallengeVote,
	listChallengeEntries,
} from "@/dal/challenges.dal";
import { getApiUser } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();
		const authContext = await getApiUser();
		const currentUserId = authContext?.user?.id ?? null;

		const challenge = await getActiveChallenge(supabase);
		if (!challenge) {
			return apiResponse({ challenge: null, entries: [], userVote: null });
		}

		const [entries, userVote] = await Promise.all([
			listChallengeEntries(supabase, challenge.id),
			currentUserId
				? getUserChallengeVote(supabase, challenge.id, currentUserId)
				: Promise.resolve(null),
		]);

		return apiResponse({ challenge, entries, userVote });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
