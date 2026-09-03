import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { supabase, profile, user } = await requireApiProfile();

		if (!isAdminProfile(profile, user)) {
			return apiErrorResponse(
				new ApiError({
					code: "forbidden",
					message: "Admin access required.",
				}),
			);
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status") || "all";
		const query = searchParams.get("q")?.trim() || "";
		const page = Math.max(1, Number(searchParams.get("page") || 1));
		const limit = Math.min(
			50,
			Math.max(1, Number(searchParams.get("limit") || 20)),
		);
		const offset = (page - 1) * limit;

		let dbClient = supabase;
		try {
			dbClient = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable, using admin client:", e);
		}

		let dbQuery = dbClient.from("presets").select("*", { count: "exact" });

		if (status !== "all") {
			dbQuery = dbQuery.eq("status", status);
		}

		if (query) {
			dbQuery = dbQuery.or(`title.ilike.%${query}%,slug.ilike.%${query}%`);
		}

		const {
			data: rawPresets,
			count,
			error,
		} = await dbQuery
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("Admin presets query error:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: error.message || "Failed to fetch presets for moderation",
			});
		}

		const presets = rawPresets ?? [];
		const total = count ?? presets.length;

		// Fetch creators in batch to avoid fragile PostgREST foreign key embedding errors
		const creatorIds = Array.from(
			new Set(
				presets
					.map((p: any) => p.creator_id)
					.filter((id): id is string => Boolean(id)),
			),
		);

		const creatorMap = new Map<
			string,
			{
				id: string;
				username: string;
				display_name: string;
				avatar_url?: string | null;
			}
		>();

		if (creatorIds.length > 0) {
			const { data: creators, error: creatorErr } = await dbClient
				.from("users")
				.select("id, username, display_name, avatar_url")
				.in("id", creatorIds);

			if (!creatorErr && creators) {
				for (const c of creators as any[]) {
					creatorMap.set(c.id, {
						id: c.id,
						username: c.username,
						display_name: c.display_name,
						avatar_url: c.avatar_url,
					});
				}
			}
		}

		const mappedPresets = presets.map((preset: any) => {
			const creator = creatorMap.get(preset.creator_id) || null;
			return {
				...preset,
				users: creator,
				creator: creator,
			};
		});

		return apiResponse(mappedPresets, {
			meta: {
				pagination: {
					page,
					limit,
					offset,
					total,
					hasMore: offset + mappedPresets.length < total,
				},
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
