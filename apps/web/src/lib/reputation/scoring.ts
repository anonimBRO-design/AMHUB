/**
 * AMHUB Deterministic Creator Reputation & Leaderboard Scoring Engine.
 *
 * Implements the finalized multi-signal formula:
 * Creator Score =
 *     (Unique Downloads × 3)
 *   + (Quality Likes × 2)
 *   + (Active Followers × 0.5)
 *   + Account Age Bonus
 *   - Suspicious Activity Penalty
 */

export interface CreatorReputationInput {
	uniqueDownloads: number;
	qualityLikes: number;
	activeFollowers: number; // weighted or count of active followers
	createdAt: string | Date;
	suspiciousActivityPenalty?: number;
}

export interface CreatorReputationResult {
	totalScore: number;
	breakdown: {
		uniqueDownloads: number;
		uniqueDownloadsPoints: number;
		qualityLikes: number;
		qualityLikesPoints: number;
		activeFollowers: number;
		activeFollowersPoints: number;
		accountAgeDays: number;
		accountAgeBonus: number;
		suspiciousPenalty: number;
	};
}

// Configurable weights and caps
export const REPUTATION_CONFIG = {
	WEIGHT_UNIQUE_DOWNLOADS: 3.0,
	WEIGHT_QUALITY_LIKES: 2.0,
	WEIGHT_ACTIVE_FOLLOWERS: 0.5,
	// Account age: +0.1 point per 30 days, capped at 10.0 points maximum
	AGE_BONUS_PER_30_DAYS: 0.1,
	MAX_AGE_BONUS: 10.0,
} as const;

/**
 * Computes the account age bonus points in a smooth, bounded manner.
 */
export function calculateAccountAgeBonus(createdAt: string | Date): {
	ageInDays: number;
	bonus: number;
} {
	const created = new Date(createdAt);
	const now = new Date();
	const diffMs = Math.max(0, now.getTime() - created.getTime());
	const ageInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	const periodsOf30Days = ageInDays / 30;
	const rawBonus = periodsOf30Days * REPUTATION_CONFIG.AGE_BONUS_PER_30_DAYS;
	const bonus = Math.min(
		REPUTATION_CONFIG.MAX_AGE_BONUS,
		Number(rawBonus.toFixed(2)),
	);

	return { ageInDays, bonus };
}

/**
 * Calculates deterministic creator reputation score.
 */
export function calculateCreatorReputationScore(
	input: CreatorReputationInput,
): CreatorReputationResult {
	const uniqueDownloads = Math.max(0, input.uniqueDownloads || 0);
	const qualityLikes = Math.max(0, input.qualityLikes || 0);
	const activeFollowers = Math.max(0, input.activeFollowers || 0);
	const suspiciousPenalty = Math.max(0, input.suspiciousActivityPenalty || 0);

	const { ageInDays, bonus: accountAgeBonus } = calculateAccountAgeBonus(
		input.createdAt,
	);

	const uniqueDownloadsPoints =
		uniqueDownloads * REPUTATION_CONFIG.WEIGHT_UNIQUE_DOWNLOADS;
	const qualityLikesPoints =
		qualityLikes * REPUTATION_CONFIG.WEIGHT_QUALITY_LIKES;
	const activeFollowersPoints =
		activeFollowers * REPUTATION_CONFIG.WEIGHT_ACTIVE_FOLLOWERS;

	const rawScore =
		uniqueDownloadsPoints +
		qualityLikesPoints +
		activeFollowersPoints +
		accountAgeBonus -
		suspiciousPenalty;

	const totalScore = Math.max(0, Number(rawScore.toFixed(2)));

	return {
		totalScore,
		breakdown: {
			uniqueDownloads,
			uniqueDownloadsPoints: Number(uniqueDownloadsPoints.toFixed(2)),
			qualityLikes,
			qualityLikesPoints: Number(qualityLikesPoints.toFixed(2)),
			activeFollowers,
			activeFollowersPoints: Number(activeFollowersPoints.toFixed(2)),
			accountAgeDays: ageInDays,
			accountAgeBonus,
			suspiciousPenalty,
		},
	};
}
