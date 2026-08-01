import {
	getUnreadNotificationCount as getUnreadNotificationCountDal,
	listNotifications as listNotificationsDal,
} from "@/dal/notifications.dal";
import type { PresetHubSupabaseClient } from "@/lib/supabase/client";

export async function listNotifications(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	return listNotificationsDal(supabase, userId);
}

export async function getUnreadNotificationCount(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	return getUnreadNotificationCountDal(supabase, userId);
}
