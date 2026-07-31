import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiNoContent, apiErrorResponse } from "@/lib/api/responses";
import { bookmarkPreset, unbookmarkPreset } from "@/dal/bookmarks.dal";

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

		const result = await bookmarkPreset(supabase, id, profile.id, collectionId);

		return apiCreated(result);
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

		await unbookmarkPreset(supabase, id, profile.id);

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
