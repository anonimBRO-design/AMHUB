/**
 * Active Follower & User Legitimacy Scoring Engine.
 *
 * Implements a continuous trust-scoring function rather than a brittle binary rule.
 * Weights are calculated using multi-signal heuristics:
 * - Account maturity / age
 * - Meaningful user activity (downloads, likes, bookmarks, profile completion)
 * - Anti-spam velocity checks (mass following, excessive rapid actions)
 */

export interface UserActivitySignals {
	userId: string;
	createdAt: string | Date;
	hasAvatar: boolean;
	hasBio: boolean;
	downloadCount: number;
	likeCount: number;
	bookmarkCount: number;
	presetCount: number;
	followingCount: number;
	isSuspicious?: boolean;
}

export interface FollowerTrustEvaluation {
	userId: string;
	weight: number; // 0.0 to 1.0
	isActive: boolean; // weight >= 0.5
	signals: {
		ageScore: number;
		activityScore: number;
		profileScore: number;
		penaltyScore: number;
	};
}

/**
 * Calculates a legitimacy trust weight (0.0 to 1.0) for a given follower.
 */
export function evaluateFollowerTrust(
	user: UserActivitySignals,
): FollowerTrustEvaluation {
	if (user.isSuspicious) {
		return {
			userId: user.userId,
			weight: 0,
			isActive: false,
			signals: {
				ageScore: 0,
				activityScore: 0,
				profileScore: 0,
				penaltyScore: 1,
			},
		};
	}

	const createdDate = new Date(user.createdAt);
	const now = new Date();
	const ageInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
	const ageInDays = ageInHours / 24;

	// 1. Account Age Score (0.0 to 0.4)
	let ageScore = 0.1;
	if (ageInDays >= 30) {
		ageScore = 0.4;
	} else if (ageInDays >= 7) {
		ageScore = 0.3;
	} else if (ageInHours >= 24) {
		ageScore = 0.2;
	}

	// 2. Profile Completeness Score (0.0 to 0.2)
	let profileScore = 0;
	if (user.hasAvatar) profileScore += 0.1;
	if (user.hasBio) profileScore += 0.1;

	// 3. Platform Engagement / Real Activity Score (0.0 to 0.4)
	let activityScore = 0;
	if (user.downloadCount > 0) activityScore += 0.15;
	if (user.likeCount > 0 || user.bookmarkCount > 0) activityScore += 0.15;
	if (user.presetCount > 0) activityScore += 0.1;

	// 4. Abuse / Mass-Follow Penalty (-0.5 to 0.0)
	let penaltyScore = 0;
	// Brand new accounts that follow excessive number of users without activity
	if (ageInDays < 3 && user.followingCount > 30 && user.downloadCount === 0) {
		penaltyScore += 0.4;
	} else if (
		user.followingCount > 100 &&
		user.downloadCount === 0 &&
		user.presetCount === 0
	) {
		penaltyScore += 0.3;
	}

	// Combine scores: Raw Trust = age + profile + activity - penalty
	const rawWeight = ageScore + profileScore + activityScore - penaltyScore;
	const weight = Math.max(0, Math.min(1.0, Number(rawWeight.toFixed(2))));
	const isActive = weight >= 0.5;

	return {
		userId: user.userId,
		weight,
		isActive,
		signals: {
			ageScore,
			activityScore,
			profileScore,
			penaltyScore,
		},
	};
}

/**
 * Calculates aggregate active followers count for a creator from an array of follower signals.
 */
export function calculateAggregateActiveFollowers(
	followers: UserActivitySignals[],
): {
	rawCount: number;
	activeCount: number;
	weightedScore: number;
} {
	const rawCount = followers.length;
	let weightedScore = 0;
	let activeCount = 0;

	for (const f of followers) {
		const evalResult = evaluateFollowerTrust(f);
		weightedScore += evalResult.weight;
		if (evalResult.isActive) {
			activeCount += 1;
		}
	}

	return {
		rawCount,
		activeCount,
		weightedScore: Number(weightedScore.toFixed(2)),
	};
}
