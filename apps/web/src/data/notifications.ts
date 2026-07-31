import type { PresetHubSupabaseClient } from "@/lib/supabase/client";
import {
  listNotifications as listNotificationsDal,
  getUnreadNotificationCount as getUnreadNotificationCountDal,
} from "@/dal/notifications.dal";

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
