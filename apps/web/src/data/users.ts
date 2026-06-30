import type { PresetHubSupabaseClient } from "@/lib/supabase/client";

export async function getProfileByUsername(
	supabase: PresetHubSupabaseClient,
	username: string,
) {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}

export async function getFollowerCount(
	supabase: PresetHubSupabaseClient,
	userId: string,
) {
	const { count, error } = await supabase
		.from("follows")
		.select("*", { count: "exact", head: true })
		.eq("following_id", userId);

	if (error) {
		throw error;
	}

	return count ?? 0;
}
