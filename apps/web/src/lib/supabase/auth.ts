import type { Database, User as Profile } from "@presethub/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

type ProfileBootstrapInput = {
	username?: string;
	displayName?: string;
};
type ProfileInsert = Database["public"]["Tables"]["users"]["Insert"];

const normalizeUsername = (value: string | undefined, fallback: string) => {
	const normalized = (value ?? "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9_]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 24);

	return normalized || fallback;
};

const getMetadataString = (
	user: SupabaseUser,
	key: string,
): string | undefined => {
	const value = user.user_metadata?.[key];
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

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

export async function ensureUserProfile(
	user: SupabaseUser,
	input: ProfileBootstrapInput = {},
): Promise<Profile> {
	const supabase = await createSupabaseServerClient();
	const { data: existingProfile, error: selectError } = await supabase
		.from("users")
		.select("*")
		.eq("id", user.id)
		.maybeSingle();

	if (selectError) {
		throw selectError;
	}

	if (existingProfile) {
		return existingProfile;
	}

	const email = user.email;

	if (!email) {
		throw new Error("Cannot create a user profile without an email address.");
	}

	const fallbackUsername = `user_${user.id.slice(0, 8)}`;
	const metadataUsername =
		input.username ??
		getMetadataString(user, "username") ??
		getMetadataString(user, "preferred_username");
	const baseUsername = normalizeUsername(
		metadataUsername ?? email.split("@")[0],
		fallbackUsername,
	);
	const displayName =
		input.displayName ??
		getMetadataString(user, "display_name") ??
		getMetadataString(user, "full_name") ??
		getMetadataString(user, "name") ??
		metadataUsername ??
		baseUsername;
	const avatarUrl =
		getMetadataString(user, "avatar_url") ?? getMetadataString(user, "picture");
	const provider = user.app_metadata?.provider;
	const authProvider = typeof provider === "string" ? provider : "email";
	const usernameCandidates =
		baseUsername === fallbackUsername
			? [baseUsername]
			: [baseUsername, `${baseUsername}_${user.id.slice(0, 8)}`];

	let lastError: unknown;

	for (const username of usernameCandidates) {
		const profileInsert = {
			id: user.id,
			username,
			display_name: displayName,
			email,
			avatar_url: avatarUrl,
			auth_provider: authProvider,
			last_active_at: new Date().toISOString(),
		} satisfies ProfileInsert;

		const { data, error } = await supabase
			.from("users")
			.insert(profileInsert as never)
			.select("*")
			.single();

		if (!error) {
			return data as Profile;
		}

		lastError = error;

		if (error.code !== "23505") {
			throw error;
		}
	}

	throw lastError;
}

export async function getCurrentProfile(): Promise<Profile | null> {
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

	return data ?? ensureUserProfile(user);
}
