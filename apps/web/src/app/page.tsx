import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresetGrid } from "@presethub/ui";
import { HomeSearchControls } from "./_components/home-search-controls";

interface HomePageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const supabase = await createSupabaseServerClient();

	const searchQuery =
		typeof params.search === "string" ? params.search : undefined;
	const category =
		typeof params.category === "string" ? params.category : undefined;

	let presets: ReturnType<typeof mapPresetToCardPreset>[] = [];
	try {
		const rawPresets = await listPublishedPresets(supabase, {
			search: searchQuery,
			category,
		});
		presets = rawPresets.map(mapPresetToCardPreset);
	} catch (error) {
		console.error("Failed to load presets:", error);
	}

	return (
		<div className="space-y-8">
			<HomeSearchControls />
			<PresetGrid
				presets={presets}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
