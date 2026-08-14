import { listComments } from "@/dal/comments.dal";
import { getFollowerCount } from "@/dal/users.dal";
import { getPresetBySlug, listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PresetDetailClient } from "./_components/preset-detail-client";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const supabase = await createSupabaseServerClient();
	const preset = await getPresetBySlug(supabase, slug);

	if (!preset) {
		return {
			title: "Preset Not Found | AMHUB",
		};
	}

	return {
		title: `${preset.title} by ${preset.creator.display_name} | AMHUB`,
		description:
			preset.description ??
			`Download ${preset.title} Alight Motion preset by ${preset.creator.display_name}.`,
	};
}

export default async function PresetDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const supabase = await createSupabaseServerClient();
	const currentUser = await getCurrentUser();

	const rawPreset = await getPresetBySlug(supabase, slug);
	if (!rawPreset) {
		notFound();
	}

	const [
		rawRelated,
		commentsRes,
		followerCount,
		{ count: creatorPresetCount },
		{ data: likeRecord },
		{ data: bookmarkRecord },
		{ data: followRecord },
	] = await Promise.all([
		listPublishedPresets(supabase, {
			category: rawPreset.category,
			limit: 9,
		}),
		listComments(supabase, rawPreset.id, { page: 1, limit: 50 }),
		getFollowerCount(supabase, rawPreset.creator.id),
		supabase
			.from("presets")
			.select("id", { count: "exact", head: true })
			.eq("creator_id", rawPreset.creator.id)
			.eq("status", "published"),
		currentUser
			? supabase
					.from("preset_likes")
					.select("preset_id")
					.eq("user_id", currentUser.id)
					.eq("preset_id", rawPreset.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
		currentUser
			? supabase
					.from("preset_bookmarks")
					.select("preset_id")
					.eq("user_id", currentUser.id)
					.eq("preset_id", rawPreset.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
		currentUser && currentUser.id !== rawPreset.creator.id
			? supabase
					.from("follows")
					.select("follower_id")
					.eq("follower_id", currentUser.id)
					.eq("following_id", rawPreset.creator.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
	]);

	const cardPreset = mapPresetToCardPreset(rawPreset);
	const presetForDetail = {
		...cardPreset,
		fileType: rawPreset.file_type,
		fileUrl: rawPreset.file_url,
		amLink: rawPreset.am_link,
		isLiked: Boolean(likeRecord),
		isBookmarked: Boolean(bookmarkRecord),
		creator: {
			...cardPreset.creator,
			id: rawPreset.creator.id,
			followerCount,
			presetCount: creatorPresetCount ?? 1,
			isFollowing:
				currentUser?.id === rawPreset.creator.id
					? false
					: Boolean(followRecord),
		},
	};

	const relatedPresets = rawRelated
		.filter((p) => p.id !== rawPreset.id)
		.slice(0, 8)
		.map(mapPresetToCardPreset);

	const initialComments = (commentsRes.items ?? []).map((c) => {
		const item = c as unknown as {
			id: string;
			body?: string;
			content?: string;
			created_at?: string;
			createdAt?: string;
			user?: {
				username?: string;
				display_name?: string;
				displayName?: string;
				avatar_url?: string;
				avatarUrl?: string;
			};
		};
		return {
			id: item.id,
			content: item.body || item.content || "",
			createdAt: item.created_at || item.createdAt || new Date().toISOString(),
			user: {
				username: item.user?.username || "user",
				displayName:
					item.user?.display_name || item.user?.displayName || "User",
				avatarUrl:
					resolveStorageUrl(item.user?.avatar_url || item.user?.avatarUrl) ||
					null,
			},
		};
	});

	return (
		<PresetDetailClient
			preset={presetForDetail}
			relatedPresets={relatedPresets}
			comments={initialComments}
		/>
	);
}
