import { getCreatorReputation } from "./reputation.dal";
import type { DalClient } from "./types";
import { PUBLIC_USER_SELECT } from "./users.dal";

export type LeaderboardPeriod = "weekly" | "monthly" | "all_time";
export type LeaderboardMetric = "score" | "downloads" | "likes" | "presets";

export interface LeaderboardCreator {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	isVerified: boolean;
	rank: number;
	previousRank?: number;
	totalDownloads: number;
	qualityLikes: number;
	likeCount: number;
	presetCount: number;
	followerCount: number;
	reputationScore: number;
	isFollowing?: boolean;
	isSelf?: boolean;
}

export interface LeaderboardResponse {
	period: LeaderboardPeriod;
	metric: LeaderboardMetric;
	topThree: LeaderboardCreator[];
	rankings: LeaderboardCreator[];
	totalCreators: number;
	updatedAt: string;
}

/**
 * Fetches and ranks creators dynamically for the leaderboard.
 */
export async function getLeaderboardData(
	client: DalClient,
	options: {
		period?: LeaderboardPeriod;
		metric?: LeaderboardMetric;
		currentUserId?: string;
		limit?: number;
	} = {},
): Promise<LeaderboardResponse> {
	const {
		period = "weekly",
		metric = "score",
		currentUserId,
		limit = 50,
	} = options;

	// 1. Fetch creators who have at least 1 published preset
	const { data: creatorRows, error: creatorErr } = await client
		.from("presets")
		.select("creator_id")
		.eq("status", "published");

	if (creatorErr || !creatorRows) {
		console.error("Error fetching creator IDs for leaderboard:", creatorErr);
		throw creatorErr;
	}

	const uniqueCreatorIds = Array.from(
		new Set(
			creatorRows.map(
				(r: any) => (r as unknown as { creator_id: string }).creator_id,
			),
		),
	);

	if (uniqueCreatorIds.length === 0) {
		return {
			period,
			metric,
			topThree: [],
			rankings: [],
			totalCreators: 0,
			updatedAt: new Date().toISOString(),
		};
	}

	// 2. Fetch User Profile Data for Creators
	const { data: usersData } = await client
		.from("users")
		.select(PUBLIC_USER_SELECT)
		.in("id", uniqueCreatorIds);

	type RawUser = {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
		bio: string | null;
		is_verified: boolean;
		created_at: string;
	};

	const rawUsers = (usersData || []) as unknown as RawUser[];

	// 3. Batch viewer follow map
	const followingSet = new Set<string>();
	if (currentUserId && uniqueCreatorIds.length > 0) {
		const { data: followRecords } = await client
			.from("follows")
			.select("following_id")
			.eq("follower_id", currentUserId)
			.in("following_id", uniqueCreatorIds);

		if (followRecords) {
			for (const f of followRecords) {
				followingSet.add(
					(f as unknown as { following_id: string }).following_id,
				);
			}
		}
	}

	// 4. Compute metrics per creator
	const creatorsWithMetrics: LeaderboardCreator[] = await Promise.all(
		rawUsers.map(async (u) => {
			const [
				reputationData,
				{ count: presetCount },
				{ count: followingCount },
			] = await Promise.all([
				getCreatorReputation(client, u.id),
				client
					.from("presets")
					.select("*", { count: "exact", head: true })
					.eq("creator_id", u.id)
					.eq("status", "published"),
				client
					.from("follows")
					.select("*", { count: "exact", head: true })
					.eq("follower_id", u.id),
			]);

			return {
				id: u.id,
				username: u.username,
				displayName: u.display_name || u.username,
				avatarUrl: u.avatar_url,
				bio: u.bio,
				isVerified: Boolean(u.is_verified),
				rank: 0,
				totalDownloads: reputationData.totalDownloads,
				qualityLikes: reputationData.qualityLikes,
				likeCount: reputationData.likeCount,
				presetCount: presetCount ?? 0,
				followerCount: reputationData.followerCount,
				reputationScore: reputationData.reputationScore,
				isFollowing: currentUserId ? followingSet.has(u.id) : false,
				isSelf: currentUserId ? currentUserId === u.id : false,
			};
		}),
	);

	// 5. Sort creators based on selected metric
	creatorsWithMetrics.sort((a, b) => {
		if (metric === "downloads") {
			if (b.totalDownloads !== a.totalDownloads) {
				return b.totalDownloads - a.totalDownloads;
			}
			return b.reputationScore - a.reputationScore;
		}

		if (metric === "likes") {
			if (b.likeCount !== a.likeCount) {
				return b.likeCount - a.likeCount;
			}
			return b.qualityLikes - a.qualityLikes;
		}

		if (metric === "presets") {
			if (b.presetCount !== a.presetCount) {
				return b.presetCount - a.presetCount;
			}
			return b.totalDownloads - a.totalDownloads;
		}

		// Default: Overall Reputation Score
		if (b.reputationScore !== a.reputationScore) {
			return b.reputationScore - a.reputationScore;
		}
		if (b.totalDownloads !== a.totalDownloads) {
			return b.totalDownloads - a.totalDownloads;
		}
		return b.likeCount - a.likeCount;
	});

	// 6. Assign 1-indexed Ranks
	const ranked = creatorsWithMetrics.slice(0, limit).map((c, index) => ({
		...c,
		rank: index + 1,
	}));

	const topThree = ranked.slice(0, 3);
	const rankings = ranked.slice(3);

	return {
		period,
		metric,
		topThree,
		rankings,
		totalCreators: uniqueCreatorIds.length,
		updatedAt: new Date().toISOString(),
	};
}
