import {
	getCollectionById,
	isCollectionCollaborator,
	listCollaborators,
	listCollectionItems,
} from "@/dal/collections.dal";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PresetCardPreset } from "@presethub/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailClient } from "./_components/CollectionDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CollectionDetailPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: CollectionDetailPageProps): Promise<Metadata> {
	const { id } = await params;
	try {
		const supabase = await createSupabaseServerClient();
		const collection = (await getCollectionById(supabase, id)) as unknown as {
			title: string;
			description?: string | null;
		};
		return {
			title: `${collection.title} | Koleksi AMHUB`,
			description:
				collection.description ??
				`Koleksi preset Alight Motion: ${collection.title}`,
		};
	} catch {
		return { title: "Koleksi | AMHUB" };
	}
}

export default async function CollectionDetailPage({
	params,
}: CollectionDetailPageProps) {
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const currentUser = await getCurrentUser();

	let collection: Awaited<ReturnType<typeof getCollectionById>>;
	try {
		collection = await getCollectionById(supabase, id, currentUser?.id);
	} catch {
		notFound();
	}

	const [items, collaborators] = await Promise.all([
		listCollectionItems(supabase, id),
		listCollaborators(supabase, id).catch(() => []),
	]);

	const c = collection as unknown as {
		id: string;
		title: string;
		description: string | null;
		cover_url: string | null;
		is_public: boolean;
		preset_count: number;
		owner_id: string;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
		};
	};

	const presets: PresetCardPreset[] = items.map((item) => ({
		id: item.preset.id,
		slug: item.preset.slug,
		title: item.preset.title,
		thumbnailUrl: item.preset.thumbnail_url,
		category: item.preset.category,
		difficulty: item.preset.difficulty,
		fileType: (item.preset.file_type || "xml").toUpperCase(),
		downloadCount: item.preset.download_count,
		likeCount: item.preset.like_count,
		commentCount: item.preset.comment_count,
		viewCount: item.preset.view_count,
		creator: {
			id: item.preset.creator.id,
			username: item.preset.creator.username,
			displayName: item.preset.creator.display_name,
			avatarUrl: item.preset.creator.avatar_url ?? undefined,
			isVerified: item.preset.creator.is_verified,
		},
		createdAt: item.preset.created_at,
	}));

	const isOwner = Boolean(currentUser && currentUser.id === c.owner_id);
	const isCollaborator = Boolean(
		currentUser && !isOwner
			? await isCollectionCollaborator(supabase, id, currentUser.id).catch(
					() => false,
				)
			: false,
	);
	const canEdit = isOwner || isCollaborator;

	return (
		<CollectionDetailClient
			collection={{
				id: c.id,
				title: c.title,
				description: c.description,
				coverUrl: c.cover_url,
				isPublic: c.is_public,
				owner: c.owner,
			}}
			presets={presets}
			collaborators={collaborators.map((col) => ({
				userId: col.user_id,
				username: col.user.username,
				displayName: col.user.display_name,
				avatarUrl: col.user.avatar_url,
			}))}
			isOwner={isOwner}
			canEdit={canEdit}
		/>
	);
}
