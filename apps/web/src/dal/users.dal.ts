import type { DalClient } from "./types";
import { assertExists, handleDuplicateKey } from "./helpers";
import { ApiError } from "@/lib/api/errors";
import type { Database, UpdateUserProfileInput } from "@presethub/types";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export const PUBLIC_USER_SELECT = `
	id,
	username,
	display_name,
	avatar_url,
	banner_url,
	bio,
	website_url,
	tiktok_handle,
	instagram_handle,
	discord_handle,
	youtube_url,
	xp,
	level,
	is_verified,
	is_staff,
	country_code,
	created_at,
	updated_at
`;

export async function getUserByUsername(
  client: DalClient,
  username: string,
  currentUserId?: string
) {
  const { data: user, error } = await client
    .from("users")
    .select(PUBLIC_USER_SELECT)
    .ilike("username", username)
    .maybeSingle();

  if (error) throw error;
  assertExists(user, "User was not found.");

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id),
    client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id),
  ]);

  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const { data: followRecord } = await client
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUserId)
      .eq("following_id", user.id)
      .maybeSingle();

    isFollowing = Boolean(followRecord);
  }

  return {
    ...user,
    follower_count: followerCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: currentUserId ? isFollowing : undefined,
  };
}

export async function getUserByUsernameOrNull(
  client: DalClient,
  username: string
) {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserById(client: DalClient, userId: string) {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return assertExists(data, "User was not found.");
}

export async function getFollowerCount(client: DalClient, userId: string) {
  const { count, error } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function updateUserProfile(
  client: DalClient,
  targetUsername: string,
  input: UpdateUserProfileInput
) {
  const { data: targetUser, error: selectError } = await client
    .from("users")
    .select("id, username")
    .ilike("username", targetUsername)
    .maybeSingle();

  if (selectError) throw selectError;
  assertExists(targetUser, "User was not found.");

  const updatePayload: UserUpdate = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedUser, error: updateError } = await client
    .from("users")
    .update(updatePayload as never)
    .eq("id", targetUser.id)
    .select(PUBLIC_USER_SELECT)
    .single();

  if (updateError) throw updateError;
  return { targetUser, updatedUser };
}

export async function followUser(
  client: DalClient,
  followerId: string,
  targetUsername: string
) {
  const { data: targetUser, error: selectError } = await client
    .from("users")
    .select("id, username")
    .ilike("username", targetUsername)
    .maybeSingle();

  if (selectError) throw selectError;
  assertExists(targetUser, "User was not found.");

  if (targetUser.id === followerId) {
    throw new ApiError({
      code: "bad_request",
      message: "You cannot follow yourself.",
    });
  }

  const { error: insertError } = await client.from("follows").upsert(
    { follower_id: followerId, following_id: targetUser.id },
    { onConflict: "follower_id,following_id" }
  );

  if (insertError) {
    handleDuplicateKey(insertError, "You are already following this user.");
  }

  return {
    following_id: targetUser.id,
    following_username: targetUser.username,
    following: true,
  };
}

export async function unfollowUser(
  client: DalClient,
  followerId: string,
  targetUsername: string
) {
  const { data: targetUser, error: selectError } = await client
    .from("users")
    .select("id")
    .ilike("username", targetUsername)
    .maybeSingle();

  if (selectError) throw selectError;
  assertExists(targetUser, "User was not found.");

  const { error: deleteError } = await client
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", targetUser.id);

  if (deleteError) throw deleteError;
}
