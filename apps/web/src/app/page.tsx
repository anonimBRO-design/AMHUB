import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryScroller } from "./_components/home/CategoryScroller";
import { CreatorSection } from "./_components/home/CreatorSection";
import { FeaturedSection } from "./_components/home/FeaturedSection";
import { Footer } from "./_components/home/Footer";
import { Hero } from "./_components/home/Hero";
import { MobileHomeFeed } from "./_components/home/MobileHomeFeed";
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

	const categories = [
		{ id: "velocity", name: "⚡ Velocity" },
		{ id: "transition", name: "🔄 Transitions" },
		{ id: "color", name: "🎨 Color Grading" },
		{ id: "anime", name: "🌸 Anime" },
		{ id: "gaming", name: "🎮 Gaming" },
		{ id: "lyric", name: "🎵 Lyric" },
		{ id: "3d", name: "📦 3D Effects" },
	];

	return (
		<div>
			{/* Dedicated Mobile Native Feed (max-width: 768px) */}
			<MobileHomeFeed presets={presets} categories={categories} />

			{/* Desktop and Tablet Layout (Hidden on Mobile) */}
			<div className="hidden md:block space-y-10 sm:space-y-12 pb-8">
				<Hero />
				<div className="space-y-4">
					<SearchBar />
					<CategoryScroller />
				</div>
				{!searchQuery && <FeaturedSection presets={presets} />}
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
				<CreatorSection />
				<StatsSection />
				<Footer />
			</div>
		</div>
	);
}
