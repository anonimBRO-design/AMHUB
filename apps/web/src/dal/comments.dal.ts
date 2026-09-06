import { XP_REWARDS } from "@/lib/gamification/xp";
import { syncPresetCounter } from "./helpers";
import { createNotification } from "./notifications.dal";
import { assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";
import { awardUserXp } from "./users.dal";

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

		if (error) {
			throw error;
		}

		return {
			items: comments ?? [],
			total: count ?? 0,
			offset,
		};
	} catch (error) {
		console.error("Failed to list comments:", error);
		throw error;
	}
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

	// Trigger Notification for creator
	try {
		const { data: preset } = await client
			.from("presets")
			.select("creator_id, title")
			.eq("id", presetId)
			.maybeSingle();

		if (
			preset &&
			(preset as { creator_id: string }).creator_id &&
			(preset as { creator_id: string }).creator_id !== userId
		) {
			await createNotification(client, {
				userId: (preset as { creator_id: string }).creator_id,
				actorId: userId,
				type: "comment",
				presetId,
				message: `commented on your preset "${(preset as { title?: string }).title || "Preset"}"`,
			});
		}
	} catch (e) {
		console.error("Failed to trigger comment notification", e);
	}

	// Award commenter XP for participating in community
	awardUserXp(
		client,
		userId,
		XP_REWARDS.PRESET_COMMENTED,
		"Created comment",
	).catch((err) => {
		console.error("[XP_AWARD_ERROR] Failed to award comment XP:", err);
	});

	return comment;
}

export async function deleteComment(
	client: DalClient,
	commentId: string,
	presetId: string,
) {
	const { error } = await client
		.from("comments")
		.delete()
		.eq("id", commentId)
		.eq("preset_id", presetId);
	if (error) throw error;
	await syncPresetCounter(client, presetId, "comments", "comment_count");
}

export async function moderateComment(
	client: DalClient,
	commentId: string,
	updates: { is_pinned?: boolean; is_removed?: boolean },
) {
	const { data, error } = await client
		.from("comments")
		.update(updates as never)
		.eq("id", commentId)
		.select(COMMENT_SELECT_WITH_USER)
		.single();
	if (error) throw error;
	return data;
}
