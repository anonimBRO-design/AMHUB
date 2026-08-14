import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
	try {
		const { supabase, profile, user } = await requireApiProfile();

		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		const body = await request.json().catch(() => ({}));
		const { userId, is_verified } = body;

		if (!userId || typeof userId !== "string") {
			return apiErrorResponse(
				new ApiError({ code: "bad_request", message: "User ID is required" }),
			);
		}

		if (typeof is_verified !== "boolean") {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "is_verified must be a boolean",
				}),
			);
		}

		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable for verify operation:", e);
		}

		const dbClient = serviceSupabase || supabase;

		const { data: updatedUser, error } = await dbClient
			.from("users")
			.update({ is_verified } as never)
			.eq("id", userId)
			.select("id, username, display_name, is_verified")
			.single();

		if (error || !updatedUser) {
			console.error("Failed to update verification status:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: `Failed to update verification status: ${error?.message || "Unknown error"}`,
			});
		}

		const target = updatedUser as unknown as {
			id: string;
			username: string;
			display_name: string;
			is_verified: boolean;
		};

		return apiResponse({
			success: true,
			user: target,
			message: `Account @${target.username} ${is_verified ? "verified" : "unverified"} successfully.`,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
