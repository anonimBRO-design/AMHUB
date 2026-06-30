// Environment variable configuration based on Product Specification §15.

type PublicEnv = {
	NODE_ENV: string;
	NEXT_PUBLIC_SUPABASE_URL: string;
	NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
	NEXT_PUBLIC_APP_URL: string;
};

type ServerEnv = PublicEnv & {
	SUPABASE_SERVICE_ROLE_KEY: string;
};

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
	NEXT_PUBLIC_SUPABASE_ANON_KEY:
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
	NEXT_PUBLIC_APP_URL:
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

function assertRequired(
	values: Record<string, string>,
	keys: readonly string[],
	context: string,
) {
	const missing = keys.filter((key) => !values[key]);

	if (missing.length > 0 && env.NODE_ENV !== "test") {
		throw new Error(
			`Missing ${context} environment variables: ${missing.join(", ")}`,
		);
	}
}

export function validatePublicEnv(): PublicEnv {
	const required = [
		"NEXT_PUBLIC_SUPABASE_URL",
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
	] as const;

	assertRequired(env, required, "public");

	return {
		NODE_ENV: env.NODE_ENV,
		NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
	};
}

export function validateServerEnv(): ServerEnv {
	validatePublicEnv();
	assertRequired(env, ["SUPABASE_SERVICE_ROLE_KEY"], "server");

	return env;
}

export function validateEnv() {
	validatePublicEnv();
	return true;
}
