import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();

	return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function POST(request: Request) {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();

	return NextResponse.json({ success: true });
}
