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
			const msg =
				authErr instanceof Error ? authErr.message : "Authentication failed";
			return apiErrorResponse(
				new ApiError({ code: "unauthorized", message: `Auth Error: ${msg}` }),
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

		// Attempt to instantiate service role client, fallback to authenticated caller client if key is missing/invalid
		let dbClient = supabase;
		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch (e) {
			console.warn(
				"Service role client unavailable, using authenticated admin client:",
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

		// Query users matching the pattern used by Home page (select("*"))
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

		// Try ordering by created_at, fallback to unordered query if created_at column is missing
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
			throw new ApiError({
				code: "internal_server_error",
				message: `Database error (${error.code || "UNKNOWN"}): ${error.message || JSON.stringify(error)}`,
			});
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
		const { supabase, profile: callerProfile, user: callerUser } =
			await requireApiProfile();

		if (!isAdminProfile(callerProfile, callerUser)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		const body = await request.json().catch(() => ({}));
		const { userId: targetUserId } = body;

		if (!targetUserId || typeof targetUserId !== "string") {
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

		let serviceSupabase: ReturnType<typeof createSupabaseServiceClient> | null =
			null;
		try {
			serviceSupabase = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable for delete operation:", e);
		}

		const dbClient = serviceSupabase || supabase;

		// Fetch target user profile
		const { data: targetUser, error: fetchErr } = await dbClient
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

		// Prevent deleting another admin or @afgan
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

		// Step 1: Clean up Storage Files if serviceSupabase is available
		if (serviceSupabase) {
			const buckets = [
				"avatars",
				"thumbnails",
				"preset-files",
				"preset-videos",
			];
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

		// Step 2: Delete related DB content safely
		// 2a. Notifications
		await dbClient
			.from("notifications")
			.delete()
			.or(`user_id.eq.${targetUserId},actor_id.eq.${targetUserId}`);

		// 2b. Likes & Bookmarks
		await dbClient.from("preset_likes").delete().eq("user_id", targetUserId);
		await dbClient
			.from("preset_bookmarks")
			.delete()
			.eq("user_id", targetUserId);

		// 2c. Follows
		await dbClient
			.from("follows")
			.delete()
			.or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`);

		// 2d. Comments
		await dbClient.from("comments").delete().eq("user_id", targetUserId);

		// 2e. Presets created by user
		const { data: rawPresets } = await dbClient
			.from("presets")
			.select("id")
			.eq("creator_id", targetUserId);

		const userPresets = (rawPresets || []) as unknown as Array<{ id: string }>;

		if (userPresets.length > 0) {
			const presetIds = userPresets.map((p) => p.id);
			for (const pid of presetIds) {
				await dbClient.from("preset_tags").delete().eq("preset_id", pid);
				await dbClient.from("preset_likes").delete().eq("preset_id", pid);
				await dbClient.from("preset_bookmarks").delete().eq("preset_id", pid);
				await dbClient.from("collection_items").delete().eq("preset_id", pid);
				await dbClient.from("comments").delete().eq("preset_id", pid);
				await dbClient.from("notifications").delete().eq("preset_id", pid);
			}
			await dbClient.from("presets").delete().eq("creator_id", targetUserId);
		}

		// 2f. Collections owned by user
		const { data: rawCollections } = await dbClient
			.from("collections")
			.select("id")
			.eq("owner_id", targetUserId);

		const userCollections = (rawCollections || []) as unknown as Array<{
			id: string;
		}>;

		if (userCollections.length > 0) {
			for (const col of userCollections) {
				await dbClient
					.from("collection_items")
					.delete()
					.eq("collection_id", col.id);
			}
			await dbClient
				.from("collections")
				.delete()
				.eq("owner_id", targetUserId);
		}

		// 2g. Delete from public.users table
		const { error: deleteProfileErr } = await dbClient
			.from("users")
			.delete()
			.eq("id", targetUserId);

		if (deleteProfileErr) {
			console.error("Failed to delete user profile:", deleteProfileErr);
			throw new ApiError({
				code: "internal_server_error",
				message: `Failed to delete user profile record (${deleteProfileErr.code || "UNKNOWN"}): ${deleteProfileErr.message || JSON.stringify(deleteProfileErr)}`,
			});
		}

		// Step 3: Delete Auth User from auth.users using Supabase Admin Auth API if serviceSupabase available
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
