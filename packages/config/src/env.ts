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

/**
 * Supabase clients expect the project origin and append service paths such as
 * `/rest/v1` themselves. Accepting a REST endpoint here would otherwise make
 * every query target `/rest/v1/rest/v1/...`, which PostgREST rejects with
 * PGRST125.
 */
function normalizeSupabaseProjectUrl(value: string): string {
	if (!value) return value;

	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		throw new Error(
			"Invalid NEXT_PUBLIC_SUPABASE_URL: it must be a valid Supabase project URL.",
		);
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(
			"Invalid NEXT_PUBLIC_SUPABASE_URL: it must use http or https.",
		);
	}

	const path = url.pathname.replace(/\/+$/, "");
	if (path === "/rest/v1") {
		url.pathname = "/";
	} else if (path) {
		throw new Error(
			"Invalid NEXT_PUBLIC_SUPABASE_URL: use the project URL without a service path (for example, https://<project-ref>.supabase.co), not a /rest/v1 endpoint.",
		);
	}

	if (url.search || url.hash) {
		throw new Error(
			"Invalid NEXT_PUBLIC_SUPABASE_URL: query parameters and fragments are not supported.",
		);
	}

	return url.origin;
}

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
	// Skip validation during Next.js build phase — env vars are only required at runtime.
	const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
	if (isBuildPhase) return;

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
		NEXT_PUBLIC_SUPABASE_URL: normalizeSupabaseProjectUrl(
			env.NEXT_PUBLIC_SUPABASE_URL,
		),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
	};
}

export function validateServerEnv(): ServerEnv {
	const publicEnv = validatePublicEnv();
	assertRequired(env, ["SUPABASE_SERVICE_ROLE_KEY"], "server");

	return {
		...env,
		...publicEnv,
	};
}

export function validateEnv() {
	validatePublicEnv();
	return true;
}
