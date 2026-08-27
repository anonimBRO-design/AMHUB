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
	name: "AMHUB",
	description:
		"Komunitas & Marketplace Preset Alight Motion Terbesar di Indonesia",
	url: getSiteUrl(),
	routes: [
		{ path: "/", label: "Home" },
		{ path: "/home", label: "Feed" },
		{ path: "/explore", label: "Explore" },
		{ path: "/creators", label: "Creators" },
		{ path: "/leaderboard", label: "Leaderboard" },
		{ path: "/collections", label: "Collections" },
		{ path: "/upload", label: "Upload" },
		{ path: "/dashboard", label: "Dashboard" },
		{ path: "/settings", label: "Settings" },
		{ path: "/auth/login", label: "Login" },
		{ path: "/auth/register", label: "Register" },
	] as const,
	socialLinks: {
		tiktok: "https://tiktok.com/@amhub.id",
		instagram: "https://instagram.com/amhub.id",
		youtube: "https://youtube.com/@amhub-official",
		discord: "https://discord.gg/amhub",
	},
} as const;

export type RoutePath = (typeof siteConfig.routes)[number]["path"];
