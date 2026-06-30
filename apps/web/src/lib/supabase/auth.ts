import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./client";

export async function getCurrentUser() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		return null;
	}

	return user;
}

export async function requireUser() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	return user;
}

export async function getCurrentProfile() {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", user.id)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}
