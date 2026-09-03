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
		const { userId, username, role } = body;

		if (
			(!userId || typeof userId !== "string" || !userId.trim()) &&
			(!username || typeof username !== "string" || !username.trim())
		) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "User ID or username is required",
				}),
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
		if (
			(userId === profile.id ||
				(username &&
					username.toLowerCase() === profile.username.toLowerCase())) &&
			role !== "admin"
		) {
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

		const clientsToTry = serviceSupabase
			? [serviceSupabase, supabase]
			: [supabase];

		// 5. Verify target user exists by ID or by username (avoid selecting 'role' in case column hasn't migrated)
		let targetRecord: {
			id: string;
			username: string;
			display_name: string;
			is_staff?: boolean;
		} | null = null;

		for (const client of clientsToTry) {
			if (targetRecord) break;

			// A. Try finding by UUID if userId looks like UUID
			if (
				userId &&
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
					userId.trim(),
				)
			) {
				const { data, error } = await client
					.from("users")
					.select("id, username, display_name, is_staff")
					.eq("id", userId.trim())
					.maybeSingle();

				if (data && !error) {
					targetRecord = data as any;
					break;
				}
			}

			// B. Try finding by username
			const targetUsername =
				username || (userId && !userId.includes("-") ? userId : null);

			if (targetUsername) {
				const { data, error } = await client
					.from("users")
					.select("id, username, display_name, is_staff")
					.ilike("username", targetUsername.trim())
					.maybeSingle();

				if (data && !error) {
					targetRecord = data as any;
					break;
				}
			}
		}

		if (!targetRecord) {
			return apiErrorResponse(
				new ApiError({ code: "not_found", message: "User not found" }),
			);
		}

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

		// 6. Perform UPDATE on public.users (try RPC first, then direct table update)
		let updatedUser: {
			id: string;
			username: string;
			display_name: string;
			role: string;
			is_staff: boolean;
		} | null = null;

		// A. Try Security Definer RPC function if available
		for (const client of clientsToTry) {
			if (updatedUser) break;
			try {
				const rpcRes = await (
					client.rpc as unknown as (
						fn: string,
						args: Record<string, unknown>,
					) => Promise<{ data: unknown; error: unknown }>
				)("admin_update_user_role", {
					target_user_id: targetRecord.id,
					target_role: role,
				});

				if (!rpcRes.error && rpcRes.data) {
					const rpcData = rpcRes.data as any;
					updatedUser = {
						id: rpcData.id || targetRecord.id,
						username: rpcData.username || targetRecord.username,
						display_name: targetRecord.display_name,
						role,
						is_staff: isStaff,
					};
				}
			} catch {
				// RPC may not be installed, proceed to direct update
			}
		}

		// B. Direct table update fallback
		if (!updatedUser) {
			for (const client of clientsToTry) {
				if (updatedUser) break;

				// Try updating both role and is_staff
				let res = await client
					.from("users")
					.update({ role, is_staff: isStaff } as never)
					.eq("id", targetRecord.id)
					.select("id, username, display_name, is_staff")
					.maybeSingle();

				// If error (e.g. column 'role' does not exist in schema), update only is_staff
				if (
					res.error &&
					(res.error.code === "42703" || res.error.message?.includes("role"))
				) {
					res = await client
						.from("users")
						.update({ is_staff: isStaff } as never)
						.eq("id", targetRecord.id)
						.select("id, username, display_name, is_staff")
						.maybeSingle();
				}

				if (!res.error && res.data) {
					const d = res.data as any;
					updatedUser = {
						id: d.id,
						username: d.username,
						display_name: d.display_name,
						role,
						is_staff: isStaff,
					};
				}
			}
		}

		// C. Synchronize auth.users app_metadata if serviceSupabase is available
		if (serviceSupabase && targetRecord.id) {
			try {
				await serviceSupabase.auth.admin.updateUserById(targetRecord.id, {
					app_metadata: { role },
				});
			} catch (authErr) {
				console.warn("Could not sync auth.users metadata:", authErr);
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
			message: `Account @${updatedUser.username} ${role === "admin" ? "dijadikan Admin" : "dicabut dari Admin"} berhasil.`,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
