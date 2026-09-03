import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://amhub.id";

	// Static routes
	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${appUrl}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${appUrl}/explore`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${appUrl}/creators`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${appUrl}/leaderboard`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${appUrl}/credits`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.4,
		},
		{
			url: `${appUrl}/terms`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.3,
		},
	];

	try {
		const supabase = await createSupabaseServerClient();

		// Fetch published presets
		const { data: presets } = await supabase
			.from("presets")
			.select("slug, updated_at")
			.eq("status", "published")
			.order("created_at", { ascending: false })
			.limit(500);

		const presetList = (presets ?? []) as unknown as Array<{
			slug: string;
			updated_at?: string | null;
		}>;

		const presetRoutes: MetadataRoute.Sitemap = presetList.map((preset) => ({
			url: `${appUrl}/preset/${preset.slug}`,
			lastModified: preset.updated_at
				? new Date(preset.updated_at)
				: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		}));

		// Fetch creators
		const { data: creators } = await supabase
			.from("users")
			.select("username, updated_at")
			.limit(200);

		const creatorList = (creators ?? []) as unknown as Array<{
			username: string;
			updated_at?: string | null;
		}>;

		const creatorRoutes: MetadataRoute.Sitemap = creatorList.map((creator) => ({
			url: `${appUrl}/u/${creator.username}`,
			lastModified: creator.updated_at
				? new Date(creator.updated_at)
				: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		}));

		return [...staticRoutes, ...presetRoutes, ...creatorRoutes];
	} catch (error) {
		console.error("[SITEMAP GENERATION ERROR]", error);
		return staticRoutes;
	}
}
