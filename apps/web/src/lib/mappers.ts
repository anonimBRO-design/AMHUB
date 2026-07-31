import type { PresetWithCreator } from "@/data/presets";
import type { PresetCardPreset } from "@presethub/ui";

/**
 * Maps a DAL PresetWithCreator to the UI PresetCardPreset shape.
 * Used by Home, Explore, Preset Detail, User Profile, Dashboard, Bookmarks, and Likes pages.
 */
export function mapPresetToCardPreset(
	preset: PresetWithCreator,
): PresetCardPreset {
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
