/**
 * AMHUB Gamification & XP Engine
 * Based on Product Specification §19 (XP System & Levels)
 */

export const XP_REWARDS = {
	UPLOAD_PRESET: 100,
	FIRST_UPLOAD_BONUS: 50,
	PRESET_DOWNLOADED: 5,
	PRESET_LIKED: 5,
	PRESET_COMMENTED: 10,
	PROFILE_COMPLETE: 50,
} as const;

export interface LevelTier {
	level: number;
	xpRequired: number;
	title: string;
}

export const LEVEL_TIERS: readonly LevelTier[] = [
	{ level: 1, xpRequired: 0, title: "Newcomer" },
	{ level: 2, xpRequired: 100, title: "Creator" },
	{ level: 3, xpRequired: 500, title: "Editor" },
	{ level: 4, xpRequired: 1500, title: "Artist" },
	{ level: 5, xpRequired: 5000, title: "Professional" },
	{ level: 6, xpRequired: 15000, title: "Expert" },
	{ level: 7, xpRequired: 40000, title: "Legend" },
	{ level: 8, xpRequired: 100000, title: "Icon" },
] as const;

export interface UserLevelInfo {
	level: number;
	title: string;
	currentXp: number;
	currentTierXp: number;
	nextTierXp: number;
	progressPercent: number;
}

/**
 * Calculates level, title, and progress percentage towards the next level from total XP.
 */
export function calculateLevelFromXp(xp: number): UserLevelInfo {
	const currentXp = Math.max(0, xp || 0);

	let currentTier: LevelTier = LEVEL_TIERS[0];
	let nextTier: LevelTier = LEVEL_TIERS[1];

	for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
		const tier = LEVEL_TIERS[i];
		if (currentXp >= tier.xpRequired) {
			currentTier = tier;
			nextTier = LEVEL_TIERS[Math.min(i + 1, LEVEL_TIERS.length - 1)];
			break;
		}
	}

	// If max level reached
	if (currentTier.level === nextTier.level) {
		return {
			level: currentTier.level,
			title: currentTier.title,
			currentXp,
			currentTierXp: currentTier.xpRequired,
			nextTierXp: currentTier.xpRequired,
			progressPercent: 100,
		};
	}

	const xpInCurrentTier = currentXp - currentTier.xpRequired;
	const xpNeededForNextTier = nextTier.xpRequired - currentTier.xpRequired;
	const progressPercent = Math.min(
		100,
		Math.max(0, Math.round((xpInCurrentTier / xpNeededForNextTier) * 100)),
	);

	return {
		level: currentTier.level,
		title: currentTier.title,
		currentXp,
		currentTierXp: currentTier.xpRequired,
		nextTierXp: nextTier.xpRequired,
		progressPercent,
	};
}
