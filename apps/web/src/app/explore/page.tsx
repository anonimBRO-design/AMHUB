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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
	const difficulty =
		typeof params.difficulty === "string" ? params.difficulty : undefined;
	const sort = typeof params.sort === "string" ? params.sort : undefined;
	const fileType =
		typeof params.fileType === "string" ? params.fileType : undefined;

	let presets: ReturnType<typeof mapPresetToCardPreset>[] = [];
	try {
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		const [rawPresets, userLikesRes, userBookmarksRes] = await Promise.all([
			listPublishedPresets(supabase, {
				search: searchQuery,
				category,
				difficulty,
				fileType: fileType as "xml" | "qr" | "link" | undefined,
				sort: sort as
					| "created_at"
					| "oldest"
					| "download_count"
					| "like_count"
					| "most_downloaded"
					| "most_liked"
					| "trending"
					| undefined,
			}),
			currentUser
				? supabase
						.from("preset_likes")
						.select("preset_id")
						.eq("user_id", currentUser.id)
				: Promise.resolve({ data: null }),
			currentUser
				? supabase
						.from("preset_bookmarks")
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
	} catch (error) {
		console.error("Failed to load explore presets:", error);
	}

	return <ExploreClient presets={presets} />;
}
