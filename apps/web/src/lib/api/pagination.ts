import type { CursorPaginationMeta, PaginationMeta } from "@presethub/types";
import { z } from "zod";
import { ApiError } from "./errors";
import { parseWithSchema, stringToIntSchema } from "./validation";

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

export const paginationQuerySchema = z.object({
	page: stringToIntSchema.default("1").pipe(z.number().int().min(1)),
	limit: stringToIntSchema
		.default(String(DEFAULT_PAGE_SIZE))
		.pipe(z.number().int().min(1).max(MAX_PAGE_SIZE)),
});

export const cursorPaginationQuerySchema = z.object({
	cursor: z.string().min(1).optional(),
	limit: stringToIntSchema
		.default(String(DEFAULT_PAGE_SIZE))
		.pipe(z.number().int().min(1).max(MAX_PAGE_SIZE)),
});

export interface PagePaginationParams {
	page: number;
	limit: number;
	offset: number;
}

export interface CursorPaginationParams {
	cursor?: string;
	limit: number;
}

export interface CursorPayload {
	value: string;
	id?: string;
	direction?: "next" | "previous";
}

export function getPaginationParams(
	searchParams: URLSearchParams,
): PagePaginationParams {
	const { page, limit } = parseWithSchema(
		paginationQuerySchema,
		Object.fromEntries(searchParams),
	);

	return {
		page,
		limit,
		offset: (page - 1) * limit,
	};
}

export function createPaginationMeta({
	page,
	limit,
	offset,
	total,
}: PagePaginationParams & { total?: number }): PaginationMeta {
	return {
		page,
		limit,
		offset,
		total,
		hasMore: typeof total === "number" ? offset + limit < total : undefined,
	};
}

export function getCursorPaginationParams(
	searchParams: URLSearchParams,
): CursorPaginationParams {
	return parseWithSchema(
		cursorPaginationQuerySchema,
		Object.fromEntries(searchParams),
	);
}

export function encodeCursor(payload: CursorPayload): string {
	return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload {
	try {
		const parsed: unknown = JSON.parse(
			Buffer.from(cursor, "base64url").toString("utf8"),
		);
		return parseWithSchema(
			z.object({
				value: z.string().min(1),
				id: z.string().min(1).optional(),
				direction: z.enum(["next", "previous"]).optional(),
			}),
			parsed,
		);
	} catch (error) {
		throw new ApiError({
			code: "bad_request",
			message: "Invalid pagination cursor.",
			cause: error,
		});
	}
}

export function createCursorPaginationMeta<TItem>({
	items,
	limit,
	getCursor,
}: {
	items: TItem[];
	limit: number;
	getCursor: (item: TItem) => CursorPayload;
}): CursorPaginationMeta {
	const visibleItems = items.slice(0, limit);
	const lastItem = visibleItems.at(-1);

	return {
		limit,
		hasMore: items.length > limit,
		nextCursor: lastItem ? encodeCursor(getCursor(lastItem)) : undefined,
	};
}
