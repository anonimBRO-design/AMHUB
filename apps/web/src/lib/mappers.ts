import type { PresetWithCreator } from "@/data/presets";
import { formatAmVersion } from "@/lib/am-version";
import { formatCategory } from "@/lib/format-category";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { PresetCardPreset } from "@presethub/ui";

export { formatCategory } from "@/lib/format-category";

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
		thumbnailUrl: resolveStorageUrl(preset.thumbnail_url, "thumbnails") ?? "",
		previewVideoUrl: resolveStorageUrl(preset.preview_video_url, "preset-videos") ?? undefined,
		category: formatCategory(preset.category),
		difficulty: preset.difficulty as "beginner" | "intermediate" | "advanced",
		amVersionMin: formatAmVersion(preset.am_version_min) ?? undefined,
		amVersionMax: formatAmVersion(preset.am_version_max) ?? undefined,
		fileType: (preset.file_type || "xml").toUpperCase(),
		downloadCount: preset.download_count,
		uniqueDownloadCount: preset.unique_download_count ?? undefined,
		likeCount: preset.like_count,
		commentCount:
			typeof (preset as any).comments?.[0]?.count === "number"
				? (preset as any).comments[0].count
				: (preset.comment_count ?? 0),
		viewCount: preset.view_count,
		bookmarkCount: (preset as { bookmark_count?: number }).bookmark_count ?? 0,
		creator: {
			id: preset.creator.id,
			username: preset.creator.username,
			displayName: preset.creator.display_name,
			avatarUrl: resolveStorageUrl(preset.creator.avatar_url) ?? undefined,
			isVerified: preset.creator.is_verified,
		},
		isFeatured: preset.is_featured,
		isLiked: Boolean((preset as any).isLiked ?? (preset as any).is_liked),
		isBookmarked: Boolean(
			(preset as any).isBookmarked ?? (preset as any).is_bookmarked,
		),
		createdAt: preset.created_at,
		aspectRatio: rawAspect ?? "9:16",
		price: preset.price ?? 0,
		isPaid: Boolean(preset.is_paid && (preset.price ?? 0) > 0),
		currency: preset.currency || "IDR",
		commercialPrice: preset.commercial_price ?? undefined,
		remixedFromId: preset.remixed_from_id ?? undefined,
	};
}
