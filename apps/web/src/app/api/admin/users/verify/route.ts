import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
	try {
		// 1. Authenticate caller and ensure user profile exists
		let authContext: Awaited<ReturnType<typeof requireApiProfile>>;
		try {
			authContext = await requireApiProfile();
		} catch {
			return apiErrorResponse(
				new ApiError({
					code: "unauthorized",
					message: "Authentication is required",
				}),
			);
		}

		const { profile, user } = authContext;

		// 2. Validate admin role from server-verified profile / auth token
		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		// 3. Validate request payload
		const body = await request.json().catch(() => ({}));
		const { userId, is_verified } = body;

		if (!userId || typeof userId !== "string" || !userId.trim()) {
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

		// 4. Instantiate Service Role Client for privileged update
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient>;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.error("Service role client unavailable for verify operation:", e);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message:
						"Server configuration error: Service role credentials unavailable",
				}),
			);
		}

		// 5. Verify target user exists
		const { data: targetUser, error: fetchErr } = await serviceSupabase
			.from("users")
			.select("id, username, display_name, is_verified")
			.eq("id", userId)
			.maybeSingle();

		if (fetchErr || !targetUser) {
			return apiErrorResponse(
				new ApiError({ code: "not_found", message: "User not found" }),
			);
		}

		// 6. Perform UPDATE on public.users
		const { data: updatedUser, error: updateErr } = await serviceSupabase
			.from("users")
			.update({ is_verified } as never)
			.eq("id", userId)
			.select("id, username, display_name, is_verified")
			.single();

		if (updateErr || !updatedUser) {
			console.error("Failed to update verification status:", updateErr);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: "Failed to update verification status",
				}),
			);
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

