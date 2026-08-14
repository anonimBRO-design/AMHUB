import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { profile, user } = await requireApiProfile();

		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q")?.trim() || "";

		const serviceSupabase = createSupabaseServiceClient();

		let dbQuery = serviceSupabase
			.from("users")
			.select(
				"id, username, display_name, email, avatar_url, level, is_staff, is_verified, created_at, updated_at",
				{ count: "exact" },
			);

		if (query) {
			dbQuery = dbQuery.or(
				`username.ilike.%${query}%,email.ilike.%${query}%,display_name.ilike.%${query}%`,
			);
		}

		dbQuery = dbQuery.order("created_at", { ascending: false });

		const { data: users, count, error } = await dbQuery;

		if (error) {
			console.error("Admin user search failed:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: "Failed to fetch user list.",
			});
		}

		const mappedUsers = (users || []).map((u) => {
			const raw = u as unknown as {
				id: string;
				username: string;
				display_name: string;
				email: string;
				avatar_url?: string | null;
				level: number;
				is_staff: boolean;
				is_verified: boolean;
				created_at: string;
				updated_at: string;
				role?: string | null;
			};
			return {
				...raw,
				role:
					raw.role ||
					(raw.is_staff || raw.username.toLowerCase() === "afgan"
						? "admin"
						: "user"),
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
		const { profile: callerProfile, user: callerUser } =
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

		const serviceSupabase = createSupabaseServiceClient();

		// Fetch target user profile
		const { data: targetUser, error: fetchErr } = await serviceSupabase
			.from("users")
			.select("id, username, is_staff")
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

		// Step 1: Clean up Storage Files
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

		// Step 2: Delete related DB content safely
		// 2a. Notifications
		await serviceSupabase
			.from("notifications")
			.delete()
			.or(`user_id.eq.${targetUserId},actor_id.eq.${targetUserId}`);

		// 2b. Likes & Bookmarks
		await serviceSupabase
			.from("preset_likes")
			.delete()
			.eq("user_id", targetUserId);
		await serviceSupabase
			.from("preset_bookmarks")
			.delete()
			.eq("user_id", targetUserId);

		// 2c. Follows
		await serviceSupabase
			.from("follows")
			.delete()
			.or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`);

		// 2d. Comments
		await serviceSupabase
			.from("comments")
			.delete()
			.eq("user_id", targetUserId);

		// 2e. Presets created by user
		const { data: rawPresets } = await serviceSupabase
			.from("presets")
			.select("id")
			.eq("creator_id", targetUserId);

		const userPresets = (rawPresets || []) as unknown as Array<{ id: string }>;

		if (userPresets.length > 0) {
			const presetIds = userPresets.map((p) => p.id);
			for (const pid of presetIds) {
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

		// 2f. Collections owned by user
		const { data: rawCollections } = await serviceSupabase
			.from("collections")
			.select("id")
			.eq("owner_id", targetUserId);

		const userCollections = (rawCollections || []) as unknown as Array<{ id: string }>;

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

		// 2g. Delete from public.users table
		const { error: deleteProfileErr } = await serviceSupabase
			.from("users")
			.delete()
			.eq("id", targetUserId);

		if (deleteProfileErr) {
			console.error("Failed to delete user profile:", deleteProfileErr);
			throw new ApiError({
				code: "internal_server_error",
				message: "Failed to delete user profile record.",
			});
		}

		// Step 3: Delete Auth User from auth.users using Supabase Admin Auth API
		const { error: deleteAuthErr } =
			await serviceSupabase.auth.admin.deleteUser(targetUserId);

		if (deleteAuthErr) {
			console.warn("Auth user delete warning:", deleteAuthErr);
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
