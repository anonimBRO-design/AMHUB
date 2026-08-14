import type { User as Profile } from "@presethub/types";

/**
 * Checks whether a user/profile has admin capabilities.
 * Recognizes the designated admin @afgan, users with role === 'admin',
 * users with is_staff === true, or app_metadata.role === 'admin'.
 */
export function isAdminProfile(
	profile?: Partial<Profile> | null,
	user?: { app_metadata?: Record<string, unknown> } | null,
): boolean {
	if (!profile && !user) return false;
	if (profile?.username?.toLowerCase() === "afgan") return true;
	if ((profile as { role?: string })?.role === "admin") return true;
	if (profile?.is_staff === true) return true;
	if ((user?.app_metadata as { role?: string })?.role === "admin") return true;
	return false;
}
