import {
	deleteCollection,
	getCollectionById,
	getCollectionOwner,
	updateCollection,
} from "@/dal/collections.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { assertOwnerOrStaff } from "@/lib/api/authorization";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
	apiErrorResponse,
	apiNoContent,
	apiResponse,
} from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const collectionIdParamsSchema = z.object({
	id: z.string().uuid(),
});

const updateCollectionSchema = z.object({
	title: z.string().trim().min(1).max(100).optional(),
	slug: z
		.string()
		.trim()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
	description: z.string().trim().max(500).nullable().optional(),
	cover_url: z.string().url().nullable().optional(),
	is_public: z.boolean().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		const collection = await getCollectionById(
			supabase,
			id,
			authContext?.user?.id,
		);

		return apiResponse(collection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "collection:update",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const existing = await getCollectionOwner(supabase, id);
		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		const input = await validateJson(request, updateCollectionSchema);

		const updatedCollection = await updateCollection(supabase, id, input);

		return apiResponse(updatedCollection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "collection:delete",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const existing = await getCollectionOwner(supabase, id);
		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		await deleteCollection(supabase, id);

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
