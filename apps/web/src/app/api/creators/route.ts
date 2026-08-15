import { getCreatorReputation } from "@/dal/reputation.dal";
import { PUBLIC_USER_SELECT } from "@/dal/users.dal";
import { getApiUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const creatorsQuerySchema = z.object({
	q: z.string().optional().default(""),
	filter: z.enum(["all", "creators", "verified"]).optional().default("all"),
	sort: z
		.enum(["newest", "popular", "followers", "score", "downloads"])
		.optional()
		.default("popular"),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export interface PublicCreatorCardData {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	bio: string | null;
	is_verified: boolean;
	created_at: string;
	follower_count: number;
	active_follower_count: number;
	following_count: number;
	preset_count: number;
	unique_download_count: number;
	reputation_score: number;
	is_following?: boolean;
	is_self?: boolean;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const parseResult = creatorsQuerySchema.safeParse({
			q: searchParams.get("q") ?? undefined,
			filter: searchParams.get("filter") ?? undefined,
			sort: searchParams.get("sort") ?? undefined,
			page: searchParams.get("page") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});

		if (!parseResult.success) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Invalid query parameters",
					details: parseResult.error.flatten(),
				}),
			);
		}

		const { q, filter, sort, page, limit } = parseResult.data;
		const supabase = await createSupabaseServerClient();
		const authContext = await getApiUser();
		const currentUserId = authContext?.user?.id;

		// 1. Build base user query selecting only public profile fields
		let dbQuery = supabase
			.from("users")
			.select(PUBLIC_USER_SELECT, { count: "exact" });

		// 2. Search by username or display_name
		const searchQuery = q.trim();
		if (searchQuery) {
			dbQuery = dbQuery.or(
				`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`,
			);
		}

		// 3. Apply Filter
		if (filter === "verified") {
			dbQuery = dbQuery.eq("is_verified", true);
		} else if (filter === "creators") {
			// Get creator IDs with at least 1 published preset
			const { data: creatorRows } = await supabase
				.from("presets")
				.select("creator_id")
				.eq("status", "published");

			const creatorIds = Array.from(
				new Set(
					(creatorRows || []).map(
						(r) => (r as unknown as { creator_id: string }).creator_id,
					),
				),
			);

			if (creatorIds.length > 0) {
				dbQuery = dbQuery.in("id", creatorIds);
			} else {
				// No creators exist yet
				return apiResponse({
					users: [],
					pagination: { page, limit, total: 0, has_more: false },
				});
			}
		}

		// 4. Default database sorting if newest
		if (sort === "newest") {
			dbQuery = dbQuery.order("created_at", { ascending: false });
		}

		const { data: rawUsers, count, error } = await dbQuery;

		if (error || !rawUsers) {
			console.error("Explore creators query failed:", error);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: "Failed to fetch creators list",
				}),
			);
		}

		type RawUser = {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
			bio: string | null;
			is_verified: boolean;
			created_at: string;
		};

		const usersList = rawUsers as unknown as RawUser[];
		const userIds = usersList.map((u) => u.id);

		// 5. Batch follow status for viewer
		const followingSet = new Set<string>();
		if (currentUserId && userIds.length > 0) {
			const { data: followRecords } = await supabase
				.from("follows")
				.select("following_id")
				.eq("follower_id", currentUserId)
				.in("following_id", userIds);

			if (followRecords) {
				for (const f of followRecords) {
					followingSet.add(
						(f as unknown as { following_id: string }).following_id,
					);
				}
			}
		}

		// 6. Multi-signal reputation and stats computation per creator
		const creatorsWithStats: PublicCreatorCardData[] = await Promise.all(
			usersList.map(async (u) => {
				const [
					reputationData,
					{ count: followingCount },
					{ count: presetCount },
				] = await Promise.all([
					getCreatorReputation(supabase, u.id),
					supabase
						.from("follows")
						.select("*", { count: "exact", head: true })
						.eq("follower_id", u.id),
					supabase
						.from("presets")
						.select("*", { count: "exact", head: true })
						.eq("creator_id", u.id)
						.eq("status", "published"),
				]);

				return {
					id: u.id,
					username: u.username,
					display_name: u.display_name,
					avatar_url: u.avatar_url,
					bio: u.bio,
					is_verified: u.is_verified,
					created_at: u.created_at,
					follower_count: reputationData.followerCount,
					active_follower_count: reputationData.activeFollowers,
					following_count: followingCount ?? 0,
					preset_count: presetCount ?? 0,
					unique_download_count: reputationData.uniqueDownloads,
					reputation_score: reputationData.reputationScore,
					is_following: currentUserId ? followingSet.has(u.id) : false,
					is_self: currentUserId ? currentUserId === u.id : false,
				};
			}),
		);

		// 7. Apply deterministic ranking based on chosen sort
		if (sort === "followers") {
			creatorsWithStats.sort((a, b) => b.follower_count - a.follower_count);
		} else if (sort === "downloads") {
			creatorsWithStats.sort(
				(a, b) => b.unique_download_count - a.unique_download_count,
			);
		} else if (sort === "popular" || sort === "score") {
			// Rank by finalized multi-signal reputation score
			creatorsWithStats.sort((a, b) => {
				if (b.reputation_score !== a.reputation_score) {
					return b.reputation_score - a.reputation_score;
				}
				// Secondary tie-breaker: unique downloads, then preset count
				if (b.unique_download_count !== a.unique_download_count) {
					return b.unique_download_count - a.unique_download_count;
				}
				return b.preset_count - a.preset_count;
			});
		}

		// 8. Paginate resulting list
		const total = count ?? creatorsWithStats.length;
		const startIndex = (page - 1) * limit;
		const paginatedUsers = creatorsWithStats.slice(
			startIndex,
			startIndex + limit,
		);
		const hasMore = startIndex + limit < total;

		return apiResponse({
			users: paginatedUsers,
			pagination: {
				page,
				limit,
				total,
				has_more: hasMore,
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
