import { NextRequest } from "next/server";
import { z } from "zod";
import { validateJson, validateQuery } from "@/lib/api/validation";
import { getApiUser, requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiResponse, apiCreated, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import type { Database } from "@presethub/types";

type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];

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

function generateSlug(title: string): string {
	const normalized = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50);

	return normalized || `collection-${Date.now()}`;
}

export async function GET(request: NextRequest) {
	try {
		const { page, limit, owner_id, search } = validateQuery(
			request.nextUrl.searchParams,
			listCollectionsQuerySchema
		);
		const authContext = await getApiUser();
		const supabase = await createSupabaseServerClient();

		const offset = (page - 1) * limit;
		const to = offset + limit - 1;

		let query = supabase
			.from("collections")
			.select(collectionSelect, { count: "exact" })
			.range(offset, to)
			.order("created_at", { ascending: false });

		if (owner_id) {
			query = query.eq("owner_id", owner_id);
			if (owner_id !== authContext?.user?.id) {
				query = query.eq("is_public", true);
			}
		} else {
			query = query.eq("is_public", true);
		}

		if (search) {
			query = query.ilike("title", `%${search}%`);
		}

		const { data: collections, count, error } = await query;

		if (error) throw error;

		const total = count ?? 0;

		return apiResponse(collections ?? [], {
			meta: {
				pagination: createPaginationMeta({
					page,
					limit,
					offset,
					total,
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
		const slug = input.slug ? input.slug : generateSlug(input.title);

		const insertData = {
			owner_id: profile.id,
			title: input.title,
			slug,
			description: input.description ?? null,
			cover_url: input.cover_url ?? null,
			is_public: input.is_public,
		} satisfies CollectionInsert;

		const { data: collection, error } = await supabase
			.from("collections")
			.insert([insertData as never])
			.select(collectionSelect)
			.single();

		if (error) {
			if (error.code === "23505") {
				throw new ApiError({
					code: "conflict",
					message: "A collection with this slug already exists for your account.",
				});
			}
			throw error;
		}

		return apiCreated(collection);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
