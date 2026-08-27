import { isAdminProfile } from "@/lib/admin";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type {
	CreatorPermission,
	UpdateCreatorPermissionInput,
} from "@presethub/types";
import type { NextRequest } from "next/server";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		if (!id) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Creator permission ID is required",
				}),
			);
		}

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
			.catch(() => ({}))) as UpdateCreatorPermissionInput;

		let dbClient = supabase;
		try {
			const serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch {
			// Fallback to caller's authenticated client
		}

		// Fetch existing record
		const { data: rawExisting, error: fetchErr } = await dbClient
			.from("creator_permissions")
			.select("*")
			.eq("id", id)
			.maybeSingle();

		if (fetchErr || !rawExisting) {
			return apiErrorResponse(
				new ApiError({
					code: "not_found",
					message: "Creator permission record not found",
				}),
			);
		}

		const existing = rawExisting as CreatorPermission;
		const updatePayload: Record<string, unknown> = {};

		if (body.status !== undefined) {
			updatePayload.status = body.status;
			// Auto timestamp when moving to 'contacted'
			if (body.status === "contacted" && !existing.contacted_at) {
				updatePayload.contacted_at = new Date().toISOString();
			}
			// Auto timestamp when responding ('approved' or 'rejected')
			if (
				(body.status === "approved" || body.status === "rejected") &&
				!existing.responded_at
			) {
				updatePayload.responded_at = new Date().toISOString();
			}
		}

		if (body.credit_display_name !== undefined) {
			updatePayload.credit_display_name =
				body.credit_display_name?.trim() || null;
		}

		if (body.max_allowed_presets !== undefined) {
			updatePayload.max_allowed_presets = Math.max(
				0,
				Number(body.max_allowed_presets) || 1,
			);
		}

		if (body.notes_conditions !== undefined) {
			updatePayload.notes_conditions = body.notes_conditions?.trim() || null;
		}

		if (body.proof_image_url !== undefined) {
			updatePayload.proof_image_url = body.proof_image_url?.trim() || null;
		}

		if (body.drafted_message !== undefined) {
			updatePayload.drafted_message = body.drafted_message?.trim() || null;
		}

		if (body.responded_at !== undefined) {
			updatePayload.responded_at = body.responded_at;
		}

		const { data: updatedRecord, error: updateErr } = await (
			dbClient.from("creator_permissions") as any
		)
			.update(updatePayload)
			.eq("id", id)
			.select()
			.single();

		if (updateErr) {
			console.error("Failed to update creator permission:", updateErr);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: updateErr.message || "Failed to update creator permission",
				}),
			);
		}

		return apiResponse({
			permission: updatedRecord as CreatorPermission,
			message: "Creator permission record updated successfully.",
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		if (!id) {
			return apiErrorResponse(
				new ApiError({
					code: "bad_request",
					message: "Creator permission ID is required",
				}),
			);
		}

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

		let dbClient = supabase;
		try {
			const serviceSupabase = createSupabaseServiceClient();
			dbClient = serviceSupabase;
		} catch {
			// Fallback to caller's authenticated client
		}

		const { error: deleteErr } = await dbClient
			.from("creator_permissions")
			.delete()
			.eq("id", id);

		if (deleteErr) {
			console.error("Failed to delete creator permission:", deleteErr);
			return apiErrorResponse(
				new ApiError({
					code: "internal_server_error",
					message: deleteErr.message || "Failed to delete creator permission",
				}),
			);
		}

		return apiResponse({
			success: true,
			message: "Creator permission record deleted.",
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
