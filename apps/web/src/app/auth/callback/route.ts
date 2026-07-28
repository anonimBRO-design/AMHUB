import { ensureUserProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const getSafeRedirectPath = (value: string | null) => {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return "/";
	}

	return value;
};

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const nextPath = getSafeRedirectPath(
		requestUrl.searchParams.get("next") ??
			requestUrl.searchParams.get("redirectTo"),
	);

	if (!code) {
		const loginUrl = new URL("/auth/login", requestUrl.origin);
		loginUrl.searchParams.set("error", "missing_callback_code");
		return NextResponse.redirect(loginUrl);
	}

	const supabase = await createSupabaseServerClient();
	const { error: exchangeError } =
		await supabase.auth.exchangeCodeForSession(code);

	if (exchangeError) {
		const loginUrl = new URL("/auth/login", requestUrl.origin);
		loginUrl.searchParams.set("error", "auth_callback_failed");
		return NextResponse.redirect(loginUrl);
	}

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		const loginUrl = new URL("/auth/login", requestUrl.origin);
		loginUrl.searchParams.set("error", "session_not_found");
		return NextResponse.redirect(loginUrl);
	}

	await ensureUserProfile(user);

	return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
