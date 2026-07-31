import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiNoContent, apiErrorResponse } from "@/lib/api/responses";
import { ApiError } from "@/lib/api/errors";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const bookmarkBodySchema = z
	.object({
		collection_id: z.string().uuid().nullable().optional(),
	})
	.optional();

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "preset:bookmark",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		let collectionId: string | null = null;
		const contentType = request.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			const body = await validateJson(request, bookmarkBodySchema);
			if (body?.collection_id) {
				collectionId = body.collection_id;
			}
		}

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
			.from("preset_bookmarks")
			.upsert(
				{ preset_id: id, user_id: profile.id, collection_id: collectionId },
				{ onConflict: "preset_id,user_id" }
			);

		if (insertError) throw insertError;

		const { count, error: countError } = await supabase
			.from("preset_bookmarks")
			.select("*", { count: "exact", head: true })
			.eq("preset_id", id);

		if (!countError && count !== null) {
			await supabase.from("presets").update({ bookmark_count: count }).eq("id", id);
		}

		return apiCreated({ preset_id: id, bookmarked: true, collection_id: collectionId });
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
			scope: "preset:bookmark",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const { error: deleteError } = await supabase
			.from("preset_bookmarks")
			.delete()
			.eq("preset_id", id)
			.eq("user_id", profile.id);

		if (deleteError) throw deleteError;

		const { count, error: countError } = await supabase
			.from("preset_bookmarks")
			.select("*", { count: "exact", head: true })
			.eq("preset_id", id);

		if (!countError && count !== null) {
			await supabase.from("presets").update({ bookmark_count: count }).eq("id", id);
		}

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
