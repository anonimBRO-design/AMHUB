import {
	type UserActivitySignals,
	calculateAggregateActiveFollowers,
	evaluateFollowerTrust,
} from "@/lib/anti-abuse/active-follower";
import {
	type CreatorReputationResult,
	calculateCreatorReputationScore,
} from "@/lib/reputation/scoring";
import type { DalClient } from "./types";

export interface CreatorReputationData {
	creatorId: string;
	totalDownloads: number;
	uniqueDownloads: number;
	likeCount: number;
	qualityLikes: number;
	followerCount: number;
	activeFollowers: number;
	reputationScore: number;
	scoreBreakdown: CreatorReputationResult["breakdown"];
}

/**
 * Calculates complete reputation & anti-abuse analytics for a single creator.
 */
export async function getCreatorReputation(
	client: DalClient,
	creatorId: string,
): Promise<CreatorReputationData> {
	// 1. Fetch Creator's account data
	const { data: creatorUser } = await client
		.from("users")
		.select("id, created_at, avatar_url, bio")
		.eq("id", creatorId)
		.maybeSingle();

	const createdAt =
		(creatorUser as { created_at?: string } | null)?.created_at ||
		new Date().toISOString();

	// 2. Fetch Creator's published presets and download counters
	const { data: presetsData } = await client
		.from("presets")
		.select("id, download_count, like_count")
		.eq("creator_id", creatorId)
		.eq("status", "published");

	const presets = (presetsData || []) as unknown as {
		id: string;
		download_count: number;
		like_count: number;
	}[];

	const presetIds = presets.map((p) => p.id);

	let totalDownloads = 0;
	let totalRawLikes = 0;

	for (const p of presets) {
		totalDownloads += p.download_count ?? 0;
		totalRawLikes += p.like_count ?? 0;
	}
	const uniqueDownloads = totalDownloads;

	// 3. Evaluate Quality Likes
	let qualityLikes = 0;
	if (presetIds.length > 0) {
		const { data: likesData } = await client
			.from("preset_likes")
			.select("user_id, users (id, created_at, avatar_url, bio)")
			.in("preset_id", presetIds);

		const likeRows = (likesData || []) as unknown as {
			user_id: string;
			users: {
				id: string;
				created_at: string;
				avatar_url: string | null;
				bio: string | null;
			} | null;
		}[];

		for (const l of likeRows) {
			if (!l.users) {
				qualityLikes += 0.5; // fallback
				continue;
			}
			const userSignal: UserActivitySignals = {
				userId: l.users.id,
				createdAt: l.users.created_at,
				hasAvatar: Boolean(l.users.avatar_url),
				hasBio: Boolean(l.users.bio),
				downloadCount: 1,
				likeCount: 1,
				bookmarkCount: 0,
				presetCount: 0,
				followingCount: 1,
			};
			const evalResult = evaluateFollowerTrust(userSignal);
			qualityLikes += evalResult.weight;
		}
	}
	qualityLikes = Number(qualityLikes.toFixed(2));

	// 4. Evaluate Active Followers
	const { data: followersData } = await client
		.from("follows")
		.select(
			"follower_id, users!follows_follower_id_fkey (id, created_at, avatar_url, bio)",
		)
		.eq("following_id", creatorId);

	const followerRows = (followersData || []) as unknown as {
		follower_id: string;
		users: {
			id: string;
			created_at: string;
			avatar_url: string | null;
			bio: string | null;
		} | null;
	}[];

	const followerSignals: UserActivitySignals[] = followerRows.map((f) => ({
		userId: f.follower_id,
		createdAt: f.users?.created_at || new Date().toISOString(),
		hasAvatar: Boolean(f.users?.avatar_url),
		hasBio: Boolean(f.users?.bio),
		downloadCount: 1,
		likeCount: 0,
		bookmarkCount: 0,
		presetCount: 0,
		followingCount: 1,
	}));

	const followerStats = calculateAggregateActiveFollowers(followerSignals);
	const activeFollowers = followerStats.weightedScore;

	// 5. Calculate Final Deterministic Score
	const repResult = calculateCreatorReputationScore({
		uniqueDownloads,
		qualityLikes,
		activeFollowers,
		createdAt,
	});

	return {
		creatorId,
		totalDownloads,
		uniqueDownloads,
		likeCount: totalRawLikes,
		qualityLikes,
		followerCount: followerRows.length,
		activeFollowers: followerStats.activeCount,
		reputationScore: repResult.totalScore,
		scoreBreakdown: repResult.breakdown,
	};
}
