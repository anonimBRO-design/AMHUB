import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiNoContent, apiErrorResponse } from "@/lib/api/responses";
import { ApiError } from "@/lib/api/errors";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:like",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const { data: preset, error: selectError } = await supabase
			.from("presets")
			.select("id")
			.eq("id", id)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!preset) {
			throw new ApiError({ code: "not_found", message: "Preset was not found." });
		}

		const { error: insertError } = await supabase
			.from("preset_likes")
			.upsert({ preset_id: id, user_id: profile.id }, { onConflict: "preset_id,user_id" });

		if (insertError) throw insertError;

		const { count, error: countError } = await supabase
			.from("preset_likes")
			.select("*", { count: "exact", head: true })
			.eq("preset_id", id);

		if (!countError && count !== null) {
			await supabase.from("presets").update({ like_count: count }).eq("id", id);
		}

		return apiResponse({ preset_id: id, liked: true });
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:like",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const { error: deleteError } = await supabase
			.from("preset_likes")
			.delete()
			.eq("preset_id", id)
			.eq("user_id", profile.id);

		if (deleteError) throw deleteError;

		const { count, error: countError } = await supabase
			.from("preset_likes")
			.select("*", { count: "exact", head: true })
			.eq("preset_id", id);

		if (!countError && count !== null) {
			await supabase.from("presets").update({ like_count: count }).eq("id", id);
		}

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
