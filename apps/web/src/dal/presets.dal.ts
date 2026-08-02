import { MOCK_PRESETS, filterAndSortMockPresets } from "@/data/mock-data";
import type {
	ExtendedListQueryParams,
	PresetWithCreator,
} from "@/data/presets";
import type { Database } from "@presethub/types";
import { assertExists } from "./helpers";
import type { DalClient } from "./types";

export const PRESET_SELECT_WITH_CREATOR = `
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

export interface ListPresetsFilter {
	page: number;
	limit: number;
	category?: string;
}

export interface CreatePresetData {
	slug: string;
	title: string;
	description?: string;
	thumbnail_url: string;
	preview_video_url?: string;
	file_type: "xml" | "qr" | "link";
	file_url?: string;
	am_link?: string;
	category: string;
	style?: string[];
	tags?: string[];
	difficulty?: "beginner" | "intermediate" | "advanced";
	am_version_min?: string;
	am_version_max?: string;
	device_support?: ("android" | "ios" | "both")[];
}

export async function listPresets(
	client: DalClient,
	filter: ListPresetsFilter,
) {
	const { page, limit, category } = filter;
	const offset = (page - 1) * limit;
	const to = offset + limit - 1;

	let query = client
		.from("presets")
		.select("*", { count: "exact" })
		.range(offset, to)
		.order("created_at", { ascending: false });

	if (category) {
		query = query.eq("category", category);
	}

	const { data, count, error } = await query;
	if (error) throw error;

	const total = count ?? 0;
	const hasMore = offset + (data?.length ?? 0) < total;

	return {
		items: data ?? [],
		total,
		offset,
		hasMore,
	};
}

export async function createPreset(
	client: DalClient,
	creatorId: string,
	data: CreatePresetData,
) {
	const { data: preset, error } = await client
		.from("presets")
		.insert([
			{
				...data,
				creator_id: creatorId,
			},
		] as never)
		.select()
		.single();

	if (error) throw error;
	return preset;
}

export async function getPresetById(client: DalClient, id: string) {
	const { data: preset, error } = await client
		.from("presets")
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		assertExists(null, "Preset was not found.");
	}
	return assertExists(preset, "Preset was not found.");
}

export async function assertPresetExists(client: DalClient, id: string) {
	const { data: preset, error } = await client
		.from("presets")
		.select("id")
		.eq("id", id)
		.maybeSingle();

	if (error) throw error;
	return assertExists(preset, "Preset was not found.");
}

export async function listPublishedPresets(
	client: DalClient,
	params: ExtendedListQueryParams = {},
): Promise<PresetWithCreator[]> {
	const limit = params.limit ?? 24;
	const page = params.page ?? 1;
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	try {
		let query = client
			.from("presets")
			.select(PRESET_SELECT_WITH_CREATOR)
			.eq("status", "published")
			.range(from, to);

		if (params.search) {
			query = query.ilike("title", `%${params.search}%`);
		}

		if (params.category) {
			query = query.eq("category", params.category);
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

		if (!error && data && data.length > 0) {
			return data as unknown as PresetWithCreator[];
		}
	} catch {
		// Fall through to mock dataset
	}

	return filterAndSortMockPresets(params) as unknown as PresetWithCreator[];
}

export async function getPresetBySlug(
	client: DalClient,
	slug: string,
): Promise<PresetWithCreator | null> {
	try {
		const { data, error } = await client
			.from("presets")
			.select(PRESET_SELECT_WITH_CREATOR)
			.eq("slug", slug)
			.eq("status", "published")
			.maybeSingle();

		if (!error && data) {
			return data as unknown as PresetWithCreator;
		}
	} catch {
		// Fall through to mock dataset
	}

	const found = MOCK_PRESETS.find((p) => p.slug === slug);
	return (found ?? MOCK_PRESETS[0]) as unknown as PresetWithCreator;
}

export async function listCreatorPresets(
	client: DalClient,
	creatorId: string,
): Promise<PresetWithCreator[]> {
	try {
		const { data, error } = await client
			.from("presets")
			.select(PRESET_SELECT_WITH_CREATOR)
			.eq("creator_id", creatorId)
			.eq("status", "published")
			.order("created_at", { ascending: false });

		if (!error && data && data.length > 0) {
			return data as unknown as PresetWithCreator[];
		}
	} catch {
		// Fall through to mock dataset
	}

	const matched = MOCK_PRESETS.filter((p) => p.creator.id === creatorId);
	return (matched.length > 0
		? matched
		: MOCK_PRESETS.slice(0, 12)) as unknown as PresetWithCreator[];
}
