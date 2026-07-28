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
	| "title";

export interface ListQueryParams {
	page?: number;
	limit?: number;
	sort?: SortField;
	order?: SortOrder;
	search?: string;
	tags?: string[];
	fileType?: PresetFileType;
}
