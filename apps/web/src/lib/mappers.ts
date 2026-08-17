import type { PresetWithCreator } from "@/data/presets";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { PresetCardPreset } from "@presethub/ui";

/**
 * Maps a DAL PresetWithCreator to the UI PresetCardPreset shape.
 * Used by Home, Explore, Preset Detail, User Profile, Dashboard, Bookmarks, and Likes pages.
 */
export function mapPresetToCardPreset(
	preset: PresetWithCreator,
): PresetCardPreset {
	const rawAspect =
		(
			preset as {
				aspect_ratio?: string;
				aspectRatio?: string;
				aspect_ratios?: string[];
			}
		).aspect_ratio ||
		(
			preset as {
				aspect_ratio?: string;
				aspectRatio?: string;
				aspect_ratios?: string[];
			}
		).aspectRatio ||
		(Array.isArray((preset as { aspect_ratios?: string[] }).aspect_ratios) &&
		(preset as { aspect_ratios?: string[] }).aspect_ratios!.length > 0
			? (preset as { aspect_ratios?: string[] }).aspect_ratios![0]
			: undefined);

	return {
		id: preset.id,
		slug: preset.slug,
		title: preset.title,
		description: preset.description ?? undefined,
		thumbnailUrl: preset.thumbnail_url ?? "",
		previewVideoUrl: preset.preview_video_url ?? undefined,
		category: preset.category,
		difficulty: preset.difficulty as "beginner" | "intermediate" | "advanced",
		fileType: (preset.file_type || "xml").toUpperCase(),
		downloadCount: preset.download_count,
		likeCount: preset.like_count,
		commentCount: preset.comment_count,
		viewCount: preset.view_count,
		bookmarkCount:
			(preset as { bookmark_count?: number }).bookmark_count ?? 0,
		creator: {
			id: preset.creator.id,
			username: preset.creator.username,
			displayName: preset.creator.display_name,
			avatarUrl: resolveStorageUrl(preset.creator.avatar_url) ?? undefined,
			isVerified: preset.creator.is_verified,
		},
		isFeatured: preset.is_featured,
		createdAt: preset.created_at,
		aspectRatio: rawAspect ?? "16:9",
		price: preset.price ?? 0,
		isPaid: Boolean(preset.is_paid && (preset.price ?? 0) > 0),
		currency: preset.currency || "IDR",
	};
}
