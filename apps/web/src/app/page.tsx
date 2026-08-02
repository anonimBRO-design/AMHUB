import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryScroller } from "./_components/home/CategoryScroller";
import { CreatorSection } from "./_components/home/CreatorSection";
import { FeaturedSection } from "./_components/home/FeaturedSection";
import { Footer } from "./_components/home/Footer";
import { Hero } from "./_components/home/Hero";
import { PresetCarousel } from "./_components/home/PresetCarousel";
import { SearchBar } from "./_components/home/SearchBar";
import { StatsSection } from "./_components/home/StatsSection";

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
		<div className="space-y-10 sm:space-y-12 pb-8">
			{/* Hero Banner */}
			<Hero />

			{/* Search & Category Filtering Controls */}
			<div className="space-y-4">
				<SearchBar />
				<CategoryScroller />
			</div>

			{/* Featured Spotlight (only shown when not searching) */}
			{!searchQuery && <FeaturedSection presets={presets} />}

			{/* Main Preset Catalog Feed */}
			<PresetCarousel
				presets={presets}
				title={
					searchQuery
						? `Results for "${searchQuery}"`
						: category
							? `${category.charAt(0).toUpperCase() + category.slice(1)} Presets`
							: "Trending Presets"
				}
			/>

			{/* Popular Creators Spotlight */}
			<CreatorSection />

			{/* Value Proposition / Features Grid */}
			<StatsSection />

			{/* Footer */}
			<Footer />
		</div>
	);
}
