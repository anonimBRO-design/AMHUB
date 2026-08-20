import {
	getUnreadNotificationCount as getUnreadNotificationCountDal,
	listNotifications as listNotificationsDal,
} from "@/dal/notifications.dal";
import type { PresetHubSupabaseClient } from "@/lib/supabase/client";
import { cache } from "react";

export async function listNotifications(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	return listNotificationsDal(supabase, userId);
}

export const getUnreadNotificationCount = cache(
	async (supabase: PresetHubSupabaseClient, userId: string) =>
		getUnreadNotificationCountDal(supabase, userId),
);
