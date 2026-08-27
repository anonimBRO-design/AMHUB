import type { Database, User as Profile } from "@presethub/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./server";

export type SupabaseUser = NonNullable<
	Awaited<
		ReturnType<
			Awaited<ReturnType<typeof createSupabaseServerClient>>["auth"]["getUser"]
		>
	>["data"]["user"]
>;

type ProfileBootstrapInput = {
	username?: string;
	displayName?: string;
};
type ProfileInsert = Database["public"]["Tables"]["users"]["Insert"];

const INVALID_PLACEHOLDERS = [
	"admin",
	"default user",
	"default_user",
	"guest",
	"anonymous",
	"default",
	"system",
];

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

export const getCurrentUser = cache(async () => {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		return null;
	}

	return user;
});

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
		return existingProfile as unknown as Profile;
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

	let baseUsername = normalizeUsername(
		metadataUsername ?? email.split("@")[0],
		fallbackUsername,
	);
	if (INVALID_PLACEHOLDERS.includes(baseUsername.toLowerCase())) {
		baseUsername = fallbackUsername;
	}

	const rawDisplayName =
		input.displayName ??
		getMetadataString(user, "display_name") ??
		getMetadataString(user, "full_name") ??
		getMetadataString(user, "name") ??
		metadataUsername;

	const displayName =
		rawDisplayName &&
		!INVALID_PLACEHOLDERS.includes(rawDisplayName.trim().toLowerCase())
			? rawDisplayName.trim()
			: baseUsername;

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
			avatar_url: avatarUrl,
			email: email,
			auth_provider: authProvider,
			last_active_at: new Date().toISOString(),
		};

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

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	return ensureUserProfile(user);
});

export async function requireProfile(): Promise<Profile> {
	const profile = await getCurrentProfile();

	if (!profile) {
		redirect("/auth/login");
	}

	return profile;
}
