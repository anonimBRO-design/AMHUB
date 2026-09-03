import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson } from "@/lib/api/validation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const updateWithdrawalSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(["pending", "processing", "completed", "rejected"]),
	rejection_reason: z.string().trim().max(300).optional(),
});

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

		let dbClient = supabase;
		try {
			dbClient = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable, using admin client:", e);
		}

		let query = dbClient
			.from("creator_withdrawals")
			.select("*")
			.order("created_at", { ascending: false });

		if (status !== "all") {
			query = query.eq("status", status);
		}

		const { data: rawWithdrawals, error } = await query;

		if (error) {
			console.error("Admin withdrawals query error:", error);
			const msg = (error.message || "").toLowerCase();
			const code = error.code || "";
			// If table does not exist or schema cache doesn't have it yet, return empty list cleanly
			if (
				code === "42P01" ||
				code === "PGRST204" ||
				code === "PGRST205" ||
				msg.includes("does not exist") ||
				msg.includes("schema cache") ||
				msg.includes("could not find the table")
			) {
				return apiResponse([]);
			}
			throw new ApiError({
				code: "internal_server_error",
				message: error.message || "Failed to fetch creator withdrawals",
			});
		}

		const withdrawals = rawWithdrawals ?? [];

		// Fetch creators in batch to avoid fragile PostgREST foreign key embedding errors
		const creatorIds = Array.from(
			new Set(
				withdrawals
					.map((w: any) => w.creator_id)
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

		const mappedWithdrawals = withdrawals.map((item: any) => ({
			...item,
			creator: creatorMap.get(item.creator_id) || null,
		}));

		return apiResponse(mappedWithdrawals);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(request: NextRequest) {
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

		const body = await validateJson(request, updateWithdrawalSchema);

		let dbClient = supabase;
		try {
			dbClient = createSupabaseServiceClient();
		} catch (e) {
			console.warn("Service role client unavailable, using admin client:", e);
		}

		const updatePayload: Record<string, unknown> = {
			status: body.status,
		};

		if (body.status === "completed" || body.status === "rejected") {
			updatePayload.processed_at = new Date().toISOString();
		}

		if (body.rejection_reason !== undefined) {
			updatePayload.rejection_reason = body.rejection_reason;
		}

		const { data: updatedItem, error } = await dbClient
			.from("creator_withdrawals")
			.update(updatePayload as never)
			.eq("id", body.id)
			.select("*")
			.single();

		if (error) {
			console.error("Admin update withdrawal error:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: error.message || "Failed to update withdrawal request",
			});
		}

		// Fetch creator details
		let creator = null;
		if (updatedItem && (updatedItem as any).creator_id) {
			const { data: creatorData } = await dbClient
				.from("users")
				.select("id, username, display_name, avatar_url")
				.eq("id", (updatedItem as any).creator_id)
				.maybeSingle();
			creator = creatorData;
		}

		return apiResponse({
			...(updatedItem as any),
			creator,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
