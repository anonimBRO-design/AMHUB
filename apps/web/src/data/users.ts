import {
	getFollowerCount as getFollowerCountDal,
	getUserByUsernameOrNull,
} from "@/dal/users.dal";
import type { PresetHubSupabaseClient } from "@/lib/supabase/client";

export async function getProfileByUsername(
	supabase: PresetHubSupabaseClient,
	username: string,
) {
	return getUserByUsernameOrNull(supabase, username);
}

export async function getFollowerCount(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	return getFollowerCountDal(supabase, userId);
}
