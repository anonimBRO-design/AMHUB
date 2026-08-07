// Shared API types for App Router route handlers and clients.

import type { PresetFileType } from "./database";

export type ApiErrorCode =
	| "bad_request"
	| "unauthorized"
	| "forbidden"
	| "not_found"
	| "conflict"
	| "unprocessable_entity"
	| "rate_limited"
	| "payload_too_large"
	| "unsupported_media_type"
	| "internal_server_error";

export interface ApiErrorBody {
	code: ApiErrorCode;
	message: string;
	details?: unknown;
	requestId?: string;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	offset: number;
	total?: number;
	hasMore?: boolean;
}

export interface CursorPaginationMeta {
	limit: number;
	nextCursor?: string;
	previousCursor?: string;
	hasMore: boolean;
}

export interface ApiMeta {
	pagination?: PaginationMeta;
	cursor?: CursorPaginationMeta;
	requestId?: string;
}

export interface ApiSuccessResponse<T> {
	data: T;
	error: null;
	meta?: ApiMeta;
}

export interface ApiFailureResponse {
	data: null;
	error: ApiErrorBody;
	meta?: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export interface PaginatedResponse<T> {
	items: T[];
	page: number;
	limit: number;
	total: number;
	hasMore: boolean;
}

export type SortOrder = "asc" | "desc";
export type SortField =
	| "created_at"
	| "download_count"
	| "like_count"
	| "view_count"
	| "title"
	| "oldest"
	| "most_downloaded"
	| "most_liked"
	| "trending";

export interface ListQueryParams {
	page?: number;
	limit?: number;
	sort?: SortField;
	order?: SortOrder;
	search?: string;
	tags?: string[];
	fileType?: PresetFileType;
}

export interface UserProfileResponse {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	banner_url: string | null;
	bio: string | null;
	website_url: string | null;
	tiktok_handle: string | null;
	instagram_handle: string | null;
	discord_handle: string | null;
	youtube_url: string | null;
	xp: number;
	level: number;
	is_verified: boolean;
	is_staff: boolean;
	country_code: string | null;
	created_at: string;
	updated_at: string;
	follower_count: number;
	following_count: number;
	is_following?: boolean;
}

export interface UpdateUserProfileInput {
	display_name?: string;
	bio?: string | null;
	avatar_url?: string | null;
	banner_url?: string | null;
	website_url?: string | null;
	tiktok_handle?: string | null;
	instagram_handle?: string | null;
	discord_handle?: string | null;
	youtube_url?: string | null;
	country_code?: string | null;
}

export interface FollowUserResponse {
	following_id: string;
	following_username: string;
	following: boolean;
}

export interface CollectionOwner {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	is_verified: boolean;
}

export interface CollectionResponse {
	id: string;
	slug: string;
	owner_id: string;
	title: string;
	description: string | null;
	cover_url: string | null;
	is_public: boolean;
	preset_count: number;
	created_at: string;
	updated_at: string;
	owner?: CollectionOwner;
}

export interface CreateCollectionInput {
	title: string;
	slug?: string;
	description?: string | null;
	cover_url?: string | null;
	is_public?: boolean;
}

export interface UpdateCollectionInput {
	title?: string;
	slug?: string;
	description?: string | null;
	cover_url?: string | null;
	is_public?: boolean;
}

export type PresetUploadType = "xml" | "qr" | "thumbnail";

export interface PresignedUploadResponse {
	/** Direct PUT URL the client uses to upload the file to Supabase Storage. */
	upload_url: string;
	/** Opaque token required alongside the upload URL by the Supabase SDK. */
	token: string;
	/** Object path inside the bucket. Persist this when creating the resource. */
	storage_path: string;
	/** Bucket the file was allocated in. */
	bucket: string;
	/** Sanitised original filename (for display metadata only). */
	original_filename: string;
}

export interface PresetUploadResponse extends PresignedUploadResponse {
	upload_type: PresetUploadType;
}
