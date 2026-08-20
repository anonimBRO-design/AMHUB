import {
	type LeaderboardResponse,
	getLeaderboardData,
} from "@/dal/leaderboard.dal";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { LeaderboardClient } from "./_components/LeaderboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Creator Leaderboard & Top Charts | AMHUB",
	description:
		"Lihat peringkat creator Alight Motion terbaik di AMHUB. Temukan editor terpopuler, preset paling banyak didownload, dan dukung kreator favoritmu.",
};

export default async function LeaderboardPage() {
	let initialData: LeaderboardResponse = {
		period: "weekly",
		metric: "score",
		topThree: [],
		rankings: [],
		totalCreators: 0,
		updatedAt: new Date().toISOString(),
	};

	try {
		const supabase = await createSupabaseServerClient();
		const currentProfile = await getCurrentProfile();
		const currentUserId = currentProfile?.id;

		initialData = await getLeaderboardData(supabase, {
			period: "weekly",
			metric: "score",
			currentUserId,
			limit: 50,
		});
	} catch (error) {
		console.error("Failed to load initial leaderboard data:", error);
	}

	return <LeaderboardClient initialData={initialData} />;
}
