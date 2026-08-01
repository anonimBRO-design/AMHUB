import type { DalClient } from "./types";

export async function listNotifications(
	client: DalClient,
	userId: string,
	limit = 50,
) {
	const { data, error } = await client
		.from("notifications")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) throw error;
	return data ?? [];
}

export async function getUnreadNotificationCount(
	client: DalClient,
	userId: string,
) {
	const { count, error } = await client
		.from("notifications")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId)
		.eq("is_read", false);

	if (error) throw error;
	return count ?? 0;
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
