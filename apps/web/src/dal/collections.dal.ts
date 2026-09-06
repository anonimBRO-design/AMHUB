import { ApiError } from "@/lib/api/errors";
import type { Database } from "@presethub/types";
import { assertExists, handleDuplicateKey } from "./helpers";
import type { DalClient } from "./types";

type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

export const COLLECTION_SELECT_WITH_OWNER = `
	id,
	slug,
	owner_id,
	title,
	description,
	cover_url,
	is_public,
	preset_count,
	created_at,
	updated_at,
	owner:users!collections_owner_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export function generateCollectionSlug(title: string): string {
	const normalized = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50);

	return normalized || `collection-${Date.now()}`;
}

export interface ListCollectionsFilter {
	page: number;
	limit: number;
	owner_id?: string;
	search?: string;
	currentUserId?: string;
}

export interface CreateCollectionData {
	title: string;
	slug?: string;
	description?: string | null;
	cover_url?: string | null;
	is_public: boolean;
}

export interface UpdateCollectionData {
	title?: string;
	slug?: string;
	description?: string | null;
	cover_url?: string | null;
	is_public?: boolean;
}

export async function listCollections(
	client: DalClient,
	filter: ListCollectionsFilter,
) {
	const { page, limit, owner_id, search, currentUserId } = filter;
	const offset = (page - 1) * limit;
	const to = offset + limit - 1;

	let query = client
		.from("collections")
		.select(COLLECTION_SELECT_WITH_OWNER, { count: "exact" })
		.range(offset, to)
		.order("created_at", { ascending: false });

	if (owner_id) {
		query = query.eq("owner_id", owner_id);
		if (owner_id !== currentUserId) {
			query = query.eq("is_public", true);
		}
	} else {
		query = query.eq("is_public", true);
	}

	if (search) {
		query = query.ilike("title", `%${search}%`);
	}

	const { data: collections, count, error } = await query;
	if (error) throw error;

	const total = count ?? 0;

	return {
		items: collections ?? [],
		total,
		offset,
	};
}

export async function createCollection(
	client: DalClient,
	ownerId: string,
	input: CreateCollectionData,
) {
	const slug = input.slug ? input.slug : generateCollectionSlug(input.title);

	const insertData = {
		owner_id: ownerId,
		title: input.title,
		slug,
		description: input.description ?? null,
		cover_url: input.cover_url ?? null,
		is_public: input.is_public,
	} satisfies CollectionInsert;

	const { data: collection, error } = await client
		.from("collections")
		.insert([insertData as never])
		.select(COLLECTION_SELECT_WITH_OWNER)
		.single();

	if (error) {
		handleDuplicateKey(
			error,
			"A collection with this slug already exists for your account.",
		);
	}

	return collection;
}

export async function getCollectionById(
	client: DalClient,
	id: string,
	currentUserId?: string,
) {
	const { data: collection, error } = await client
		.from("collections")
		.select(COLLECTION_SELECT_WITH_OWNER)
		.eq("id", id)
		.maybeSingle();

	if (error) throw error;
	const validCollection = assertExists(
		collection,
		"Collection was not found.",
	) as unknown as { owner_id: string; is_public: boolean };

	const isOwner = currentUserId === validCollection.owner_id;
	if (!validCollection.is_public && !isOwner) {
		if (!currentUserId) {
			throw new ApiError({
				code: "not_found",
				message: "Collection was not found.",
			});
		}
		const isCollaborator = await isCollectionCollaborator(
			client,
			id,
			currentUserId,
		);
		if (!isCollaborator) {
			throw new ApiError({
				code: "not_found",
				message: "Collection was not found.",
			});
		}
	}

	return validCollection;
}

export async function getCollectionOwner(
	client: DalClient,
	id: string,
): Promise<{ id: string; owner_id: string }> {
	const { data: existing, error: selectError } = await client
		.from("collections")
		.select("id, owner_id")
		.eq("id", id)
		.maybeSingle();

	if (selectError) throw selectError;
	return assertExists(existing, "Collection was not found.") as unknown as {
		id: string;
		owner_id: string;
	};
}

export async function updateCollection(
	client: DalClient,
	id: string,
	input: UpdateCollectionData,
) {
	const updatePayload: CollectionUpdate = {
		...input,
		updated_at: new Date().toISOString(),
	};

	const { data: updatedCollection, error: updateError } = await client
		.from("collections")
		.update(updatePayload as never)
		.eq("id", id)
		.select(COLLECTION_SELECT_WITH_OWNER)
		.single();

	if (updateError) {
		handleDuplicateKey(
			updateError,
			"A collection with this slug already exists for your account.",
		);
	}

	return updatedCollection;
}

export async function deleteCollection(client: DalClient, id: string) {
	const { error: deleteError } = await client
		.from("collections")
		.delete()
		.eq("id", id);

	if (deleteError) throw deleteError;
}

export interface CollectionCollaborator {
	user_id: string;
	added_at: string;
	user: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
	};
}

export async function isCollectionCollaborator(
	client: DalClient,
	collectionId: string,
	userId: string,
): Promise<boolean> {
	try {
		const { data, error } = await client
			.from("collection_collaborators")
			.select("user_id")
			.eq("collection_id", collectionId)
			.eq("user_id", userId)
			.maybeSingle();
		return !error && Boolean(data);
	} catch {
		return false;
	}
}

export async function canEditCollection(
	client: DalClient,
	collectionId: string,
	userId: string,
	isStaff = false,
): Promise<boolean> {
	if (isStaff) return true;
	try {
		const owner = await getCollectionOwner(client, collectionId);
		if (owner.owner_id === userId) return true;
		return await isCollectionCollaborator(client, collectionId, userId);
	} catch {
		return false;
	}
}

export async function listCollaborators(
	client: DalClient,
	collectionId: string,
): Promise<CollectionCollaborator[]> {
	const { data, error } = await client
		.from("collection_collaborators")
		.select(
			`user_id, added_at,
			user:users!collection_collaborators_user_id_fkey (
				id, username, display_name, avatar_url
			)`,
		)
		.eq("collection_id", collectionId)
		.order("added_at", { ascending: true });
	if (error) throw error;
	return (data ?? []) as unknown as CollectionCollaborator[];
}

export async function addCollaborator(
	client: DalClient,
	collectionId: string,
	userId: string,
) {
	const owner = await getCollectionOwner(client, collectionId);
	if (owner.owner_id === userId) {
		throw new ApiError({
			code: "bad_request",
			message: "Pemilik koleksi sudah punya akses penuh.",
		});
	}
	const { data, error } = await client
		.from("collection_collaborators")
		.insert({ collection_id: collectionId, user_id: userId } as never)
		.select("collection_id, user_id, added_at")
		.single();
	if (error) {
		if ((error as { code?: string }).code === "23505") {
			throw new ApiError({
				code: "conflict",
				message: "Pengguna ini sudah menjadi kolaborator.",
			});
		}
		throw error;
	}
	return data;
}

export async function removeCollaborator(
	client: DalClient,
	collectionId: string,
	userId: string,
) {
	const { error } = await client
		.from("collection_collaborators")
		.delete()
		.eq("collection_id", collectionId)
		.eq("user_id", userId);
	if (error) throw error;
}

export interface CollectionItemWithPreset {
	preset_id: string;
	added_at: string;
	sort_order: number;
	preset: {
		id: string;
		slug: string;
		title: string;
		thumbnail_url: string;
		category: string;
		difficulty: "beginner" | "intermediate" | "advanced";
		file_type: string;
		like_count: number;
		download_count: number;
		view_count: number;
		comment_count: number;
		created_at: string;
		creator: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
			is_verified: boolean;
		};
	};
}

export async function listCollectionItems(
	client: DalClient,
	collectionId: string,
): Promise<CollectionItemWithPreset[]> {
	const { data, error } = await client
		.from("collection_items")
		.select(
			`preset_id, added_at, sort_order,
			preset:presets!collection_items_preset_id_fkey (
				id, slug, title, thumbnail_url, category, difficulty, file_type,
				like_count, download_count, view_count, comment_count,
				created_at, status,
				creator:users!presets_creator_id_fkey (
					id, username, display_name, avatar_url, is_verified
				)
			)`,
		)
		.eq("collection_id", collectionId)
		.order("added_at", { ascending: false })
		.order("sort_order", { ascending: true });
	if (error) throw error;
	const items = (data ?? []) as unknown as (Omit<
		CollectionItemWithPreset,
		"preset"
	> & {
		preset: CollectionItemWithPreset["preset"] & { status?: string };
	})[];
	return items.filter(
		(item) => item.preset && item.preset.status === "published",
	);
}

export async function addCollectionItem(
	client: DalClient,
	collectionId: string,
	presetId: string,
) {
	const { data: preset } = await client
		.from("presets")
		.select("id, status")
		.eq("id", presetId)
		.maybeSingle();
	const p = preset as { status?: string } | null;
	if (!p || p.status !== "published") {
		throw new ApiError({
			code: "bad_request",
			message: "Hanya preset yang sudah publish bisa ditambahkan.",
		});
	}
	const { error } = await client
		.from("collection_items")
		.insert({ collection_id: collectionId, preset_id: presetId } as never);
	if (error) {
		if ((error as { code?: string }).code === "23505") {
			throw new ApiError({
				code: "conflict",
				message: "Preset ini sudah ada di koleksi.",
			});
		}
		throw error;
	}
	await syncCollectionPresetCount(client, collectionId);
}

export async function removeCollectionItem(
	client: DalClient,
	collectionId: string,
	presetId: string,
) {
	const { error } = await client
		.from("collection_items")
		.delete()
		.eq("collection_id", collectionId)
		.eq("preset_id", presetId);
	if (error) throw error;
	await syncCollectionPresetCount(client, collectionId);
}

async function syncCollectionPresetCount(
	client: DalClient,
	collectionId: string,
) {
	try {
		const { count } = await client
			.from("collection_items")
			.select("preset_id", { count: "exact", head: true })
			.eq("collection_id", collectionId);
		await client
			.from("collections")
			.update({ preset_count: count ?? 0 } as never)
			.eq("id", collectionId);
	} catch {
		// count sync is best-effort
	}
}
