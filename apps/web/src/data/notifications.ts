import type { PresetHubSupabaseClient } from "@/lib/supabase/client";

export async function listNotifications(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	const { data, error } = await supabase
		.from("notifications")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(50);

	if (error) {
		throw error;
	}

	return data ?? [];
}

export async function getUnreadNotificationCount(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	const { count, error } = await supabase
		.from("notifications")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId)
		.eq("is_read", false);

	if (error) {
		throw error;
	}

	return count ?? 0;
}
