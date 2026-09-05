import {
	addCollectionItem,
	getCollectionById,
	getCollectionOwner,
	isCollectionCollaborator,
	listCollectionItems,
	removeCollectionItem,
} from "@/dal/collections.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { assertOwnerOrStaff } from "@/lib/api/authorization";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
	apiCreated,
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

const addItemSchema = z
	.object({
		preset_id: z.string().uuid().optional(),
		preset_slug: z.string().min(1).max(120).optional(),
	})
	.refine((v) => v.preset_id || v.preset_slug, {
		message: "preset_id atau preset_slug wajib diisi.",
	});

const removeItemSchema = z.object({
	preset_id: z.string().uuid(),
});

async function assertCanEditCollection(
	supabase: Parameters<typeof isCollectionCollaborator>[0],
	collectionId: string,
	profile: { id: string; is_staff?: boolean },
) {
	const existing = await getCollectionOwner(supabase, collectionId);
	try {
		assertOwnerOrStaff(profile.id, existing.owner_id, {
			is_staff: Boolean(profile.is_staff),
		});
		return;
	} catch {
		const collaborator = await isCollectionCollaborator(
			supabase,
			collectionId,
			profile.id,
		);
		if (!collaborator) {
			throw new ApiError({
				code: "forbidden",
				message:
					"Hanya pemilik atau kolaborator yang bisa mengubah koleksi ini.",
			});
		}
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		await getCollectionById(supabase, id, authContext?.user?.id);
		const items = await listCollectionItems(supabase, id);
		return apiResponse(items);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, addItemSchema);

		await enforceRateLimit({
			request,
			scope: "collection:items",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		await assertCanEditCollection(supabase, id, profile);

		let presetId = body.preset_id;
		if (!presetId && body.preset_slug) {
			const { data: preset } = await supabase
				.from("presets")
				.select("id")
				.eq("slug", body.preset_slug)
				.eq("status", "published")
				.maybeSingle();
			const row = preset as { id?: string } | null;
			if (!row?.id) {
				throw new ApiError({
					code: "not_found",
					message: "Preset tidak ditemukan.",
				});
			}
			presetId = row.id;
		}

		await addCollectionItem(supabase, id, presetId as string);
		return apiCreated({ collection_id: id, preset_id: presetId });
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
		const body = await validateJson(request, removeItemSchema);

		await enforceRateLimit({
			request,
			scope: "collection:items",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		await assertCanEditCollection(supabase, id, profile);
		await removeCollectionItem(supabase, id, body.preset_id);
		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
