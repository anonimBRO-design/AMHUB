import {
	getPresetBySlug as getPresetBySlugDal,
	listCreatorPresets as listCreatorPresetsDal,
	listPublishedPresets as listPublishedPresetsDal,
} from "@/dal/presets.dal";
import type { PresetHubSupabaseClient } from "@/lib/supabase/client";
import type { ListQueryParams } from "@presethub/types";

export type ExtendedListQueryParams = ListQueryParams & {
	category?: string;
	difficulty?: string;
};

export type PresetWithCreator = {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	thumbnail_url: string;
	preview_video_url: string | null;
	file_type: "xml" | "qr" | "link";
	file_url: string | null;
	am_link: string | null;
	category: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	download_count: number;
	view_count: number;
	like_count: number;
	bookmark_count: number;
	comment_count: number;
	tags?: string[];
	status?: string;
	is_featured: boolean;
	created_at: string;
	creator: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
		is_verified: boolean;
	};
};

export async function listPublishedPresets(
	supabase: PresetHubSupabaseClient,
	params: ExtendedListQueryParams = {},
) {
	return listPublishedPresetsDal(supabase, params);
}

export async function getPresetBySlug(
	supabase: PresetHubSupabaseClient,
	slug: string,
) {
	return getPresetBySlugDal(supabase, slug);
}

export async function listCreatorPresets(
	supabase: PresetHubSupabaseClient,
	creatorId: string,
) {
	return listCreatorPresetsDal(supabase, creatorId);
}
