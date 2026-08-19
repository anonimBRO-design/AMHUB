import { cache } from "react";
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

export const getUnreadNotificationCount = cache(async function (
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	return getUnreadNotificationCountDal(supabase, userId);
});
