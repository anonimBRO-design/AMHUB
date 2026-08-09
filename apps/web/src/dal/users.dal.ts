import { ApiError } from "@/lib/api/errors";
import type { Database, UpdateUserProfileInput, User } from "@presethub/types";
import { assertExists, handleDuplicateKey } from "./helpers";
import { createNotification } from "./notifications.dal";
import type { DalClient } from "./types";

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
	currentUserId?: string,
) {
	try {
		const { data: user, error } = await client
			.from("users")
			.select(PUBLIC_USER_SELECT)
			.ilike("username", username)
			.maybeSingle();

		if (error || !user) {
			return null;
		}

		const validUser = user as unknown as User;
		const [
			{ count: followerCount },
			{ count: followingCount },
			{ count: presetCount },
		] = await Promise.all([
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("following_id", validUser.id),
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("follower_id", validUser.id),
			client
				.from("presets")
				.select("*", { count: "exact", head: true })
				.eq("creator_id", validUser.id),
		]);

		let isFollowing = false;
		if (currentUserId && currentUserId !== validUser.id) {
			const { data: followRecord } = await client
				.from("follows")
				.select("follower_id")
				.eq("follower_id", currentUserId)
				.eq("following_id", validUser.id)
				.maybeSingle();

			isFollowing = Boolean(followRecord);
		}

		return {
			...validUser,
			follower_count: followerCount ?? 0,
			following_count: followingCount ?? 0,
			preset_count: presetCount ?? 0,
			is_following: currentUserId ? isFollowing : undefined,
		};
	} catch (error) {
		console.error("Failed to get user by username:", error);
		return null;
	}
}

export async function getUserByAuthId(client: DalClient, userId: string) {
	try {
		const { data: user, error } = await client
			.from("users")
			.select(PUBLIC_USER_SELECT)
			.eq("id", userId)
			.maybeSingle();

		if (error || !user) {
			return null;
		}

		const validUser = user as unknown as User;
		const [
			{ count: followerCount },
			{ count: followingCount },
			{ count: presetCount },
		] = await Promise.all([
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("following_id", validUser.id),
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("follower_id", validUser.id),
			client
				.from("presets")
				.select("*", { count: "exact", head: true })
				.eq("creator_id", validUser.id),
		]);

		return {
			...validUser,
			follower_count: followerCount ?? 0,
			following_count: followingCount ?? 0,
			preset_count: presetCount ?? 0,
			is_following: undefined,
		};
	} catch (error) {
		console.error("Failed to get user by auth ID:", error);
		return null;
	}
}

export async function getUserByUsernameOrNull(
	client: DalClient,
	username: string,
) {
	try {
		const { data, error } = await client
			.from("users")
			.select("*")
			.eq("username", username)
			.maybeSingle();

		if (error || !data) return null;
		return data;
	} catch (error) {
		console.error("Failed to get user by username or null:", error);
		return null;
	}
}

export async function getUserById(client: DalClient, userId: string) {
	try {
		const { data, error } = await client
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (error || !data) return null;
		return data;
	} catch (error) {
		console.error("Failed to get user by id:", error);
		return null;
	}
}

export async function getFollowerCount(client: DalClient, userId: string) {
	try {
		const { count, error } = await client
			.from("follows")
			.select("*", { count: "exact", head: true })
			.eq("following_id", userId);

		if (error) return 0;
		return count ?? 0;
	} catch (error) {
		console.error("Failed to get follower count:", error);
		return 0;
	}
}

export async function getFollowingCount(client: DalClient, userId: string) {
	try {
		const { count, error } = await client
			.from("follows")
			.select("*", { count: "exact", head: true })
			.eq("follower_id", userId);

		if (error) return 0;
		return count ?? 0;
	} catch (error) {
		console.error("Failed to get following count:", error);
		return 0;
	}
}

export interface PopularCreator {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	is_verified: boolean;
	preset_count: number;
	follower_count: number;
}

export async function listPopularCreators(
	client: DalClient,
	limit = 10,
): Promise<PopularCreator[]> {
	try {
		const { data: users, error } = await client
			.from("users")
			.select("id, username, display_name, avatar_url, is_verified")
			.limit(limit);

		if (error || !users || users.length === 0) {
			return [];
		}

		type UserBase = {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
			is_verified: boolean;
		};
		const typedUsers = users as unknown as UserBase[];

		const creatorsWithStats = await Promise.all(
			typedUsers.map(async (u) => {
				const [{ count: followerCount }, { count: presetCount }] =
					await Promise.all([
						client
							.from("follows")
							.select("*", { count: "exact", head: true })
							.eq("following_id", u.id),
						client
							.from("presets")
							.select("*", { count: "exact", head: true })
							.eq("creator_id", u.id)
							.eq("status", "published"),
					]);

				return {
					...u,
					follower_count: followerCount ?? 0,
					preset_count: presetCount ?? 0,
				};
			}),
		);

		return creatorsWithStats;
	} catch (error) {
		console.error("Failed to list popular creators:", error);
		return [];
	}
}

