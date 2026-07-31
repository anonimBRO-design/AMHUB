import type { DalClient } from "./types";
import { syncPresetCounter } from "./helpers";
import { assertPresetExists } from "./presets.dal";

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

export async function listComments(
  client: DalClient,
  presetId: string,
  filter: ListCommentsFilter
) {
  await assertPresetExists(client, presetId);

  const { page, limit } = filter;
  const offset = (page - 1) * limit;
  const to = offset + limit - 1;

  const { data: comments, count, error } = await client
    .from("comments")
    .select(COMMENT_SELECT_WITH_USER, { count: "exact" })
    .eq("preset_id", presetId)
    .eq("is_removed", false)
    .range(offset, to)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const total = count ?? 0;

  return {
    items: comments ?? [],
    total,
    offset,
  };
}

export async function createComment(
  client: DalClient,
  presetId: string,
  userId: string,
  data: CreateCommentData
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
    ])
    .select(COMMENT_SELECT_WITH_USER)
    .single();

  if (insertError) throw insertError;

  await syncPresetCounter(client, presetId, "comments", "comment_count");

  return comment;
}
