import type { PresetHubSupabaseClient } from "@/lib/supabase/client";
import type { ListQueryParams } from "@presethub/types";

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

const presetSelect = `
	id,
	slug,
	title,
	description,
	thumbnail_url,
	preview_video_url,
	file_type,
	file_url,
	am_link,
	category,
	difficulty,
	download_count,
	view_count,
	like_count,
	bookmark_count,
	comment_count,
	is_featured,
	created_at,
	creator:users!presets_creator_id_fkey (
		id,
		username,
		display_name,
		avatar_url,
		is_verified
	)
`;

export async function listPublishedPresets(
	supabase: PresetHubSupabaseClient,
	params: ListQueryParams = {},
) {
	const limit = params.limit ?? 24;
	const page = params.page ?? 1;
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	let query = supabase
		.from("presets")
		.select(presetSelect)
		.eq("status", "published")
		.range(from, to);

	if (params.search) {
		query = query.ilike("title", `%${params.search}%`);
	}

	if (params.fileType) {
		query = query.eq("file_type", params.fileType);
	}

	if (params.tags && params.tags.length > 0) {
		query = query.contains("tags", params.tags);
	}

	const sort = params.sort ?? "created_at";
	const order = params.order ?? "desc";
	const { data, error } = await query.order(sort, {
		ascending: order === "asc",
	});

	if (error) {
		throw error;
	}

	return (data ?? []) as unknown as PresetWithCreator[];
}

export async function getPresetBySlug(
	supabase: PresetHubSupabaseClient,
	slug: string,
) {
	const { data, error } = await supabase
		.from("presets")
		.select(presetSelect)
		.eq("slug", slug)
		.eq("status", "published")
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data as unknown as PresetWithCreator | null;
}

export async function listCreatorPresets(
	supabase: PresetHubSupabaseClient,
	creatorId: string,
) {
	const { data, error } = await supabase
		.from("presets")
		.select(presetSelect)
		.eq("creator_id", creatorId)
		.eq("status", "published")
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return (data ?? []) as unknown as PresetWithCreator[];
}
