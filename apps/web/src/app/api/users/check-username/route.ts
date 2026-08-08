import { isUsernameAvailable } from "@/dal/users.dal";
import { getApiUser } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const rawUsername = searchParams.get("username") ?? "";
		const username = rawUsername.trim().toLowerCase();

		if (!username) {
			return apiResponse({
				available: false,
				reason: "Username is required.",
			});
		}

		const supabase = await createSupabaseServerClient();
		const authContext = await getApiUser();

		const result = await isUsernameAvailable(
			supabase,
			username,
			authContext?.user?.id,
		);

		return apiResponse(result);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
