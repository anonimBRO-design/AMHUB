import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ExploreClient } from "./_components/ExploreClient";

export const metadata: Metadata = {
	title: "Explore Alight Motion Presets | AMHUB",
	description:
		"Discover and explore Alight Motion presets. Browse by category, search by name, or sort by popularity.",
};

interface ExplorePageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
	const params = await searchParams;
	const supabase = await createSupabaseServerClient();

	const searchQuery =
		typeof params.search === "string" ? params.search : undefined;
	const category =
		typeof params.category === "string" ? params.category : undefined;
	const sort = typeof params.sort === "string" ? params.sort : undefined;
	const fileType =
		typeof params.fileType === "string" ? params.fileType : undefined;

	let presets: ReturnType<typeof mapPresetToCardPreset>[] = [];
	try {
		const rawPresets = await listPublishedPresets(supabase, {
			search: searchQuery,
			category,
			fileType: fileType as "xml" | "qr" | "link" | undefined,
			sort: sort as
				| "created_at"
				| "download_count"
				| "like_count"
				| "view_count"
				| "title"
				| undefined,
		});
		presets = rawPresets.map(mapPresetToCardPreset);
	} catch (error) {
		console.error("Failed to load explore presets:", error);
	}

	return <ExploreClient presets={presets} />;
}
