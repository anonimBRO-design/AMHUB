import { getUserByUsername, updateUserProfile } from "@/dal/users.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { assertOwnerOrStaff } from "@/lib/api/authorization";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const usernameRouteParamsSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3)
		.max(30)
		.regex(/^[a-zA-Z0-9_-]+$/),
});

const updateUserProfileSchema = z.object({
	username: z
		.string()
		.trim()
		.toLowerCase()
		.min(3)
		.max(30)
		.regex(/^[a-z0-9_-]+$/)
		.optional(),
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

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		const { username } = validateRouteParams(
			await params,
			usernameRouteParamsSchema,
		);
		const supabase = await createSupabaseServerClient();
		const authContext = await getApiUser();

		const result = await getUserByUsername(
			supabase,
			username,
			authContext?.user?.id,
		);

		return apiResponse(result);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		const { username } = validateRouteParams(
			await params,
			usernameRouteParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:update",
			limit: 15,
			windowMs: 60000,
			userId: profile.id,
		});

		const input = await validateJson(request, updateUserProfileSchema);

		// We use a helper from DAL to get targetUser ID first for authorization check
		const { targetUser, updatedUser } = await (async () => {
			const { data: rawTUser, error: selectError } = await supabase
				.from("users")
				.select("id, username")
				.ilike("username", username)
				.maybeSingle();

			const tUser = rawTUser as { id: string; username: string } | null;

			if (selectError) throw selectError;
			if (!tUser) {
				const { ApiError } = await import("@/lib/api/errors");
				throw new ApiError({
					code: "not_found",
					message: "User was not found.",
				});
			}

			assertOwnerOrStaff(profile.id, tUser.id, profile);

			const { updatedUser } = await updateUserProfile(
				supabase,
				username,
				input,
			);
			return { targetUser: tUser, updatedUser };
		})();

		return apiResponse(updatedUser);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
