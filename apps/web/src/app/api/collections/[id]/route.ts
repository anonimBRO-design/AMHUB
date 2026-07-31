import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { assertOwnerOrStaff } from "@/lib/api/authorization";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiNoContent, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import type { Database } from "@presethub/types";

type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

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

const collectionSelect = `
	id,
	slug,
	owner_id,
	title,
	description,
	cover_url,
	is_public,
	preset_count,
	created_at,
	updated_at,
	owner:users!collections_owner_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		const { data: collection, error } = await supabase
			.from("collections")
			.select(collectionSelect)
			.eq("id", id)
			.maybeSingle();

		if (error) throw error;
		if (!collection) {
			throw new ApiError({ code: "not_found", message: "Collection was not found." });
		}

		const isOwner = authContext?.user?.id === collection.owner_id;
		if (!collection.is_public && !isOwner) {
			throw new ApiError({ code: "not_found", message: "Collection was not found." });
		}

		return apiResponse(collection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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

		const { data: existing, error: selectError } = await supabase
			.from("collections")
			.select("id, owner_id")
			.eq("id", id)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!existing) {
			throw new ApiError({ code: "not_found", message: "Collection was not found." });
		}

		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		const input = await validateJson(request, updateCollectionSchema);

		const updatePayload: CollectionUpdate = {
			...input,
			updated_at: new Date().toISOString(),
		};

		const { data: updatedCollection, error: updateError } = await supabase
			.from("collections")
			.update(updatePayload as never)
			.eq("id", id)
			.select(collectionSelect)
			.single();

		if (updateError) {
			if (updateError.code === "23505") {
				throw new ApiError({
					code: "conflict",
					message: "A collection with this slug already exists for your account.",
				});
			}
			throw updateError;
		}

		return apiResponse(updatedCollection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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

		const { data: existing, error: selectError } = await supabase
			.from("collections")
			.select("id, owner_id")
			.eq("id", id)
			.maybeSingle();

		if (selectError) throw selectError;
		if (!existing) {
			throw new ApiError({ code: "not_found", message: "Collection was not found." });
		}

		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		const { error: deleteError } = await supabase
			.from("collections")
			.delete()
			.eq("id", id);

		if (deleteError) throw deleteError;

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
