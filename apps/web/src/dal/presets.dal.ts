import type {
	ExtendedListQueryParams,
	PresetWithCreator,
} from "@/data/presets";
import { normalizeAmVersion } from "@/lib/am-version";
import { ApiError } from "@/lib/api/errors";
import { UPLOAD_LIMITS, validateXmlSafety } from "@/lib/api/uploads";
import { assertSafeExternalUrl } from "@/lib/security/urls";
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
	am_version_min,
	am_version_max,
	tags,
	status,
	download_count,
	view_count,
	unique_download_count,
	price,
	is_paid,
	currency,
	commercial_price,
	remixed_from_id,
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

/**
 * Public-facing preset projection. Excludes the private file_url / am_link
 * fields so that any server component or API response built on this select can
 * never leak the actual file locations of a preset to anonymous/unauthorized
 * callers (paywall bypass vector).
 */
export const PRESET_SELECT_PUBLIC = `
	id,
	slug,
	title,
	description,
	thumbnail_url,
	preview_video_url,
	file_type,
	category,
	difficulty,
	am_version_min,
	am_version_max,
	tags,
	status,
	download_count,
	view_count,
	unique_download_count,
	price,
	is_paid,
	currency,
	commercial_price,
	remixed_from_id,
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
	status?: "pending" | "published" | "rejected" | "removed";
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
	price?: number;
	is_paid?: boolean;
	currency?: string;
	commercial_price?: number;
	remixed_from_id?: string | null;
	am_version_min?: string;
	am_version_max?: string;
	device_support?: ("android" | "ios" | "both")[];
}

export async function listPresets(
	client: DalClient,
	filter: ListPresetsFilter,
) {
	const { page, limit, category, status = "published" } = filter;
	const offset = (page - 1) * limit;
	const to = offset + limit - 1;

	let query = client
		.from("presets")
		.select(PRESET_SELECT_PUBLIC, { count: "exact" })
		.eq("status", status)
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
	const serviceClient = createSupabaseServiceClient();
	const { data: existing, error: selectErr } = await serviceClient
		.from("categories")
		.select("slug")
		.eq("slug", categorySlug)
		.maybeSingle();

	if (selectErr) {
		console.error(`[CATEGORIES SELECT ERROR] '${categorySlug}':`, selectErr);
		throw selectErr;
	}

	if (!existing) {
		console.log(
			`[CATEGORIES] Auto-populating missing category '${categorySlug}' in DB via service client...`,
		);
		const label = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
		const { error: insErr } = await serviceClient
			.from("categories")
			.insert([{ slug: categorySlug, label, is_active: true }] as never);

		if (insErr) {
			console.error(`[CATEGORIES INSERT ERROR] '${categorySlug}':`, insErr);
			throw insErr;
		}
	}
}

const SAFE_STORAGE_BUCKETS = new Set([
	"preset-files",
	"thumbnails",
	"preset-videos",
	"avatars",
]);

/**
 * Validates a user-supplied asset reference (storage path or external URL).
 *
 * - Storage paths must live in a known bucket and be owned by `creatorId`
 *   (first path segment). This kills the paywall bypass where a creator points
 *   file_url at another user's private storage path.
 * - External URLs must be safe HTTPS (public host, no creds, no weird ports).
 */
function assertPresetAssetOwned(
	urlOrPath: string | null | undefined,
	creatorId: string,
	options: { requiredBucket?: string; fieldLabel?: string } = {},
): void {
	if (!urlOrPath) return;

	const parsed = parseStoragePath(urlOrPath);
	const label = options.fieldLabel ?? "URL";

	if (!parsed) {
		assertSafeExternalUrl(urlOrPath, label);
		return;
	}

	if (!SAFE_STORAGE_BUCKETS.has(parsed.bucket)) {
		throw new ApiError({
			code: "bad_request",
			message: `${label} mengarah ke bucket storage yang tidak dikenal.`,
		});
	}

	if (options.requiredBucket && parsed.bucket !== options.requiredBucket) {
		throw new ApiError({
			code: "bad_request",
			message: `${label} harus mengarah ke bucket "${options.requiredBucket}".`,
		});
	}

	const owner = parsed.path.split("/")[0];
	if (!owner || owner !== creatorId) {
		throw new ApiError({
			code: "bad_request",
			message: `${label} harus milik akun kamu sendiri.`,
		});
	}
}

function isPng(bytes: Uint8Array): boolean {
	return (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47
	);
}

function isJpeg(bytes: Uint8Array): boolean {
	return (
		bytes.length >= 3 &&
		bytes[0] === 0xff &&
		bytes[1] === 0xd8 &&
		bytes[2] === 0xff
	);
}

function isWebp(bytes: Uint8Array): boolean {
	const riff =
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46;
	const webp =
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50;
	return riff && webp;
}

/**
 * Server-side content verification of the uploaded preset file. The client may
 * claim any MIME type / filename; we re-check the real bytes that live in
 * Storage before the preset can be created.
 */
async function verifyPresetFileArtifact(
	storagePath: string,
	kind: "xml" | "qr",
): Promise<void> {
	const service = createSupabaseServiceClient();
	const { data, error } = await service.storage
		.from("preset-files")
		.download(storagePath);

	if (error || !data) {
		console.error(
			`[PRESET FILE VERIFY] Failed to read uploaded artifact "${storagePath}":`,
			error,
		);
		throw new ApiError({
			code: "bad_request",
			message:
				"File preset belum ter-upload ke storage. Silakan upload file terlebih dahulu.",
		});
	}

	const bytes = new Uint8Array(await data.arrayBuffer());
	if (bytes.length === 0) {
		throw new ApiError({
			code: "bad_request",
			message: "File preset kosong (0 bytes).",
		});
	}

	const maxBytes =
		kind === "xml"
			? UPLOAD_LIMITS.presetXml.maxBytes
			: UPLOAD_LIMITS.presetQr.maxBytes;

	if (bytes.length > maxBytes) {
		throw new ApiError({
			code: "payload_too_large",
			message: `File preset melebihi batas ${maxBytes / (1024 * 1024)} MB.`,
		});
	}

	if (kind === "xml") {
		const text = new TextDecoder("utf-8").decode(bytes);
		const safety = validateXmlSafety(text);
		if (!safety.safe) {
			throw new ApiError({
				code: "bad_request",
				message: `File preset XML ditolak: ${safety.reason ?? "konten tidak aman."}`,
			});
		}

		const lower = text.toLowerCase();
		const looksLikeAmPreset =
			/<\s*(scene|project|preset)\b/i.test(text) ||
			lower.includes("alightmotion") ||
			lower.includes("am-") ||
			lower.includes("<shape") ||
			lower.includes("<layer") ||
			lower.includes("<effect");
		if (!looksLikeAmPreset) {
			throw new ApiError({
				code: "bad_request",
				message: "File XML bukan struktur preset Alight Motion yang dikenali.",
			});
		}
		return;
	}

	if (!isPng(bytes) && !isJpeg(bytes) && !isWebp(bytes)) {
		throw new ApiError({
			code: "bad_request",
			message: "File QR harus berupa gambar PNG/JPEG/WebP yang valid.",
		});
	}
}

export async function createPreset(
	client: DalClient,
	creatorId: string,
	data: CreatePresetData,
	requestId?: string,
) {
	const tag = requestId ? `[${requestId}]` : "";
	console.log(`[CREATE PRESET PATH] ${tag}`);

	if (data.category) {
		await ensureCategoryExists(data.category);
	}

	// Security: validate every user-supplied asset reference is either owned by
	// the creator (storage path) or a safe public HTTPS URL before persisting.
	// This kills the paywall bypass where file_url points at another user's
	// private storage object.
	assertPresetAssetOwned(data.thumbnail_url, creatorId, {
		fieldLabel: "Thumbnail",
	});
	assertPresetAssetOwned(data.preview_video_url, creatorId, {
		fieldLabel: "Preview video",
	});

	const parsedFile = data.file_url ? parseStoragePath(data.file_url) : null;
	if (parsedFile) {
		assertPresetAssetOwned(data.file_url, creatorId, {
			requiredBucket: "preset-files",
			fieldLabel: "File preset",
		});
		if (data.file_type === "xml" || data.file_type === "qr") {
			// Verify the real bytes in storage (content-type / filename from the
			// client are not trusted).
			await verifyPresetFileArtifact(
				parsedFile.path,
				data.file_type === "xml" ? "xml" : "qr",
			);
		}
	}

	if (data.am_link) {
		assertPresetAssetOwned(data.am_link, creatorId, {
			fieldLabel: "Link preset",
		});
	}

	const { file_types, ...insertData } = data;

	let currentSlug = insertData.slug;
	let attempts = 0;
	let lastError: any = null;

	while (attempts < 3) {
		attempts++;
		const insertPayload = {
			...insertData,
			slug: currentSlug,
			status: insertData.status ?? "pending",
			creator_id: creatorId,
		};

		console.log(
			`[FINAL RAW INSERT EXECUTING] ${tag} (attempt ${attempts}, slug: ${currentSlug})...`,
		);
		const rawInsertResult = await client
			.from("presets")
			.insert([insertPayload] as never);

		if (rawInsertResult.error) {
			lastError = rawInsertResult.error;
			if (
				rawInsertResult.error.code === "23505" &&
				rawInsertResult.error.message?.includes("slug")
			) {
				console.warn(
					`[SLUG COLLISION DETECTED] ${tag} slug ${currentSlug} already exists, retrying with unique suffix...`,
				);
				const suffix = crypto.randomUUID().slice(0, 8);
				currentSlug = `${insertData.slug.slice(0, 80)}-${suffix}`;
				continue;
			}
			console.error(`[FINAL RAW INSERT ERROR] ${tag}`, rawInsertResult.error);
			throw rawInsertResult.error;
		}

		console.log(
			`[FINAL RAW INSERT SUCCESS, FETCHING CREATED RECORD] ${tag}...`,
		);
		const { data: preset, error: selectError } = await client
			.from("presets")
			.select("*")
			.eq("slug", currentSlug)
			.single();

		if (selectError) {
			console.error(`[FINAL SELECT ERROR] ${tag}`, selectError);
			throw selectError;
		}

		return preset;
	}

	throw (
		lastError || new Error("Failed to create preset after multiple attempts.")
	);
}

export async function getPresetById(client: DalClient, id: string) {
	const { data: preset, error } = await client
		.from("presets")
		.select(PRESET_SELECT_PUBLIC)
		.eq("id", id)
		.single();

	if (error) {
		throw error;
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
			const cleanTerm = sanitizePostgrestValue(params.search.trim());
			const term = cleanTerm ? `%${cleanTerm}%` : "";
			if (term) {
				query = query.or(
					`title.ilike.${term},description.ilike.${term},category.ilike.${term}`,
				);
			}
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

		if (params.amVersion) {
			const normalized = normalizeAmVersion(params.amVersion);
			if (normalized) {
				query = query
					.or(`am_version_min.is.null,am_version_min.lte.${normalized}`)
					.or(`am_version_max.is.null,am_version_max.gte.${normalized}`);
			}
		}

		if (params.tags && params.tags.length > 0) {
			query = query.contains("tags", params.tags);
		}

		if (params.hasVideo) {
			query = query.not("preview_video_url", "is", null);
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

		if (error) throw error;
		return (data ?? []) as unknown as PresetWithCreator[];
	} catch (error) {
		console.error("Failed to list published presets:", error);
		throw error;
	}
}

export interface RemixNode {
	id: string;
	slug: string;
	title: string;
	thumbnail_url: string;
	creator: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
	};
}

/**
 * Resolve a user-supplied remix reference (uuid, slug, or /preset/<slug> URL)
 * to a published preset id. Returns null when unresolvable.
 */
export async function resolvePresetRef(
	client: DalClient,
	ref: string,
): Promise<string | null> {
	const trimmed = ref.trim();
	if (!trimmed) return null;
	const uuidMatch = trimmed.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
	);
	const slugMatch = trimmed.match(/\/preset\/([A-Za-z0-9-]+)/);
	const slug =
		slugMatch?.[1] ??
		(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(trimmed) && !uuidMatch
			? trimmed
			: null);
	try {
		if (uuidMatch) {
			const { data } = await client
				.from("presets")
				.select("id")
				.eq("id", trimmed)
				.eq("status", "published")
				.maybeSingle();
			return (data as { id?: string } | null)?.id ?? null;
		}
		if (!slug) return null;
		const { data } = await client
			.from("presets")
			.select("id")
			.eq("slug", slug)
			.eq("status", "published")
			.maybeSingle();
		return (data as { id?: string } | null)?.id ?? null;
	} catch {
		return null;
	}
}

export async function getRemixParent(
	client: DalClient,
	remixedFromId: string,
): Promise<RemixNode | null> {
	try {
		const { data, error } = await client
			.from("presets")
			.select(
				`id, slug, title, thumbnail_url,
				creator:users!presets_creator_id_fkey (
					id, username, display_name, avatar_url
				)`,
			)
			.eq("id", remixedFromId)
			.eq("status", "published")
			.maybeSingle();
		if (error || !data) return null;
		return data as unknown as RemixNode;
	} catch {
		return null;
	}
}

export async function listRemixChildren(
	client: DalClient,
	presetId: string,
	limit = 6,
): Promise<{ items: RemixNode[]; total: number }> {
	try {
		const { data, count, error } = await client
			.from("presets")
			.select(
				`id, slug, title, thumbnail_url,
				creator:users!presets_creator_id_fkey (
					id, username, display_name, avatar_url
				)`,
				{ count: "exact" },
			)
			.eq("remixed_from_id", presetId)
			.eq("status", "published")
			.order("created_at", { ascending: false })
			.limit(limit);
		if (error) return { items: [], total: 0 };
		return {
			items: (data ?? []) as unknown as RemixNode[],
			total: count ?? 0,
		};
	} catch {
		return { items: [], total: 0 };
	}
}

export async function getPresetBySlug(
	client: DalClient,
	slug: string,
): Promise<PresetWithCreator | null> {
	const { data, error } = await client
		.from("presets")
		.select(PRESET_SELECT_WITH_CREATOR)
		.eq("slug", slug)
		.eq("status", "published")
		.maybeSingle();

	if (error) throw error;
	if (!data) return null;
	return data as unknown as PresetWithCreator;
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

		if (error) throw error;
		return (data ?? []) as unknown as PresetWithCreator[];
	} catch (error) {
		console.error("Failed to list creator presets:", error);
		throw error;
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
			if (filter.status === "published") {
				query = query.eq("status", "published");
			} else if (filter.status === "pending") {
				query = query.eq("status", "pending");
			} else if (filter.status === "draft") {
				query = query.eq("status", "draft");
			} else if (
				filter.status === "rejected" ||
				filter.status === "removed" ||
				filter.status === "archived"
			) {
				query = query.eq("status", "removed");
			} else {
				query = query.eq("status", filter.status);
			}
		}

		if (filter.search?.trim()) {
			const cleanTerm = sanitizePostgrestValue(filter.search.trim());
			const term = cleanTerm ? `%${cleanTerm}%` : "";
			if (term) {
				query = query.or(
					`title.ilike.${term},description.ilike.${term},category.ilike.${term}`,
				);
			}
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
			throw error;
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
		throw error;
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

/**
 * Strips PostgREST filter metacharacters out of user search text so that
 * `ilike` needles passed through `.or()` cannot inject additional filters
 * (e.g. `,` or `)` separators, quotes, or escaping backslashes).
 */
export function sanitizePostgrestValue(value: string): string {
	return value
		.replace(/[\0]/g, "")
		.replace(/[\\,()'"]/g, "")
		.trim();
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
	price?: number;
	is_paid?: boolean;
	currency?: string;
}

export async function updatePresetByOwner(
	client: DalClient,
	creatorId: string,
	presetId: string,
	data: UpdatePresetInput,
) {
	const { data: existing, error: checkError } = await client
		.from("presets")
		.select("id, creator_id, status")
		.eq("id", presetId)
		.single();

	if (checkError || !existing) {
		throw new Error("Preset not found");
	}

	const existingRecord = existing as unknown as {
		id: string;
		creator_id: string;
		status?: string;
	};
	if (existingRecord.creator_id !== creatorId) {
		throw new Error("Unauthorized: You can only edit your own presets");
	}

	// Moderation enforcement: if banned/rejected by staff, creator cannot self-publish
	if (
		(existingRecord.status === "rejected" ||
			existingRecord.status === "removed") &&
		data.status === "published"
	) {
		throw new Error(
			"This preset was rejected or removed by staff and cannot be re-published without appeal.",
		);
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
		.select("id, download_count")
		.eq("creator_id", creatorId);

	const presetRows = (creatorPresetIds || []) as unknown as {
		id: string;
		download_count?: number;
	}[];

	const presetIds = presetRows.map((p) => p.id);
	let totalDownloads = 0;
	let uniqueDownloads = 0;
	for (const p of presetRows) {
		totalDownloads += p.download_count ?? 0;
		uniqueDownloads +=
			(p as { unique_download_count?: number }).unique_download_count ?? 0;
	}

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

	// Monetization sales statistics
	let totalSalesCount = 0;
	let totalGrossRevenue = 0;
	let totalCreatorEarnings = 0;

	try {
		const { data: salesData } = await client
			.from("preset_orders")
			.select("gross_amount, creator_payout_amount, payment_status")
			.eq("seller_id", creatorId)
			.eq("payment_status", "paid");

		if (salesData) {
			const sales = salesData as unknown as {
				gross_amount: number;
				creator_payout_amount: number;
			}[];
			totalSalesCount = sales.length;
			for (const s of sales) {
				totalGrossRevenue += Number(s.gross_amount || 0);
				totalCreatorEarnings += Number(s.creator_payout_amount || 0);
			}
		}
	} catch {
		// Table may not yet exist in remote database
	}

	const topPresets = (topPresetsData || []) as unknown as {
		id: string;
		title: string;
		slug: string;
		thumbnail_url: string;
		download_count: number;
		unique_download_count?: number;
		like_count: number;
		view_count: number;
		status: string;
		created_at: string;
	}[];

	const hasData =
		topPresets.some(
			(p) => p.download_count > 0 || p.like_count > 0 || p.view_count > 0,
		) ||
		likesOverTime.length > 0 ||
		totalSalesCount > 0;

	return {
		timeframe,
		hasData,
		totalDownloads,
		uniqueDownloads,
		topPresets,
		likesOverTime,
		monetization: {
			totalSalesCount,
			totalGrossRevenue: Number(totalGrossRevenue.toFixed(2)),
			totalCreatorEarnings: Number(totalCreatorEarnings.toFixed(2)),
		},
	};
}

export async function incrementPresetView(
	client: DalClient,
	presetId: string,
): Promise<number> {
	try {
		const { data: current } = await client
			.from("presets")
			.select("view_count")
			.eq("id", presetId)
			.maybeSingle();

		if (current) {
			const newCount =
				((current as { view_count?: number }).view_count || 0) + 1;
			await client
				.from("presets")
				.update({ view_count: newCount } as never)
				.eq("id", presetId);
			return newCount;
		}
		return 0;
	} catch (e) {
		console.error("Failed to increment preset view count:", e);
		return 0;
	}
}
