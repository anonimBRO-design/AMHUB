import {
	apiCreated,
	apiErrorResponse,
	apiResponse,
	createPaginationMeta,
	createPresetSchema,
	listPresetsQuerySchema,
	requireApiProfile,
	validateJson,
	validateQuery,
} from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@presethub/types";
import type { NextRequest } from "next/server";

type PresetInsert = Database["public"]["Tables"]["presets"]["Insert"];

const presetSelect = `
	id,
	slug,
	creator_id,
	title,
	description,
	thumbnail_url,
	preview_video_url,
	file_type,
	file_url,
	am_link,
	category,
	style,
	tags,
	difficulty,
	am_version_min,
	am_version_max,
	device_support,
	download_count,
	view_count,
	like_count,
	bookmark_count,
	comment_count,
	trending_score,
	quality_score,
	status,
	is_featured,
	featured_at,
	rejection_reason,
	created_at,
	updated_at,
	creator:users!presets_creator_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export async function GET(request: NextRequest) {
	try {
		const params = validateQuery(
			request.nextUrl.searchParams,
			listPresetsQuerySchema,
		);
		const offset = (params.page - 1) * params.limit;
		const to = offset + params.limit - 1;
		const supabase = await createSupabaseServerClient();

		let query = supabase
			.from("presets")
			.select(presetSelect, { count: "exact" })
			.eq("status", "published")
			.range(offset, to);

		if (params.search) {
			query = query.ilike("title", `%${params.search}%`);
		}

		if (params.category) {
			query = query.eq("category", params.category);
		}

		if (params.fileType) {
			query = query.eq("file_type", params.fileType);
		}

		if (params.tags) {
			query = query.contains("tags", params.tags);
		}

		const { data, error, count } = await query.order(params.sort, {
			ascending: params.order === "asc",
		});

		if (error) {
			throw error;
		}

		return apiResponse(data ?? [], {
			meta: {
				pagination: createPaginationMeta({
					page: params.page,
					limit: params.limit,
					offset,
					total: count ?? undefined,
				}),
			},
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { supabase, user } = await requireApiProfile();
		const input = await validateJson(request, createPresetSchema);
		const insert = {
			...input,
			creator_id: user.id,
			status: "pending",
		} satisfies PresetInsert;

		const { data, error } = await supabase
			.from("presets")
			.insert(insert as never)
			.select(presetSelect)
			.single();

		if (error) {
			throw error;
		}

		return apiCreated(data);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
