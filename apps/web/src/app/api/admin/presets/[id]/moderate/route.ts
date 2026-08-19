import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createNotification } from "@/dal/notifications.dal";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const moderateSchema = z.object({
	status: z.enum(["published", "rejected", "removed"]),
	reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		if (!profile.is_staff) {
			return apiResponse({ error: "Unauthorized. Staff only." }, 403);
		}

		const body = await validateJson(request, moderateSchema);

		// Fetch existing preset
		const { data: preset, error: getError } = await supabase
			.from("presets")
			.select("id, creator_id, title, status")
			.eq("id", id)
			.maybeSingle();

		if (getError || !preset) {
			return apiResponse({ error: "Preset not found" }, 404);
		}

		// Update preset status
		const { data: updatedPreset, error: updateError } = await supabase
			.from("presets")
			.update({ status: body.status, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select()
			.single();

		if (updateError) throw updateError;

		// Trigger notification to creator
		if (preset.creator_id && preset.status !== body.status) {
			const type = body.status === "published" ? "approval" : "moderation";
			const actionMsg = body.status === "published" ? "approved and published" : `${body.status}`;
			let message = `Your preset "${preset.title}" was ${actionMsg}.`;
			if (body.reason) {
				message += ` Reason: ${body.reason}`;
			}
			
			try {
				await createNotification(supabase, {
					userId: preset.creator_id,
					actorId: profile.id,
					type: type as any,
					presetId: id,
					message,
				});
			} catch (e) {
				console.error("Failed to notify user of moderation", e);
			}
		}

		return apiResponse(updatedPreset);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
