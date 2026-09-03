import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://amhub.id";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/admin",
					"/admin/*",
					"/dashboard",
					"/dashboard/*",
					"/api/*",
					"/settings",
					"/settings/*",
					"/auth/*",
				],
			},
		],
		sitemap: `${appUrl}/sitemap.xml`,
	};
}
