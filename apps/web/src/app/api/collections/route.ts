import { createCollection, listCollections } from "@/dal/collections.dal";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { createPaginationMeta } from "@/lib/api/pagination";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const listCollectionsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	owner_id: z.string().uuid().optional(),
	search: z.string().trim().optional(),
});

const createCollectionSchema = z.object({
	title: z.string().trim().min(1).max(100),
	slug: z
		.string()
		.trim()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
	description: z.string().trim().max(500).nullable().optional(),
	cover_url: z.string().url().nullable().optional(),
	is_public: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
	try {
		const { page, limit, owner_id, search } = validateQuery(
			request.nextUrl.searchParams,
			listCollectionsQuerySchema,
		);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		const result = await listCollections(supabase, {
			page,
			limit,
			owner_id,
			search,
			currentUserId: authContext?.user?.id,
		});

		return apiResponse(result.items, {
			meta: {
				pagination: createPaginationMeta({
					page,
					limit,
					offset: result.offset,
					total: result.total,
				}),
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "collection:create",
			limit: 20,
			windowMs: 60000,
			userId: profile.id,
		});

		const input = await validateJson(request, createCollectionSchema);

		const collection = await createCollection(supabase, profile.id, input);

		return apiCreated(collection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
