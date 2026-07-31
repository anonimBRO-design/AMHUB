import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiNoContent, apiErrorResponse } from "@/lib/api/responses";
import { ApiError } from "@/lib/api/errors";

const usernameRouteParamsSchema = z.object({
	username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = validateRouteParams(await params, usernameRouteParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:follow",
			limit: 30,
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

		if (targetUser.id === profile.id) {
			throw new ApiError({
				code: "bad_request",
				message: "You cannot follow yourself.",
			});
		}

		const { error: insertError } = await supabase
			.from("follows")
			.upsert(
				{ follower_id: profile.id, following_id: targetUser.id },
				{ onConflict: "follower_id,following_id" }
			);

		if (insertError) throw insertError;

		return apiResponse({
			following_id: targetUser.id,
			following_username: targetUser.username,
			following: true,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = validateRouteParams(await params, usernameRouteParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:follow",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const { data: targetUser, error: selectError } = await supabase
			.from("users")
			.select("id")
			.ilike("username", username)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!targetUser) {
			throw new ApiError({ code: "not_found", message: "User was not found." });
		}

		const { error: deleteError } = await supabase
			.from("follows")
			.delete()
			.eq("follower_id", profile.id)
			.eq("following_id", targetUser.id);

		if (deleteError) throw deleteError;

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
