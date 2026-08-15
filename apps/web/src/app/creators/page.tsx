import { getCreatorReputation } from "@/dal/reputation.dal";
import { PUBLIC_USER_SELECT } from "@/dal/users.dal";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { PublicCreatorCardData } from "../api/creators/route";
import { CreatorsClient } from "./_components/CreatorsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Jelajahi Kreator & User | AMHUB",
	description:
		"Temukan kreator Alight Motion terbaik, ikuti profil favorit, dan jelajahi konten video & preset menarik di AMHUB.",
};

export default async function CreatorsPage() {
	let initialCreators: PublicCreatorCardData[] = [];
	let initialTotal = 0;

	try {
		const supabase = await createSupabaseServerClient();
		const currentProfile = await getCurrentProfile();
		const currentUserId = currentProfile?.id;

		const {
			data: rawUsers,
			count,
			error,
		} = await supabase
			.from("users")
			.select(PUBLIC_USER_SELECT, { count: "exact" })
			.order("created_at", { ascending: false })
			.range(0, 11);

		if (!error && rawUsers) {
			type RawUser = {
				id: string;
				username: string;
				display_name: string;
				avatar_url: string | null;
				bio: string | null;
				is_verified: boolean;
				created_at: string;
			};

			const usersList = rawUsers as unknown as RawUser[];
			const userIds = usersList.map((u) => u.id);

			const followingSet = new Set<string>();
			if (currentUserId && userIds.length > 0) {
				const { data: followRecords } = await supabase
					.from("follows")
					.select("following_id")
					.eq("follower_id", currentUserId)
					.in("following_id", userIds);

				if (followRecords) {
					for (const f of followRecords) {
						followingSet.add(
							(f as unknown as { following_id: string }).following_id,
						);
					}
				}
			}

			initialCreators = await Promise.all(
				usersList.map(async (u) => {
					const [
						reputationData,
						{ count: followingCount },
						{ count: presetCount },
					] = await Promise.all([
						getCreatorReputation(supabase, u.id),
						supabase
							.from("follows")
							.select("*", { count: "exact", head: true })
							.eq("follower_id", u.id),
						supabase
							.from("presets")
							.select("*", { count: "exact", head: true })
							.eq("creator_id", u.id)
							.eq("status", "published"),
					]);

					return {
						id: u.id,
						username: u.username,
						display_name: u.display_name,
						avatar_url: u.avatar_url,
						bio: u.bio,
						is_verified: u.is_verified,
						created_at: u.created_at,
						follower_count: reputationData.followerCount,
						active_follower_count: reputationData.activeFollowers,
						following_count: followingCount ?? 0,
						preset_count: presetCount ?? 0,
						unique_download_count: reputationData.uniqueDownloads,
						reputation_score: reputationData.reputationScore,
						is_following: currentUserId ? followingSet.has(u.id) : false,
						is_self: currentUserId ? currentUserId === u.id : false,
					};
				}),
			);

			initialTotal = count ?? initialCreators.length;
		}
	} catch (e) {
		console.error("Failed to load initial creators page data:", e);
	}

	return (
		<CreatorsClient
			initialCreators={initialCreators}
			initialTotal={initialTotal}
		/>
	);
}
