import { validatePublicEnv, validateServerEnv } from "@presethub/config";
import type { Database } from "@presethub/types";
import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr/dist/main/types";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import type { PresetHubSupabaseClient } from "./client";

export const createSupabaseServerClient = cache(
	async (): Promise<PresetHubSupabaseClient> => {
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
	},
);

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
