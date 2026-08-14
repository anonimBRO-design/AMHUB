import type {
	ExtendedListQueryParams,
	PresetWithCreator,
} from "@/data/presets";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
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
	tags,
	status,
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
	file_type: "xml" | "qr" | "link" | "google_drive" | "alight_creative";
	file_types?: string[];
	file_url?: string;
	am_link?: string;
	category: string;
	style?: string[];
	tags?: string[];
	difficulty?: "beginner" | "intermediate" | "advanced";
	status?: "pending" | "published" | "rejected" | "removed";
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

async function ensureCategoryExists(categorySlug: string) {
	if (!categorySlug) return;
	try {
		const serviceClient = createSupabaseServiceClient();
		const { data: existing } = await serviceClient
			.from("categories")
			.select("slug")
			.eq("slug", categorySlug)
			.maybeSingle();

		if (!existing) {
			console.log(`[CATEGORIES] Auto-populating missing category '${categorySlug}' in DB via service client...`);
			const label = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
			const { error: insErr } = await serviceClient
				.from("categories")
				.insert([{ slug: categorySlug, label, is_active: true }] as never);

			if (insErr) {
				console.error(`[CATEGORIES INSERT ERROR] '${categorySlug}':`, insErr);
			}
		}
	} catch (catErr) {
		console.warn(`[CATEGORIES CHECK] Could not verify category '${categorySlug}':`, catErr);
	}
}

