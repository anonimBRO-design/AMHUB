// API types for REST endpoints

export interface ApiResponse<T> {
	data: T;
	error?: string;
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
	};
}

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
	| "downloads_count"
	| "likes_count"
	| "title";

export interface ListQueryParams {
	page?: number;
	limit?: number;
	sort?: SortField;
	order?: SortOrder;
	search?: string;
	tags?: string[];
	fileType?: "flstudio" | "ableton" | "logic" | "studioone";
}
