/** Shared affiliate referral helpers (cookie capture + link building). */

export const AFFILIATE_REF_COOKIE = "am_ref";
export const AFFILIATE_REF_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/;

/** Validate a raw `?ref=` value before trusting it. */
export function isValidReferralCode(value: string | null | undefined): boolean {
	if (!value) return false;
	return USERNAME_PATTERN.test(value.trim().toLowerCase());
}

export function normalizeReferralCode(value: string): string {
	return value.trim().toLowerCase();
}

/** Public share link carrying the referrer's username, e.g. `https://amhub.id/?ref=afganedits`. */
export function buildReferralLink(origin: string, username: string): string {
	const cleanOrigin = origin.replace(/\/$/, "");
	return `${cleanOrigin}/?ref=${encodeURIComponent(username.toLowerCase())}`;
}
