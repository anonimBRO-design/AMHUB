import type { PresetHubSupabaseClient } from "@/lib/supabase/client";
import {
  getUserByUsernameOrNull,
  getFollowerCount as getFollowerCountDal,
} from "@/dal/users.dal";

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
