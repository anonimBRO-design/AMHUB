import type { Metadata } from "next";
import { LeaderboardClient } from "./_components/LeaderboardClient";

export const metadata: Metadata = {
	title: "Leaderboard & Top Creators | AMHUB",
	description:
		"View top Alight Motion creators ranked by reputation score, downloads, and community impact.",
};

export default function LeaderboardPage() {
	return <LeaderboardClient />;
}
