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
		throw new ApiError({
			code: "not_found",
			message: "Collection was not found.",
		});
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
