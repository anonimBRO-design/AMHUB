import { listPublishedPresets } from "@/data/presets";
import { listPopularCreators } from "@/data/users";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import { CreatorSection } from "../_components/home/CreatorSection";
import { FeaturedSection } from "../_components/home/FeaturedSection";
import { Footer } from "../_components/home/Footer";
import { Hero } from "../_components/home/Hero";
import { PresetCarousel } from "../_components/home/PresetCarousel";
import { StatsSection } from "../_components/home/StatsSection";

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
	let creators: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
		is_verified: boolean;
		preset_count?: number;
		follower_count?: number;
	}[] = [];
	let totalPresetsCount = 0;
	let totalCreatorsCount = 0;
	let totalDownloadsCount = 0;

	try {
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		const [
			rawPresets,
			rawCreators,
			{ count: presetCount },
			{ count: userCount },
			{ data: downloadSumData },
			userLikesRes,
			userBookmarksRes,
		] = await Promise.all([
			listPublishedPresets(supabase, {
				search: searchQuery,
				category,
			}),
			listPopularCreators(supabase, 10),
			supabase
				.from("presets")
				.select("id", { count: "exact", head: true })
				.eq("status", "published"),
			supabase.from("users").select("id", { count: "exact", head: true }),
			supabase
				.from("presets")
				.select("download_count")
				.eq("status", "published"),
			currentUser
				? supabase
						.from("likes")
						.select("preset_id")
						.eq("user_id", currentUser.id)
				: Promise.resolve({ data: null }),
			currentUser
				? supabase
						.from("bookmarks")
						.select("preset_id")
						.eq("user_id", currentUser.id)
				: Promise.resolve({ data: null }),
		]);

		const likedPresetIds = new Set(
			((userLikesRes?.data as { preset_id: string }[] | null) ?? []).map(
				(l) => l.preset_id,
			),
		);
		const bookmarkedPresetIds = new Set(
			((userBookmarksRes?.data as { preset_id: string }[] | null) ?? []).map(
				(b) => b.preset_id,
			),
		);

		presets = rawPresets.map((p) => {
			const mapped = mapPresetToCardPreset(p);
			return {
				...mapped,
				isLiked: likedPresetIds.has(p.id),
				isBookmarked: bookmarkedPresetIds.has(p.id),
			};
		});
		creators = rawCreators.map((c) => ({
			...c,
			avatar_url: resolveStorageUrl(c.avatar_url),
		}));
		totalPresetsCount = presetCount ?? presets.length;
		totalCreatorsCount = userCount ?? creators.length;
		const typedDownloads = (downloadSumData ?? []) as {
			download_count?: number;
		}[];
		totalDownloadsCount = typedDownloads.reduce(
			(acc, cur) => acc + (cur.download_count ?? 0),
			0,
		);
	} catch (error) {
		console.error("Failed to load home page data:", error);
	}

	const featuredPreset =
		presets.find((p) => p.isFeatured) || presets[0] || null;

	const stats = {
		totalPresets: totalPresetsCount,
		totalCreators: totalCreatorsCount,
		totalDownloads: totalDownloadsCount,
	};

	return (
		<div className="flex flex-col space-y-8 md:space-y-12 pb-16 w-full max-w-full overflow-x-hidden">
			{/* Unified Responsive Hero (100% Supabase Driven) */}
			<Hero stats={stats} featuredPreset={featuredPreset} />

			{/* Featured Pro Selections */}
			{!searchQuery && <FeaturedSection presets={presets} />}

			{/* Main Preset Feed Grid */}
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

			{/* Community Creators Showcase */}
			<CreatorSection creators={creators} />

			{/* Platform Value Proposition */}
			<StatsSection />

			{/* Footer */}
			<Footer />
		</div>
	);
}
