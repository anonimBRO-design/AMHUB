import type { DalClient } from "./types";

export const NOTIFICATION_SELECT_WITH_RELATIONS = `
	id,
	user_id,
	type,
	actor_id,
	preset_id,
	message,
	is_read,
	created_at,
	actor:users!notifications_actor_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	),
	preset:presets!notifications_preset_id_fkey (
		id,
		title,
		slug,
		thumbnail_url
	)
`;

export interface CreateNotificationInput {
	userId: string;
	actorId?: string;
	type: "like" | "comment" | "follow" | "download" | "bookmark" | "system";
	presetId?: string;
	message?: string;
}

export async function createNotification(
	client: DalClient,
	input: CreateNotificationInput,
) {
	try {
		// Do not notify self
		if (input.actorId && input.actorId === input.userId) {
			return null;
		}

		const { data, error } = await client
			.from("notifications")
			.insert([
				{
					user_id: input.userId,
					actor_id: input.actorId || null,
					type: input.type,
					preset_id: input.presetId || null,
					message: input.message || null,
					is_read: false,
				},
			] as never)
			.select()
			.single();

		if (error) {
			console.error("Failed to create notification:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error creating notification:", error);
		return null;
	}
}

export async function listNotifications(
	client: DalClient,
	userId: string,
	limit = 50,
) {
	try {
		const { data, error } = await client
			.from("notifications")
			.select(NOTIFICATION_SELECT_WITH_RELATIONS)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			// Fallback if join relation syntax error
			const { data: rawData, error: rawError } = await client
				.from("notifications")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(limit);

			if (rawError) return [];
			return rawData ?? [];
		}

		return data ?? [];
	} catch (error) {
		console.error("Failed to list notifications:", error);
		return [];
	}
}

export async function getUnreadNotificationCount(
	client: DalClient,
	userId: string,
) {
	try {
		const { count, error } = await client
			.from("notifications")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("is_read", false);

		if (error) return 0;
		return count ?? 0;
	} catch (error) {
		console.error("Failed to get unread notification count:", error);
		return 0;
	}
}

export async function markNotificationRead(
	client: DalClient,
	notificationId: string,
	userId: string,
) {
	const { error } = await client
		.from("notifications")
		.update({ is_read: true } as never)
		.eq("id", notificationId)
		.eq("user_id", userId);

	if (error) throw error;
}

export async function markAllNotificationsRead(
	client: DalClient,
	userId: string,
) {
	const { error } = await client
		.from("notifications")
		.update({ is_read: true } as never)
		.eq("user_id", userId)
		.eq("is_read", false);

	if (error) throw error;
}
