import { PresetGrid } from "@presethub/ui";
import type { PresetCardPreset } from "@presethub/ui";
import { HomeSearchControls } from "./_components/home-search-controls";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { listPublishedPresets, type PresetWithCreator } from "@/data/presets";

interface HomePageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function mapPresetToCardPreset(preset: PresetWithCreator): PresetCardPreset {
	return {
		id: preset.id,
		slug: preset.slug,
		title: preset.title,
		description: preset.description ?? undefined,
		thumbnailUrl: preset.thumbnail_url,
		previewVideoUrl: preset.preview_video_url ?? undefined,
		category: preset.category,
		difficulty: preset.difficulty as "beginner" | "intermediate" | "advanced",
		downloadCount: preset.download_count,
		likeCount: preset.like_count,
		commentCount: preset.comment_count,
		viewCount: preset.view_count,
		creator: {
			username: preset.creator.username,
			displayName: preset.creator.display_name,
			avatarUrl: preset.creator.avatar_url ?? undefined,
			isVerified: preset.creator.is_verified,
		},
		isFeatured: preset.is_featured,
		createdAt: preset.created_at,
	};
}

export default async function HomePage({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const supabase = await createSupabaseServerClient();

	const searchQuery = typeof params.search === "string" ? params.search : undefined;
	const category = typeof params.category === "string" ? params.category : undefined;

	const rawPresets = await listPublishedPresets(supabase, {
		search: searchQuery,
		category,
	});

	const presets = rawPresets.map(mapPresetToCardPreset);

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
