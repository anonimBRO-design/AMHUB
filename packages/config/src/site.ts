// Site configuration from Product Specification §3 Site Map

/**
 * Canonical site origin — single source of truth for absolute URLs
 * (OAuth/email redirects must always land on the production domain).
 *
 * Priority:
 * 1. `NEXT_PUBLIC_APP_URL` (set per-environment in Vercel/CI).
 * 2. Current browser origin (local dev & preview deployments without the var).
 * 3. localhost fallback for SSR/dev.
 */
export function getSiteUrl(): string {
	const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(
		/\/+$/,
		"",
	);
	if (configured) return configured;
	if (typeof window !== "undefined") return window.location.origin;
	return "http://localhost:3000";
}

export const siteConfig = {
	name: "PresetHub",
	description: "Discover, share, and track FL Studio presets",
	url: getSiteUrl(),
	routes: [
		{ path: "/", label: "Home" },
		{ path: "/search", label: "Search" },
		{ path: "/creators", label: "Creators" },
		{ path: "/leaderboard", label: "Leaderboard" },
		{ path: "/upload", label: "Upload" },
		{ path: "/profile/[username]", label: "Profile" },
		{ path: "/preset/[id]", label: "Preset Detail" },
		{ path: "/auth/login", label: "Login" },
		{ path: "/auth/register", label: "Register" },
	] as const,
	socialLinks: {
		twitter: "https://twitter.com/presethub",
		github: "https://github.com/presethub",
		discord: "https://discord.gg/presethub",
	},
} as const;

export type RoutePath = (typeof siteConfig.routes)[number]["path"];