export async function createPreset(
	client: DalClient,
	creatorId: string,
	data: CreatePresetData,
) {
	if (data.category) {
		await ensureCategoryExists(data.category);
	}

	const {
		data: { user: insertClientUser },
		error: authError,
	} = await (client as any).auth.getUser();

	console.log("[PUBLISH INSERT AUTH DEBUG]", {
		userId: insertClientUser?.id ?? null,
		authError: authError?.message ?? null,
	});

	try {
		const { data: dbAuthContext } = await (client as any).rpc("get_auth_context");
		console.log("[DATABASE AUTH CONTEXT]", dbAuthContext);
	} catch (rpcErr) {
		console.warn("[DATABASE AUTH CONTEXT RPC SKIPPED]", rpcErr);
	}

	const { file_types, ...insertData } = data;
	const { data: preset, error } = await client
		.from("presets")
		.insert([
			{
				...insertData,
				status: insertData.status || "published",
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

		if (params.search?.trim()) {
			const term = `%${params.search.trim()}%`;
			query = query.or(
				`title.ilike.${term},description.ilike.${term},category.ilike.${term}`,
			);
		}

		if (params.category && params.category.toLowerCase() !== "all") {
			query = query.ilike("category", params.category);
		}

		if (params.difficulty) {
			query = query.eq("difficulty", params.difficulty);
		}

		if (params.fileType) {
			query = query.eq("file_type", params.fileType);
		}

		if (params.tags && params.tags.length > 0) {
			query = query.contains("tags", params.tags);
		}

		const sortOption = params.sort ?? "created_at";
		if (sortOption === "oldest") {
			query = query.order("created_at", { ascending: true });
		} else if (
			sortOption === "most_downloaded" ||
			(sortOption as string) === "downloads"
		) {
			query = query.order("download_count", { ascending: false });
		} else if (
			sortOption === "most_liked" ||
			(sortOption as string) === "likes"
		) {
			query = query.order("like_count", { ascending: false });
		} else if (sortOption === "trending") {
			query = query
				.order("download_count", { ascending: false })
				.order("like_count", { ascending: false });
		} else if (
			sortOption === "download_count" ||
			sortOption === "like_count" ||
			sortOption === "view_count" ||
			sortOption === "title"
		) {
			query = query.order(sortOption, { ascending: false });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		const { data, error } = await query;

		if (error) return [];
		return (data ?? []) as unknown as PresetWithCreator[];
	} catch (error) {
		console.error("Failed to list published presets:", error);
		return [];
	}
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

		if (error || !data) return null;
		return data as unknown as PresetWithCreator;
	} catch (error) {
		console.error("Failed to get preset by slug:", error);
		return null;
	}
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
			.order("created_at", { ascending: false });

		if (error) return [];
		return (data ?? []) as unknown as PresetWithCreator[];
	} catch (error) {
		console.error("Failed to list creator presets:", error);
		return [];
	}
}

export interface CreatorPresetsFilter {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
	sort?: "newest" | "oldest" | "downloads" | "likes" | "views";
}

export async function listCreatorPresetsPaginated(
	client: DalClient,
	creatorId: string,
	filter: CreatorPresetsFilter = {},
) {
	const limit = filter.limit ?? 12;
	const page = filter.page ?? 1;
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	try {
		let query = client
			.from("presets")
			.select(PRESET_SELECT_WITH_CREATOR, { count: "exact" })
			.eq("creator_id", creatorId);

		// Status filter mapping:
		// 'published' -> 'published'
		// 'draft' / 'pending' -> 'pending'
		// 'archived' / 'removed' -> 'removed'
		if (filter.status && filter.status !== "all") {
			if (filter.status === "draft" || filter.status === "pending") {
				query = query.eq("status", "pending");
			} else if (filter.status === "archived" || filter.status === "removed") {
				query = query.eq("status", "removed");
			} else if (filter.status === "published") {
				query = query.eq("status", "published");
			} else {
				query = query.eq("status", filter.status);
			}
		}

		if (filter.search?.trim()) {
			const term = `%${filter.search.trim()}%`;
			query = query.or(
				`title.ilike.${term},description.ilike.${term},category.ilike.${term}`,
			);
		}

		const sort = filter.sort ?? "newest";
		if (sort === "oldest") {
			query = query.order("created_at", { ascending: true });
		} else if (sort === "downloads") {
			query = query.order("download_count", { ascending: false });
		} else if (sort === "likes") {
			query = query.order("like_count", { ascending: false });
		} else if (sort === "views") {
			query = query.order("view_count", { ascending: false });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		const { data, count, error } = await query.range(from, to);

		if (error) {
			console.error("Error listing creator presets paginated:", error);
			return { items: [], total: 0, page, limit, hasMore: false };
		}

		const total = count ?? 0;
		const items = (data ?? []) as unknown as PresetWithCreator[];
		const hasMore = from + items.length < total;

		return {
			items,
			total,
			page,
			limit,
			hasMore,
		};
	} catch (error) {
		console.error("Failed to list creator presets paginated:", error);
		return { items: [], total: 0, page, limit, hasMore: false };
	}
}

export async function getCreatorDashboardStats(
	client: DalClient,
	creatorId: string,
) {
	const { data: presets, error: presetsError } = await client
		.from("presets")
		.select("download_count, like_count, view_count")
		.eq("creator_id", creatorId);

	if (presetsError) throw presetsError;

	const presetItems = (presets || []) as unknown as {
		download_count: number;
		like_count: number;
		view_count: number;
	}[];

	const presetCount = presetItems.length;
	const totalDownloads = presetItems.reduce(
		(acc, p) => acc + (p.download_count || 0),
		0,
	);
	const totalLikes = presetItems.reduce(
		(acc, p) => acc + (p.like_count || 0),
		0,
	);
	const totalViews = presetItems.reduce(
		(acc, p) => acc + (p.view_count || 0),
		0,
	);

	const [{ count: followerCount }, { count: followingCount }] =
		await Promise.all([
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("following_id", creatorId),
			client
				.from("follows")
				.select("*", { count: "exact", head: true })
				.eq("follower_id", creatorId),
		]);

	return {
		presetCount,
		totalDownloads,
		totalLikes,
		totalViews,
		followerCount: followerCount ?? 0,
		followingCount: followingCount ?? 0,
	};
}

export function parseStoragePath(
	urlOrPath: string | null | undefined,
): { bucket: string; path: string } | null {
	if (!urlOrPath) return null;
	const urlMatch = urlOrPath.match(
		/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+)$/,
	);
	if (urlMatch) {
		return { bucket: urlMatch[1], path: urlMatch[2] };
	}
	if (urlOrPath.startsWith("thumbnails/")) {
		return {
			bucket: "thumbnails",
			path: urlOrPath.slice("thumbnails/".length),
		};
	}
	if (urlOrPath.startsWith("preset-files/")) {
		return {
			bucket: "preset-files",
			path: urlOrPath.slice("preset-files/".length),
		};
	}
	if (urlOrPath.startsWith("avatars/")) {
		return { bucket: "avatars", path: urlOrPath.slice("avatars/".length) };
	}
	if (urlOrPath.includes("/")) {
		return {
			bucket: urlOrPath.endsWith(".xml") ? "preset-files" : "thumbnails",
			path: urlOrPath,
		};
	}
	return null;
}

export interface UpdatePresetInput {
	title?: string;
	description?: string;
	category?: string;
	difficulty?: "beginner" | "intermediate" | "advanced";
	tags?: string[];
	style?: string[];
	status?: "pending" | "published" | "rejected" | "removed";
}

export async function updatePresetByOwner(
	client: DalClient,
	creatorId: string,
	presetId: string,
	data: UpdatePresetInput,
) {
	const { data: existing, error: checkError } = await client
		.from("presets")
		.select("id, creator_id")
		.eq("id", presetId)
		.single();

	if (checkError || !existing) {
		throw new Error("Preset not found");
	}

	const existingRecord = existing as unknown as {
		id: string;
		creator_id: string;
	};
	if (existingRecord.creator_id !== creatorId) {
		throw new Error("Unauthorized: You can only edit your own presets");
	}

	const { data: updated, error: updateError } = await client
		.from("presets")
		.update({
			...data,
			updated_at: new Date().toISOString(),
		} as never)
		.eq("id", presetId)
		.select(PRESET_SELECT_WITH_CREATOR)
		.single();

	if (updateError) throw updateError;
	return updated as unknown as PresetWithCreator;
}

export async function deletePresetByOwner(
	client: DalClient,
	creatorId: string,
	presetId: string,
) {
	const { data: preset, error: fetchError } = await client
		.from("presets")
		.select(
			"id, creator_id, thumbnail_url, preview_video_url, file_url, am_link, file_type",
		)
		.eq("id", presetId)
		.single();

	if (fetchError || !preset) {
		throw new Error("Preset not found");
	}

	const presetRecord = preset as unknown as {
		id: string;
		creator_id: string;
		thumbnail_url: string;
		preview_video_url?: string | null;
		file_url?: string | null;
		am_link?: string | null;
		file_type: string;
	};

	if (presetRecord.creator_id !== creatorId) {
		throw new Error("Unauthorized: You can only delete your own presets");
	}

	// Remove storage assets (thumbnail, preview video, xml/qr file, am_link asset)
	const storageItems: { bucket: string; path: string }[] = [];

	const thumb = parseStoragePath(presetRecord.thumbnail_url);
	if (thumb) storageItems.push(thumb);

	const prevVideo = parseStoragePath(presetRecord.preview_video_url);
	if (prevVideo) storageItems.push(prevVideo);

	const mainFile = parseStoragePath(presetRecord.file_url);
	if (mainFile) storageItems.push(mainFile);

	const amLinkAsset = parseStoragePath(presetRecord.am_link);
	if (amLinkAsset) storageItems.push(amLinkAsset);

	for (const item of storageItems) {
		try {
			await client.storage.from(item.bucket).remove([item.path]);
		} catch (err) {
			console.error(
				`Failed to delete storage asset ${item.bucket}/${item.path}:`,
				err,
			);
		}
	}

	const { error: deleteError } = await client
		.from("presets")
		.delete()
		.eq("id", presetId)
		.eq("creator_id", creatorId);

	if (deleteError) throw deleteError;

	return { success: true, deletedId: presetId };
}

export async function getCreatorAnalytics(
	client: DalClient,
	creatorId: string,
	timeframe: "7d" | "30d" | "90d" = "7d",
) {
	const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
	const days = daysMap[timeframe] || 7;

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	const startDateIso = startDate.toISOString();

	const { data: topPresetsData } = await client
		.from("presets")
		.select(
			"id, title, slug, thumbnail_url, download_count, like_count, view_count, status, created_at",
		)
		.eq("creator_id", creatorId)
		.order("download_count", { ascending: false })
		.limit(5);

	const { data: creatorPresetIds } = await client
		.from("presets")
		.select("id")
		.eq("creator_id", creatorId);

	const presetIds = (
		(creatorPresetIds || []) as unknown as { id: string }[]
	).map((p) => p.id);

	let likesOverTime: { date: string; count: number }[] = [];
	if (presetIds.length > 0) {
		const { data: likes } = await client
			.from("preset_likes")
			.select("created_at")
			.in("preset_id", presetIds)
			.gte("created_at", startDateIso);

		const likeItems = (likes || []) as unknown as { created_at: string }[];
		if (likeItems.length > 0) {
			const countsByDate: Record<string, number> = {};
			for (const like of likeItems) {
				const dateStr = new Date(like.created_at).toISOString().split("T")[0];
				countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
			}
			likesOverTime = Object.entries(countsByDate).map(([date, count]) => ({
				date,
				count,
			}));
		}
	}

	const topPresets = (topPresetsData || []) as unknown as {
		id: string;
		title: string;
		slug: string;
		thumbnail_url: string;
		download_count: number;
		like_count: number;
		view_count: number;
		status: string;
		created_at: string;
	}[];

	const hasData =
		topPresets.some(
			(p) => p.download_count > 0 || p.like_count > 0 || p.view_count > 0,
		) || likesOverTime.length > 0;

	return {
		timeframe,
		hasData,
		topPresets,
		likesOverTime,
	};
}
