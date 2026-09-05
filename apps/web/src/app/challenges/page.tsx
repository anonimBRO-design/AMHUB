import {
	getActiveChallenge,
	getUserChallengeVote,
	listChallengeEntries,
} from "@/dal/challenges.dal";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ChallengesClient } from "./_components/ChallengesClient";

export const metadata: Metadata = {
	title: "Challenge Mingguan Kreator | AMHUB",
	description:
		"Ikuti challenge preset mingguan AMHUB, kumpulkan vote komunitas, dan menangkan featured homepage.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChallengesPage() {
	const supabase = await createSupabaseServerClient();
	const currentUser = await getCurrentUser();

	const challenge = await getActiveChallenge(supabase);
	const entries = challenge
		? await listChallengeEntries(supabase, challenge.id)
		: [];
	const userVote =
		challenge && currentUser
			? await getUserChallengeVote(supabase, challenge.id, currentUser.id)
			: null;

	return (
		<ChallengesClient
			challenge={challenge}
			entries={entries}
			initialUserVote={userVote}
			isLoggedIn={Boolean(currentUser)}
		/>
	);
}
