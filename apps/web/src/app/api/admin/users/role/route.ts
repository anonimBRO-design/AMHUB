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

		const { supabase, profile, user } = authContext;

		// 2. Validate admin role from server-verified profile / auth token
		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		// 3. Validate request payload
		const body = await request.json().catch(() => ({}));
		const { userId, role } = body;

		if (!userId || typeof userId !== "string" || !userId.trim()) {
			return apiErrorResponse(
				new ApiError({ code: "bad_request", message: "User ID is required" }),
			);
		}

		if (role !== "admin" && role !== "user") {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: 'Role must be either "admin" or "user"',
				}),
			);
		}

		// Prevent self-demotion
		if (userId === profile.id && role !== "admin") {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "You cannot revoke your own admin permissions.",
				}),
			);
		}

		// 4. Instantiate Service Role Client for privileged update
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable for role update:", e);
		}

		const activeClient = serviceSupabase || supabase;

		// 5. Verify target user exists
		const { data: targetUser, error: fetchErr } = await activeClient
			.from("users")
			.select("id, username, display_name, role, is_staff")
			.eq("id", userId)
			.maybeSingle();

		if (fetchErr || !targetUser) {
			return apiErrorResponse(
				new ApiError({ code: "not_found", message: "User not found" }),
			);
		}

		const targetRecord = targetUser as unknown as {
			id: string;
			username: string;
			display_name: string;
			role?: string;
			is_staff?: boolean;
		};

		// Prevent demoting the founder @afgan
		if (targetRecord.username.toLowerCase() === "afgan" && role !== "admin") {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Founder @afgan cannot be demoted from admin.",
				}),
			);
		}

		const isStaff = role === "admin";

		// 6. Perform UPDATE on public.users
		let updatedUser: {
			id: string;
			username: string;
			display_name: string;
			role: string;
			is_staff: boolean;
		} | null = null;

		if (serviceSupabase) {
			const res = await serviceSupabase
				.from("users")
				.update({ role, is_staff: isStaff } as never)
				.eq("id", userId)
				.select("id, username, display_name, role, is_staff")
				.maybeSingle();

			if (!res.error && res.data) {
				updatedUser = res.data as unknown as {
					id: string;
					username: string;
					display_name: string;
					role: string;
					is_staff: boolean;
				};

				// Synchronize app_metadata on auth.users
				try {
					await serviceSupabase.auth.admin.updateUserById(userId, {
						app_metadata: { role },
					});
				} catch (authErr) {
					console.warn("Failed to sync auth.users metadata:", authErr);
				}
			}
		}

		// Fallback direct update via activeClient if service client is unavailable
		if (!updatedUser) {
			const res = await activeClient
				.from("users")
				.update({ role, is_staff: isStaff } as never)
				.eq("id", userId)
				.select("id, username, display_name, role, is_staff")
				.maybeSingle();

			if (!res.error && res.data) {
				updatedUser = res.data as unknown as {
					id: string;
					username: string;
					display_name: string;
					role: string;
					is_staff: boolean;
				};
			}
		}

		if (!updatedUser) {
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: "Failed to update user role in database.",
				}),
			);
		}

		return apiResponse({
			success: true,
			user: updatedUser,
			message: `Account @${updatedUser.username} ${role === "admin" ? "promoted to Admin" : "demoted to regular User"} successfully.`,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
