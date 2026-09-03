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
			.select("*, creator:creator_id (id, username, display_name, avatar_url)")
			.order("created_at", { ascending: false });

		if (status !== "all") {
			query = query.eq("status", status);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Admin withdrawals query error:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: "Failed to fetch creator withdrawals",
			});
		}

		return apiResponse(data ?? []);
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

		const { data, error } = await dbClient
			.from("creator_withdrawals")
			.update(updatePayload as never)
			.eq("id", body.id)
			.select("*, creator:creator_id (id, username, display_name, avatar_url)")
			.single();

		if (error) {
			console.error("Admin update withdrawal error:", error);
			throw new ApiError({
				code: "internal_server_error",
				message: "Failed to update withdrawal request",
			});
		}

		return apiResponse(data);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
