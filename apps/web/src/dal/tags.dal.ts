import type { DalClient } from "./types";

export interface ListTagsFilter {
	search?: string;
	limit?: number;
}

/**
 * Lists tag taxonomy ordered by usage (most used first).
 * Public read: `tags_select_public` policy allows anon SELECT.
 * No mock fallback — tags are stable seed data; failures must surface.
 */
export async function listTags(client: DalClient, filter: ListTagsFilter = {}) {
	const limit = Math.min(filter.limit ?? 20, 50);

	let query = client
		.from("tags")
		.select("id, slug, label, usage_count")
		.order("usage_count", { ascending: false })
		.order("label", { ascending: true })
		.limit(limit);

	if (filter.search) {
		query = query.ilike("label", `%${filter.search}%`);
	}

	const { data, error } = await query;
	if (error) throw error;

	return data ?? [];
}
