import type { DalClient } from "./types";

import { MOCK_NOTIFICATIONS } from "@/data/mock-data";

export async function listNotifications(
	client: DalClient,
	userId: string,
	limit = 50,
) {
	try {
		const { data, error } = await client
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (!error && data && data.length > 0) return data;
	} catch {
		// Fall through
	}

	return MOCK_NOTIFICATIONS.slice(0, limit);
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

		if (!error && typeof count === "number" && count > 0) return count;
	} catch {
		// Fall through
	}

	return MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;
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
