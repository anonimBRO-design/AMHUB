import { z } from "zod";

export const uuidIdRouteParamsSchema = z.object({
	id: z.string().uuid(),
});

export const commentIdRouteParamsSchema = z.object({
	commentId: z.string().uuid(),
});

export const usernameRouteParamsSchema = z.object({
	username: z.string().trim().min(1),
});

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});
