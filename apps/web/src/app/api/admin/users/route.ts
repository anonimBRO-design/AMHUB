import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		let authContext: Awaited<ReturnType<typeof requireApiProfile>>;
		try {
			authContext = await requireApiProfile();
		} catch (authErr) {
			console.error("Admin user list auth error:", authErr);
			return apiErrorResponse(
				new ApiError({
					code: "unauthorized",
					message: "Authentication is required",
				}),
			);
		}

		const { supabase, profile, user } = authContext;

		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({
					code: "forbidden",
					message: `Admin access required (Logged in as @${profile?.username || "unknown"})`,
				}),
			);
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q")?.trim() || "";

		// Attempt to instantiate service role client, fallback to caller client for read-only user query
		let dbClient = supabase;
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch (e) {
			console.warn(
				"Service role client unavailable, using authenticated admin client for search:",
				e,
			);
		}

		// Fetch auth users to build email map server-side securely if service role client is available
		const emailMap = new Map<string, string>();
		if (serviceSupabase) {
			try {
				const { data: authData } =
					await serviceSupabase.auth.admin.listUsers();
				if (authData?.users) {
					for (const au of authData.users) {
						if (au.id && au.email) {
							emailMap.set(au.id, au.email);
						}
					}
				}
			} catch (e) {
				console.warn("Could not fetch auth users for email map:", e);
			}
		}

		// Query users matching the pattern used by Home page
		let dbQuery = dbClient.from("users").select("*", { count: "exact" });

		if (query) {
			const matchingEmailUserIds = Array.from(emailMap.entries())
				.filter(([_, email]) =>
					email.toLowerCase().includes(query.toLowerCase()),
				)
				.map(([id]) => id);

			if (matchingEmailUserIds.length > 0) {
				dbQuery = dbQuery.or(
					`username.ilike.%${query}%,display_name.ilike.%${query}%,id.in.(${matchingEmailUserIds.join(",")})`,
				);
			} else {
				dbQuery = dbQuery.or(
					`username.ilike.%${query}%,display_name.ilike.%${query}%`,
				);
			}
		}

		let usersResult = await dbQuery.order("created_at", { ascending: false });

		if (usersResult.error) {
			console.warn(
				"Order by created_at failed, retrying without ordering:",
				usersResult.error,
			);
			usersResult = await dbQuery;
		}

		const { data: users, count, error } = usersResult;

		if (error) {
			console.error("Admin user search failed:", error);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: "Database error while fetching users",
				}),
			);
		}

		const mappedUsers = (users || []).map((u) => {
			const raw = u as unknown as Record<string, unknown>;
			const id = String(raw.id || "");
			const username = String(raw.username || "");
			const displayName = String(raw.display_name || username || "User");
			const avatarUrl = (raw.avatar_url as string | null) || null;
			const isStaff = Boolean(raw.is_staff);
			const isVerified = Boolean(raw.is_verified);
			const level = typeof raw.level === "number" ? raw.level : 1;
			const createdAt = String(raw.created_at || new Date().toISOString());
			const updatedAt = String(raw.updated_at || createdAt);
			const role = String(
				raw.role ||
					(isStaff || username.toLowerCase() === "afgan" ? "admin" : "user"),
			);

			return {
				id,
				username,
				display_name: displayName,
				email: emailMap.get(id) || (raw.email as string) || "",
				avatar_url: avatarUrl,
				level,
				is_staff: isStaff,
				is_verified: isVerified,
				created_at: createdAt,
				updated_at: updatedAt,
				role,
			};
		});

		return apiResponse({
			users: mappedUsers,
			total_count: count ?? mappedUsers.length,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(request: NextRequest) {
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

		const { supabase, profile: callerProfile, user: callerUser } = authContext;

		// 2. Validate admin role from server-verified profile / auth token
		if (!isAdminProfile(callerProfile, callerUser)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		// 3. Validate request payload
		const body = await request.json().catch(() => ({}));
		const { userId: targetUserId } = body;

		if (!targetUserId || typeof targetUserId !== "string" || !targetUserId.trim()) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Target user ID is required",
				}),
			);
		}

		if (targetUserId === callerProfile.id) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "You cannot delete your own admin account",
				}),
			);
		}

		// 4. Instantiate Service Role Client for privileged deletion
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable for delete operation:", e);
		}

		const activeClient = serviceSupabase || supabase;

		// 5. Fetch target user profile
		const { data: targetUser, error: fetchErr } = await activeClient
			.from("users")
			.select("*")
			.eq("id", targetUserId)
			.maybeSingle();

		if (fetchErr || !targetUser) {
			return apiErrorResponse(
				new ApiError({ code: "not_found", message: "User not found" }),
			);
		}

		const targetProfile = targetUser as unknown as {
			id: string;
			username: string;
			role?: string | null;
			is_staff?: boolean;
		};

		// 6. Prevent deleting another admin or @afgan
		if (
			targetProfile.username.toLowerCase() === "afgan" ||
			targetProfile.is_staff ||
			targetProfile.role === "admin"
		) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Cannot delete an admin user",
				}),
			);
		}

		// 7. Clean up Storage Files if serviceSupabase is available
		if (serviceSupabase) {
			const buckets = ["avatars", "thumbnails", "preset-files", "preset-videos"];
			for (const bucket of buckets) {
				try {
					const { data: files } = await serviceSupabase.storage
						.from(bucket)
						.list(targetUserId);
					if (files && files.length > 0) {
						const paths = files.map((f) => `${targetUserId}/${f.name}`);
						await serviceSupabase.storage.from(bucket).remove(paths);
					}
				} catch (e) {
					console.warn(`Storage cleanup warning for bucket ${bucket}:`, e);
				}
			}
		}

		// 8. Delete from DB using Service Role direct cascade or Security Definer RPC
		let deleteSuccess = false;
		let deleteErr: unknown = null;

		if (serviceSupabase) {
			try {
				await serviceSupabase
					.from("notifications")
					.delete()
					.or(`user_id.eq.${targetUserId},actor_id.eq.${targetUserId}`);
				await serviceSupabase
					.from("preset_likes")
					.delete()
					.eq("user_id", targetUserId);
				await serviceSupabase
					.from("preset_bookmarks")
					.delete()
					.eq("user_id", targetUserId);
				await serviceSupabase
					.from("follows")
					.delete()
					.or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`);
				await serviceSupabase
					.from("comments")
					.delete()
					.eq("user_id", targetUserId);

				const { data: rawPresets } = await serviceSupabase
					.from("presets")
					.select("id")
					.eq("creator_id", targetUserId);
				const userPresets = (rawPresets || []) as unknown as Array<{
					id: string;
				}>;
				if (userPresets.length > 0) {
					for (const pid of userPresets.map((p) => p.id)) {
						await serviceSupabase
							.from("preset_tags")
							.delete()
							.eq("preset_id", pid);
						await serviceSupabase
							.from("preset_likes")
							.delete()
							.eq("preset_id", pid);
						await serviceSupabase
							.from("preset_bookmarks")
							.delete()
							.eq("preset_id", pid);
						await serviceSupabase
							.from("collection_items")
							.delete()
							.eq("preset_id", pid);
						await serviceSupabase
							.from("comments")
							.delete()
							.eq("preset_id", pid);
						await serviceSupabase
							.from("notifications")
							.delete()
							.eq("preset_id", pid);
					}
					await serviceSupabase
						.from("presets")
						.delete()
						.eq("creator_id", targetUserId);
				}

				const { data: rawCollections } = await serviceSupabase
					.from("collections")
					.select("id")
					.eq("owner_id", targetUserId);
				const userCollections = (rawCollections || []) as unknown as Array<{
					id: string;
				}>;
				if (userCollections.length > 0) {
					for (const col of userCollections) {
						await serviceSupabase
							.from("collection_items")
							.delete()
							.eq("collection_id", col.id);
					}
					await serviceSupabase
						.from("collections")
						.delete()
						.eq("owner_id", targetUserId);
				}

				const { error: profileErr } = await serviceSupabase
					.from("users")
					.delete()
					.eq("id", targetUserId);

				if (!profileErr) {
					deleteSuccess = true;
				} else {
					deleteErr = profileErr;
				}
			} catch (e) {
				deleteErr = e;
			}
		}

		// Fallback to Security Definer RPC if direct service role deletion failed or serviceSupabase unavailable
		if (!deleteSuccess) {
			try {
				const rpcRes = await (
					activeClient.rpc as unknown as (
						fn: string,
						args: Record<string, unknown>,
					) => Promise<{ data: unknown; error: unknown }>
				)("admin_delete_user", {
					target_user_id: targetUserId,
				});

				if (!rpcRes.error) {
					deleteSuccess = true;
				} else {
					deleteErr = rpcRes.error;
				}
			} catch (e) {
				deleteErr = e;
			}
		}

		if (!deleteSuccess) {
			console.error("Failed to delete user profile:", deleteErr);
			const errObj = deleteErr as { message?: string } | null;
			let userMsg = errObj?.message || "Failed to delete user profile record";
			if (
				userMsg.includes("schema cache") ||
				userMsg.includes("permission denied")
			) {
				userMsg =
					"Migration required: Run 20260815000000_admin_users_rpc_permissions.sql in Supabase SQL Editor & check SUPABASE_SERVICE_ROLE_KEY in Vercel.";
			}
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: userMsg,
				}),
			);
		}

		// 9. Delete Auth User from auth.users using Supabase Admin Auth API
		if (serviceSupabase) {
			const { error: deleteAuthErr } =
				await serviceSupabase.auth.admin.deleteUser(targetUserId);

			if (deleteAuthErr) {
				console.warn("Auth user delete warning:", deleteAuthErr);
			}
		}

		return apiResponse({
			success: true,
			message: `User @${targetProfile.username} permanently deleted.`,
			deleted_user_id: targetUserId,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}


