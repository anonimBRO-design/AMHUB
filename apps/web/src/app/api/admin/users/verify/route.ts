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
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable for verify operation:", e);
		}

		const activeClient = serviceSupabase || supabase;

		// 5. Verify target user exists
		const { data: targetUser, error: fetchErr } = await activeClient
			.from("users")
			.select("id, username, display_name, is_verified")
			.eq("id", userId)
			.maybeSingle();

		if (fetchErr || !targetUser) {
			return apiErrorResponse(
				new ApiError({ code: "not_found", message: "User not found" }),
			);
		}

		// 6. Perform UPDATE on public.users using Service Role or Security Definer RPC
		let updatedUser: {
			id: string;
			username: string;
			display_name: string;
			is_verified: boolean;
		} | null = null;
		let updateErr: unknown = null;

		if (serviceSupabase) {
			const res = await serviceSupabase
				.from("users")
				.update({ is_verified } as never)
				.eq("id", userId)
				.select("id, username, display_name, is_verified")
				.maybeSingle();

			if (!res.error && res.data) {
				updatedUser = res.data as unknown as {
					id: string;
					username: string;
					display_name: string;
					is_verified: boolean;
				};
			} else {
				updateErr = res.error;
			}
		}

		// Fallback to SECURITY DEFINER RPC function if direct update failed or serviceSupabase unavailable
		if (!updatedUser) {
			try {
				const rpcRes = await (
					activeClient.rpc as unknown as (
						fn: string,
						args: Record<string, unknown>,
					) => Promise<{ data: unknown; error: unknown }>
				)("admin_verify_user", {
					target_user_id: userId,
					target_status: is_verified,
				});

				if (!rpcRes.error && rpcRes.data) {
					const rpcData = rpcRes.data as unknown as {
						id: string;
						username: string;
						is_verified: boolean;
					};
					updatedUser = {
						id: rpcData.id,
						username: rpcData.username,
						display_name: (targetUser as { display_name: string }).display_name,
						is_verified: rpcData.is_verified,
					};
				} else if (rpcRes.error) {
					updateErr = rpcRes.error;
				}
			} catch (e) {
				updateErr = e;
			}
		}

		if (!updatedUser) {
			console.error("Failed to update verification status:", updateErr);
			const errObj = updateErr as { message?: string; code?: string } | null;
			const rawMsg = errObj?.message || "";
			let userMsg = rawMsg || "Failed to update verification status";

			if (rawMsg.includes("schema cache") || errObj?.code === "PGRST202") {
				userMsg =
					"Database migration required: Function public.admin_verify_user is not installed in Supabase. Please run 20260815000000_admin_users_rpc_permissions.sql in Supabase SQL Editor.";
			} else if (
				rawMsg.includes("permission denied") ||
				errObj?.code === "42501"
			) {
				userMsg =
					"Permission denied (42501): Ensure SUPABASE_SERVICE_ROLE_KEY is configured in Vercel Environment Variables and run 20260815000000_admin_users_rpc_permissions.sql in Supabase SQL Editor.";
			}

			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: userMsg,
				}),
			);
		}

		return apiResponse({
			success: true,
			user: updatedUser,
			message: `Account @${updatedUser.username} ${is_verified ? "verified" : "unverified"} successfully.`,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
