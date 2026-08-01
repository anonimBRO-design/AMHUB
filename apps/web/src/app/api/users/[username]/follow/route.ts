import { followUser, unfollowUser } from "@/dal/users.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
	apiErrorResponse,
	apiNoContent,
	apiResponse,
} from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const usernameRouteParamsSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3)
		.max(24)
		.regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		const { username } = validateRouteParams(
			await params,
			usernameRouteParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:follow",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		const result = await followUser(supabase, profile.id, username);

		return apiResponse(result);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		const { username } = validateRouteParams(
			await params,
			usernameRouteParamsSchema,
		);
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "user:follow",
			limit: 30,
			windowMs: 60000,
			userId: profile.id,
		});

		await unfollowUser(supabase, profile.id, username);

		return apiNoContent();
	} catch (error) {
		return apiErrorResponse(error);
	}
}
