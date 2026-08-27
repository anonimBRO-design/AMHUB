import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type {
	CreateCreatorPermissionInput,
	CreatorPermission,
	CreatorPermissionStats,
} from "@presethub/types";
import type { NextRequest } from "next/server";

function generatePersonalizedPermissionMessage(
	creatorName: string,
	targetPresetName?: string | null,
): string {
	const name = creatorName.trim() ? creatorName.trim() : "kak";
	const presetMention = targetPresetName?.trim()
		? `preset "${targetPresetName.trim()}"`
		: "preset-preset";

	return `Halo ${name}, izin ya 🙏 Saya tertarik sama ${presetMention} yang kakak buat. Saya boleh menggunakan/mengambil preset tersebut untuk dipasang di website project saya, AMHUB? Saya akan tetap mencantumkan credit ke kakak sebagai kreatornya. Kalau boleh, kira-kira maksimal berapa preset yang diperbolehkan untuk saya ambil dan gunakan di AMHUB? Kalau tidak diperbolehkan juga tidak masalah. Terima kasih banyak, ${name}! 🙏`;
}

export async function GET(request: NextRequest) {
	try {
		let authContext: Awaited<ReturnType<typeof requireApiProfile>>;
		try {
			authContext = await requireApiProfile();
		} catch (authErr) {
			console.error("Creator permissions auth error:", authErr);
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
		const statusFilter = searchParams.get("status")?.trim() || "";

		let dbClient = supabase;
		try {
			const serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch {
			// Fallback to caller's authenticated client
		}

		let dbQuery = dbClient
			.from("creator_permissions")
			.select("*", { count: "exact" });

		if (statusFilter && statusFilter !== "all") {
			dbQuery = dbQuery.eq("status", statusFilter);
		}

		if (query) {
			dbQuery = dbQuery.or(
				`creator_username.ilike.%${query}%,creator_display_name.ilike.%${query}%,credit_display_name.ilike.%${query}%`,
			);
		}

		const {
			data: permissions,
			count,
			error,
		} = await dbQuery.order("created_at", { ascending: false });

		if (error) {
			console.error("Fetch creator permissions failed:", error);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: "Database error while fetching creator permissions",
				}),
			);
		}

		// Calculate stats breakdown
		const { data: allStatsData } = await (
			dbClient.from("creator_permissions") as unknown as {
				select: (
					cols: string,
				) => Promise<{ data: Array<{ status: string }> | null }>;
			}
		).select("status");

		const stats: CreatorPermissionStats = {
			total: allStatsData?.length || 0,
			pending: 0,
			contacted: 0,
			approved: 0,
			rejected: 0,
		};

		if (allStatsData) {
			for (const item of allStatsData) {
				const s = item.status as keyof Omit<CreatorPermissionStats, "total">;
				if (stats[s] !== undefined) {
					stats[s]++;
				}
			}
		}

		return apiResponse({
			permissions: (permissions || []) as CreatorPermission[],
			total_count: count ?? (permissions || []).length,
			stats,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	try {
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

		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({ code: "forbidden", message: "Admin access required" }),
			);
		}

		const body = (await request
			.json()
			.catch(() => ({}))) as CreateCreatorPermissionInput;
		const rawUsername = body.creator_username?.trim() || "";

		if (!rawUsername) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Creator username is required",
				}),
			);
		}

		// Normalize username: strip leading @ and lowercase
		const cleanUsername = rawUsername.replace(/^@+/, "").toLowerCase();
		const displayName = body.creator_display_name?.trim() || cleanUsername;
		const platform = body.platform || "tiktok";

		let profileUrl = body.profile_url?.trim() || "";
		if (!profileUrl) {
			if (platform === "tiktok") {
				profileUrl = `https://www.tiktok.com/@${cleanUsername}`;
			} else if (platform === "instagram") {
				profileUrl = `https://www.instagram.com/${cleanUsername}`;
			} else if (platform === "youtube") {
				profileUrl = `https://www.youtube.com/@${cleanUsername}`;
			} else {
				profileUrl = `https://${cleanUsername}`;
			}
		}

		const draftedMessage =
			body.drafted_message?.trim() ||
			generatePersonalizedPermissionMessage(
				displayName,
				body.target_preset_name,
			);

		let dbClient = supabase;
		try {
			const serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch {
			// Fallback to caller's authenticated client
		}

		const { data: newRecord, error } = await (
			dbClient.from("creator_permissions") as any
		)
			.insert({
				platform,
				creator_username: cleanUsername,
				creator_display_name: displayName,
				profile_url: profileUrl,
				avatar_url: body.avatar_url?.trim() || null,
				status: "pending",
				drafted_message: draftedMessage,
				credit_display_name: displayName,
				created_by: profile.id,
			})
			.select()
			.single();

		if (error) {
			if (error.code === "23505") {
				return apiErrorResponse(
					new ApiError({
						code: "conflict",
						message: `Creator @${cleanUsername} is already registered in the outreach pipeline for ${platform}.`,
					}),
				);
			}
			console.error("Failed to insert creator permission record:", error);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message:
						error.message || "Failed to create creator permission record",
				}),
			);
		}

		return apiResponse({
			permission: newRecord as CreatorPermission,
			message: `Creator @${cleanUsername} added to outreach pipeline.`,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
