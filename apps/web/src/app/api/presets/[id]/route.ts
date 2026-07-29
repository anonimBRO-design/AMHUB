import {
	ApiError,
	apiErrorResponse,
	apiNoContent,
	apiResponse,
	assertOwnerOrStaff,
	presetIdParamsSchema,
	requireApiProfile,
	updatePresetSchema,
	validateJson,
	validateRouteParams,
} from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@presethub/types";
import type { NextRequest } from "next/server";

type PresetUpdate = Database["public"]["Tables"]["presets"]["Update"];
type PresetOwnerRow = Pick<
	Database["public"]["Tables"]["presets"]["Row"],
	"id" | "creator_id"
>;

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

interface PresetRouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: PresetRouteContext) {
	try {
		const { id } = validateRouteParams(
			await context.params,
			presetIdParamsSchema,
		);
		const supabase = await createSupabaseServerClient();
		const { data, error } = await supabase
			.from("presets")
			.select(presetSelect)
			.eq("id", id)
			.maybeSingle();

		if (error) {
			throw error;
		}

		if (!data) {
			return apiErrorResponse(
				new ApiError({
					code: "not_found",
					message: "Preset was not found.",
				}),
			);
		}

		return apiResponse(data);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(request: NextRequest, context: PresetRouteContext) {
	try {
		const { id } = validateRouteParams(
			await context.params,
			presetIdParamsSchema,
		);
		const { supabase, user, profile } = await requireApiProfile();
		const input = await validateJson(request, updatePresetSchema);
		const { data: existingPreset, error: selectError } = await supabase
			.from("presets")
			.select("id, creator_id")
			.eq("id", id)
			.maybeSingle()
			.returns<PresetOwnerRow | null>();

		if (selectError) {
			throw selectError;
		}

		if (!existingPreset) {
			return apiErrorResponse(
				new ApiError({
					code: "not_found",
					message: "Preset was not found.",
				}),
			);
		}

		assertOwnerOrStaff(user, existingPreset.creator_id, profile);

		const update = {
			...input,
			status: "pending",
			rejection_reason: null,
		} satisfies PresetUpdate;

		const { data, error } = await supabase
			.from("presets")
			.update(update as never)
			.eq("id", id)
			.select(presetSelect)
			.single();

		if (error) {
			throw error;
		}

		return apiResponse(data);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	_request: NextRequest,
	context: PresetRouteContext,
) {
	try {
		const { id } = validateRouteParams(
			await context.params,
			presetIdParamsSchema,
		);
		const { supabase, user, profile } = await requireApiProfile();
		const { data: existingPreset, error: selectError } = await supabase
			.from("presets")
			.select("id, creator_id")
			.eq("id", id)
			.maybeSingle()
			.returns<PresetOwnerRow | null>();

		if (selectError) {
			throw selectError;
		}

		if (!existingPreset) {
			return apiErrorResponse(
				new ApiError({
					code: "not_found",
					message: "Preset was not found.",
				}),
			);
		}

		assertOwnerOrStaff(user, existingPreset.creator_id, profile);

		const { error } = await supabase.from("presets").delete().eq("id", id);

		if (error) {
			throw error;
		}

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
