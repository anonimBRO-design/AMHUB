import { ApiError } from "@/lib/api/errors";
import type { Database, UpdateUserProfileInput, User } from "@presethub/types";
import { assertExists, handleDuplicateKey } from "./helpers";
import { isMockFallbackEnabled, serveMockFallback } from "./mock-fallback";
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

import { MOCK_CREATORS } from "@/data/mock-data";

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

		if (error) throw error;

		if (user) {
			const validUser = user as unknown as User;
			const [{ count: followerCount }, { count: followingCount }] =
				await Promise.all([
					client
						.from("follows")
						.select("*", { count: "exact", head: true })
						.eq("following_id", validUser.id),
					client
						.from("follows")
						.select("*", { count: "exact", head: true })
						.eq("follower_id", validUser.id),
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
				is_following: currentUserId ? isFollowing : undefined,
			};
		}

		if (!isMockFallbackEnabled()) {
			throw new ApiError({
				code: "not_found",
				message: "User was not found.",
			});
		}

		return serveMockFallback("getUserByUsername", () => {
			const found =
				MOCK_CREATORS.find(
					(c) => c.username.toLowerCase() === username.toLowerCase(),
				) ?? MOCK_CREATORS[0];

			return {
				...found,
				is_following: false,
			};
		});
	} catch (error) {
		if (!isMockFallbackEnabled()) throw error;
		return serveMockFallback("getUserByUsername", () => {
			const found =
				MOCK_CREATORS.find(
					(c) => c.username.toLowerCase() === username.toLowerCase(),
				) ?? MOCK_CREATORS[0];

			return {
				...found,
				is_following: false,
			};
		});
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

		if (error) throw error;

		if (data) return data;

		if (!isMockFallbackEnabled()) {
			return null;
		}

		return serveMockFallback("getUserByUsernameOrNull", () => {
			const found = MOCK_CREATORS.find(
				(c) => c.username.toLowerCase() === username.toLowerCase(),
			);
			return found ?? null;
		});
	} catch (error) {
		if (!isMockFallbackEnabled()) throw error;
		return serveMockFallback("getUserByUsernameOrNull", () => {
			const found = MOCK_CREATORS.find(
				(c) => c.username.toLowerCase() === username.toLowerCase(),
			);
			return found ?? null;
		});
	}
}

export async function getUserById(client: DalClient, userId: string) {
	try {
		const { data, error } = await client
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) throw error;

		if (data) return data;

		if (!isMockFallbackEnabled()) {
			return null;
		}

		return serveMockFallback("getUserById", () => {
			const found = MOCK_CREATORS.find((c) => c.id === userId);
			return found ?? null;
		});
	} catch (error) {
		if (!isMockFallbackEnabled()) throw error;
		return serveMockFallback("getUserById", () => {
			const found = MOCK_CREATORS.find((c) => c.id === userId);
			return found ?? null;
		});
	}
}

export async function getFollowerCount(client: DalClient, userId: string) {
	try {
		const { count, error } = await client
			.from("follows")
			.select("*", { count: "exact", head: true })
			.eq("following_id", userId);

		if (error) throw error;

		if (typeof count === "number") return count;

		if (!isMockFallbackEnabled()) {
			return 0;
		}

		return serveMockFallback("getFollowerCount", () => {
			const found = MOCK_CREATORS.find((c) => c.id === userId);
			return found ? found.follower_count : 48500;
		});
	} catch (error) {
		if (!isMockFallbackEnabled()) throw error;
		return serveMockFallback("getFollowerCount", () => {
			const found = MOCK_CREATORS.find((c) => c.id === userId);
			return found ? found.follower_count : 48500;
		});
	}
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

	const updatePayload: UserUpdate = {
		...input,
		updated_at: new Date().toISOString(),
	};

	const { data: updatedUser, error: updateError } = await client
		.from("users")
		.update(updatePayload as never)
		.eq("id", validTargetUser.id)
		.select(PUBLIC_USER_SELECT)
		.single();

	if (updateError) throw updateError;
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
