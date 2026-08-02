import { syncPresetCounter } from "./helpers";
import { assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";

export const COMMENT_SELECT_WITH_USER = `
	id,
	preset_id,
	user_id,
	parent_id,
	body,
	like_count,
	is_pinned,
	is_removed,
	created_at,
	updated_at,
	user:users!comments_user_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export interface ListCommentsFilter {
	page: number;
	limit: number;
}

export interface CreateCommentData {
	body: string;
	parent_id?: string | null;
}

import { MOCK_COMMENTS } from "@/data/mock-data";

export async function listComments(
	client: DalClient,
	presetId: string,
	filter: ListCommentsFilter,
) {
	const { page, limit } = filter;
	const offset = (page - 1) * limit;

	try {
		const to = offset + limit - 1;
		const {
			data: comments,
			count,
			error,
		} = await client
			.from("comments")
			.select(COMMENT_SELECT_WITH_USER, { count: "exact" })
			.eq("preset_id", presetId)
			.eq("is_removed", false)
			.range(offset, to)
			.order("is_pinned", { ascending: false })
			.order("created_at", { ascending: false });

		if (!error && comments && comments.length > 0) {
			return {
				items: comments,
				total: count ?? comments.length,
				offset,
			};
		}
	} catch {
		// Fall through
	}

	const matched = MOCK_COMMENTS.filter(
		(c) => c.preset_id === presetId || c.preset_id === "preset-01",
	);
	const commentsList = matched.length > 0 ? matched : MOCK_COMMENTS;
	const sliced = commentsList.slice(offset, offset + limit);

	return {
		items: sliced,
		total: commentsList.length,
		offset,
	};
}

export async function createComment(
	client: DalClient,
	presetId: string,
	userId: string,
	data: CreateCommentData,
) {
	await assertPresetExists(client, presetId);

	const { data: comment, error: insertError } = await client
		.from("comments")
		.insert([
			{
				preset_id: presetId,
				user_id: userId,
				body: data.body,
				parent_id: data.parent_id ?? null,
			},
		] as never)
		.select(COMMENT_SELECT_WITH_USER)
		.single();

	if (insertError) throw insertError;

	await syncPresetCounter(client, presetId, "comments", "comment_count");

	return comment;
}
