import type { User as Profile } from "@presethub/types";
import { type SupabaseUser, ensureUserProfile } from "../supabase/auth";
import {
	createSupabaseServerClient,
	type createSupabaseServiceClient,
} from "../supabase/server";
import { ApiError } from "./errors";

export type ApiSupabaseClient = Awaited<
	ReturnType<typeof createSupabaseServerClient>
>;
export type ApiServiceSupabaseClient = ReturnType<
	typeof createSupabaseServiceClient
>;

export interface ApiAuthContext {
	supabase: ApiSupabaseClient;
	user: SupabaseUser;
}

export interface ApiProfileContext extends ApiAuthContext {
	profile: Profile;
}

export async function getApiUser(): Promise<ApiAuthContext | null> {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return null;
	}

	return { supabase, user };
}

export async function requireApiUser(): Promise<ApiAuthContext> {
	const context = await getApiUser();

	if (!context) {
		throw new ApiError({ code: "unauthorized" });
	}

	return context;
}

export async function requireApiProfile(): Promise<ApiProfileContext> {
	const { supabase, user } = await requireApiUser();
	const profile = await ensureUserProfile(user);

	return { supabase, user, profile };
}
