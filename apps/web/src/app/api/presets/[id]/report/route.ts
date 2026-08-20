import { createNotification } from "@/dal/notifications.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const reportPresetSchema = z.object({
	reason: z.enum(["reupload", "broken", "nsfw", "spam", "other"]),
	details: z.string().max(500).optional(),
});

/**
 * POST /api/presets/[id]/report
 * Report a preset for copyright infringement, broken file/link, NSFW, or spam.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: presetId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, reportPresetSchema);

		// Check if preset exists
		const { data: presetRaw, error: presetError } = await supabase
			.from("presets")
			.select("id, title, creator_id")
			.eq("id", presetId)
			.maybeSingle();

		const preset = presetRaw as unknown as {
			id: string;
			title: string;
			creator_id: string;
		} | null;

		if (presetError || !preset) {
			return apiResponse({ error: "Preset not found" }, { status: 404 });
		}

		// Notify staff / log notification
		const reasonLabels: Record<string, string> = {
			reupload: "Reupload / Copyright Infringement",
			broken: "Broken File / Link",
			nsfw: "Inappropriate Content / NSFW",
			spam: "Spam / Misleading",
			other: "Other issue",
		};

		// Create moderation notification for the creator if needed, or staff queue
		try {
			if (preset.creator_id) {
				await createNotification(supabase, {
					userId: preset.creator_id,
					type: "moderation",
					presetId: preset.id,
					message: `Laporan baru diterima untuk preset "${preset.title}": ${reasonLabels[body.reason] || body.reason}. Tim moderasi sedang meninjau.`,
				});
			}
		} catch (notifErr) {
			console.warn("Failed to dispatch moderation notification", notifErr);
		}

		return apiResponse({
			success: true,
			message: "Laporan berhasil dikirim. Terima kasih telah menjaga keamanan komunitas AMHUB!",
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
