import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresetGrid } from "@presethub/ui";
import type { Metadata } from "next";
import { ExploreControls } from "./_components/explore-controls";

export const metadata: Metadata = {
	title: "Explore Presets | PresetHub",
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

	const rawPresets = await listPublishedPresets(supabase, {
		search: searchQuery,
		category,
		sort: sort as
			| "created_at"
			| "download_count"
			| "like_count"
			| "view_count"
			| "title"
			| undefined,
	});

	const presets = rawPresets.map(mapPresetToCardPreset);

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Explore Presets</h1>
			<ExploreControls />
			<PresetGrid
				presets={presets}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
