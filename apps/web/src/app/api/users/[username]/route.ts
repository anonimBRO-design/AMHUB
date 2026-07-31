import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { assertOwnerOrStaff } from "@/lib/api/authorization";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import type { Database } from "@presethub/types";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

const usernameRouteParamsSchema = z.object({
	username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
});

const updateUserProfileSchema = z.object({
	display_name: z.string().trim().min(1).max(80).optional(),
	bio: z.string().trim().max(280).nullable().optional(),
	avatar_url: z.string().url().nullable().optional(),
	banner_url: z.string().url().nullable().optional(),
	website_url: z.string().url().nullable().optional(),
	tiktok_handle: z.string().trim().max(50).nullable().optional(),
	instagram_handle: z.string().trim().max(50).nullable().optional(),
	discord_handle: z.string().trim().max(50).nullable().optional(),
	youtube_url: z.string().url().nullable().optional(),
	country_code: z.string().trim().length(2).toUpperCase().nullable().optional(),
});

const publicUserSelect = `
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

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = validateRouteParams(await params, usernameRouteParamsSchema);
		const supabase = await createSupabaseServerClient();

		const { data: user, error } = await supabase
			.from("users")
			.select(publicUserSelect)
			.ilike("username", username)
			.maybeSingle();

		if (error) throw error;
		if (!user) {
			throw new ApiError({ code: "not_found", message: "User was not found." });
		}

		const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
			supabase
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("following_id", user.id),
			supabase
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("follower_id", user.id),
		]);

		let isFollowing = false;
		const authContext = await getApiUser();
		if (authContext?.user && authContext.user.id !== user.id) {
			const { data: followRecord } = await supabase
				.from("follows")
				.select("follower_id")
				.eq("follower_id", authContext.user.id)
				.eq("following_id", user.id)
				.maybeSingle();

			isFollowing = Boolean(followRecord);
		}

		return apiResponse({
			...user,
			follower_count: followerCount ?? 0,
			following_count: followingCount ?? 0,
			is_following: authContext?.user ? isFollowing : undefined,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = validateRouteParams(await params, usernameRouteParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:update",
			limit: 15,
			windowMs: 60000,
			userId: profile.id,
		});

		const { data: targetUser, error: selectError } = await supabase
			.from("users")
			.select("id, username")
			.ilike("username", username)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!targetUser) {
			throw new ApiError({ code: "not_found", message: "User was not found." });
		}

		assertOwnerOrStaff(profile.id, targetUser.id, profile);

		const input = await validateJson(request, updateUserProfileSchema);

		const updatePayload: UserUpdate = {
			...input,
			updated_at: new Date().toISOString(),
		};

		const { data: updatedUser, error: updateError } = await supabase
			.from("users")
			.update(updatePayload as never)
			.eq("id", targetUser.id)
			.select(publicUserSelect)
			.single();

		if (updateError) throw updateError;

		return apiResponse(updatedUser);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
