import { validatePublicEnv } from "@presethub/config";
import type { Database } from "@presethub/types";
import { createBrowserClient } from "@supabase/ssr";

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
