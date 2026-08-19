import { deleteComment, moderateComment } from "@/dal/comments.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	commentId: z.string().uuid(),
});

const updateCommentSchema = z.object({
	body: z.string().trim().min(1).max(500).optional(),
	is_pinned: z.boolean().optional(),
	is_removed: z.boolean().optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	try {
		const { commentId } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		const bodyInput = await validateJson(request, updateCommentSchema);

		// Fetch existing comment to check ownership / permissions
		const { data: existing, error: getError } = await supabase
			.from("comments")
			.select("user_id, preset_id")
			.eq("id", commentId)
			.maybeSingle();

		if (getError || !existing) {
			return apiResponse({ error: "Comment not found" }, 404);
		}

		// Authorization:
		// Regular users can only update the "body" of their own comments.
		// Staff/Admins or preset creators can moderate (pin, remove) comments.
		const isOwner = existing.user_id === profile.id;
		
		// Let us check if current user is the preset creator of the parent preset
		let isPresetCreator = false;
		if (existing.preset_id) {
			const { data: presetObj } = await supabase
				.from("presets")
				.select("creator_id")
				.eq("id", existing.preset_id)
				.maybeSingle();
			if (presetObj && presetObj.creator_id === profile.id) {
				isPresetCreator = true;
			}
		}

		const isStaff = profile.is_staff || isPresetCreator;

		const updates: any = {};
		if (bodyInput.body !== undefined) {
			if (!isOwner && !isStaff) {
				return apiResponse({ error: "Unauthorized to update comment body" }, 403);
			}
			updates.body = bodyInput.body;
		}

		if (bodyInput.is_pinned !== undefined) {
			if (!isStaff) {
				return apiResponse({ error: "Unauthorized to pin comment" }, 403);
			}
			updates.is_pinned = bodyInput.is_pinned;
		}

		if (bodyInput.is_removed !== undefined) {
			if (!isOwner && !isStaff) {
				return apiResponse({ error: "Unauthorized to remove comment" }, 403);
			}
			updates.is_removed = bodyInput.is_removed;
		}

		const comment = await moderateComment(supabase, commentId, updates);
		return apiResponse(comment);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	try {
		const { commentId } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		// Fetch existing comment to check ownership and preset_id
		const { data: existing, error: getError } = await supabase
			.from("comments")
			.select("user_id, preset_id")
			.eq("id", commentId)
			.maybeSingle();

		if (getError || !existing) {
			return apiResponse({ error: "Comment not found" }, 404);
		}

		// Authorization
		let isPresetCreator = false;
		if (existing.preset_id) {
			const { data: presetObj } = await supabase
				.from("presets")
				.select("creator_id")
				.eq("id", existing.preset_id)
				.maybeSingle();
			if (presetObj && presetObj.creator_id === profile.id) {
				isPresetCreator = true;
			}
		}

		const isOwner = existing.user_id === profile.id;
		const canDelete = isOwner || profile.is_staff || isPresetCreator;

		if (!canDelete) {
			return apiResponse({ error: "Unauthorized to delete comment" }, 403);
		}

		await deleteComment(supabase, commentId, existing.preset_id);
		return apiResponse({ success: true });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
