import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "AMHUB — Alight Motion Preset Hub",
		short_name: "AMHUB",
		description:
			"The #1 Hub for Alight Motion XML presets, JJ edits, transitions, and creator community.",
		start_url: "/",
		id: "/",
		display: "standalone",
		background_color: "#0B0A10",
		theme_color: "#7C3AED",
		orientation: "portrait-primary",
		lang: "id",
		dir: "ltr",
		categories: ["entertainment", "photo", "productivity", "utilities"],
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
		shortcuts: [
			{
				name: "Jelajahi Preset (Explore)",
				short_name: "Explore",
				description: "Temukan preset JJ dan transisi viral Alight Motion",
				url: "/explore",
				icons: [{ src: "/icon-192.png", sizes: "192x192" }],
			},
			{
				name: "Upload Preset",
				short_name: "Upload",
				description: "Bagikan preset Alight Motion XML atau Link kamu",
				url: "/upload",
				icons: [{ src: "/icon-192.png", sizes: "192x192" }],
			},
			{
				name: "Koleksi Tersimpan",
				short_name: "Bookmarks",
				description: "Buka preset yang sudah kamu simpan",
				url: "/bookmarks",
				icons: [{ src: "/icon-192.png", sizes: "192x192" }],
			},
		],
	};
}
