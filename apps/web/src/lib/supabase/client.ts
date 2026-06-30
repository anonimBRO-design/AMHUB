import { validatePublicEnv, validateServerEnv } from "@presethub/config";
import type { Database } from "@presethub/types";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr/dist/main/types";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type PresetHubSupabaseClient = ReturnType<
	typeof createBrowserClient<Database>
>;

export function createSupabaseBrowserClient(): PresetHubSupabaseClient {
	const env = validatePublicEnv();

	return createBrowserClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
}

export async function createSupabaseServerClient(): Promise<PresetHubSupabaseClient> {
	const env = validatePublicEnv();
	const cookieStore = await cookies();

	return createServerClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// Server Components cannot mutate cookies. Middleware/actions can.
					}
				},
			},
		},
	);
}

export function createSupabaseServiceClient(): PresetHubSupabaseClient {
	const env = validateServerEnv();

	return createClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	) as unknown as PresetHubSupabaseClient;
}