export const RESERVED_USERNAMES = [
	"admin",
	"administrator",
	"system",
	"guest",
	"anonymous",
	"support",
	"api",
	"settings",
	"profile",
	"me",
	"home",
	"explore",
	"upload",
	"dashboard",
	"notifications",
	"bookmarks",
	"likes",
	"login",
	"register",
	"auth",
	"credits",
];

export async function isUsernameAvailable(
	client: DalClient,
	username: string,
	currentUserId?: string,
) {
	const normalized = username.trim().toLowerCase();
	if (!normalized || normalized.length < 3 || normalized.length > 30) {
		return {
			available: false,
			reason: "Username must be 3-30 characters long.",
		};
	}

	if (!/^[a-z0-9_-]+$/.test(normalized)) {
		return {
			available: false,
			reason: "Only letters, numbers, underscores, and hyphens allowed.",
		};
	}

	if (RESERVED_USERNAMES.includes(normalized)) {
		return { available: false, reason: "This username is reserved." };
	}

	const { data: existingUser, error } = await client
		.from("users")
		.select("id, username")
		.ilike("username", normalized)
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (existingUser) {
		const validExisting = existingUser as unknown as {
			id: string;
			username: string;
		};
		if (currentUserId && validExisting.id === currentUserId) {
			return { available: true, isCurrent: true, reason: "Username available" };
		}
		return { available: false, reason: "Username is already taken." };
	}

	return { available: true, isCurrent: false, reason: "Username available" };
}

export async function updateUserProfile(
	client: DalClient,
	targetUsername: string,
	input: UpdateUserProfileInput,
) {
	const { data: targetUser, error: selectError } = await client
		.from("users")
		.select("id, username")
		.ilike("username", targetUsername)
		.maybeSingle();

	if (selectError) throw selectError;
	const validTargetUser = assertExists(
		targetUser,
		"User was not found.",
	) as unknown as { id: string; username: string };

	if (input.username) {
		const normalizedUsername = input.username.trim().toLowerCase();
		const checkResult = await isUsernameAvailable(
			client,
			normalizedUsername,
			validTargetUser.id,
		);
		if (!checkResult.available) {
			throw new ApiError({
				code: "bad_request",
				message: checkResult.reason,
			});
		}
	}

	const updatePayload: UserUpdate = {
		...input,
		username: input.username ? input.username.trim().toLowerCase() : undefined,
		updated_at: new Date().toISOString(),
	};

	const { data: updatedUser, error: updateError } = await client
		.from("users")
		.update(updatePayload as never)
		.eq("id", validTargetUser.id)
		.select(PUBLIC_USER_SELECT)
		.single();

	if (updateError) {
		handleDuplicateKey(updateError, "Username is already taken.");
		throw updateError;
	}
	return { targetUser: validTargetUser, updatedUser };
}

export async function followUser(
	client: DalClient,
	followerId: string,
	targetUsername: string,
) {
	const { data: targetUser, error: selectError } = await client
		.from("users")
		.select("id, username")
		.ilike("username", targetUsername)
		.maybeSingle();

	if (selectError) throw selectError;
	const validTargetUser = assertExists(
		targetUser,
		"User was not found.",
	) as unknown as { id: string; username: string };

	if (validTargetUser.id === followerId) {
		throw new ApiError({
			code: "bad_request",
			message: "You cannot follow yourself.",
		});
	}

	const { error: insertError } = await client
		.from("follows")
		.upsert(
			{ follower_id: followerId, following_id: validTargetUser.id } as never,
			{ onConflict: "follower_id,following_id" },
		);

	if (insertError) {
		handleDuplicateKey(insertError, "You are already following this user.");
	}

	// Trigger Notification for target user
	try {
		await createNotification(client, {
			userId: validTargetUser.id,
			actorId: followerId,
			type: "follow",
			message: "started following you",
		});
	} catch (e) {
		console.error("Failed to trigger follow notification", e);
	}

	return {
		following_id: validTargetUser.id,
		following_username: validTargetUser.username,
		following: true,
	};
}

export async function unfollowUser(
	client: DalClient,
	followerId: string,
	targetUsername: string,
) {
	const { data: targetUser, error: selectError } = await client
		.from("users")
		.select("id")
		.ilike("username", targetUsername)
		.maybeSingle();

	if (selectError) throw selectError;
	const validTargetUser = assertExists(
		targetUser,
		"User was not found.",
	) as unknown as { id: string; username?: string };

	const { error: deleteError } = await client
		.from("follows")
		.delete()
		.eq("follower_id", followerId)
		.eq("following_id", validTargetUser.id);

	if (deleteError) throw deleteError;
}
