import {
	addCollaborator,
	getCollectionById,
	getCollectionOwner,
	listCollaborators,
	removeCollaborator,
} from "@/dal/collections.dal";
import { getUserByUsername } from "@/dal/users.dal";
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

const addCollaboratorSchema = z.object({
	username: z.string().trim().min(3).max(30),
});

const removeCollaboratorSchema = z.object({
	user_id: z.string().uuid(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, collectionIdParamsSchema);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		await getCollectionById(supabase, id, authContext?.user?.id);
		const collaborators = await listCollaborators(supabase, id);
		return apiResponse(collaborators);
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
		const body = await validateJson(request, addCollaboratorSchema);

		await enforceRateLimit({
			request,
			scope: "collection:collaborators",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const existing = await getCollectionOwner(supabase, id);
		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		const user = await getUserByUsername(supabase, body.username);
		if (!user) {
			throw new ApiError({
				code: "not_found",
				message: "Pengguna tidak ditemukan.",
			});
		}

		const collaborator = await addCollaborator(supabase, id, user.id);
		return apiCreated(collaborator);
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
		const body = await validateJson(request, removeCollaboratorSchema);

		await enforceRateLimit({
			request,
			scope: "collection:collaborators",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const existing = await getCollectionOwner(supabase, id);
		assertOwnerOrStaff(profile.id, existing.owner_id, profile);

		await removeCollaborator(supabase, id, body.user_id);
		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
