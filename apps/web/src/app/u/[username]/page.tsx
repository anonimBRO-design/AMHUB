import {
	getUserByAuthId,
	getUserByUsername,
	getUserByUsernameOrNull,
} from "@/dal/users.dal";
import { listCreatorPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileClient } from "./_components/ProfileClient";

interface PageProps {
	params: Promise<{ username: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { username } = await params;
	const supabase = await createSupabaseServerClient();
	const rawUser = await getUserByUsernameOrNull(supabase, username);
	const user = rawUser as unknown as {
		display_name: string;
		username: string;
		bio: string | null;
	} | null;

	if (!user) {
		return {
			title: "User Not Found | AMHUB",
		};
	}

	return {
		title: `${user.display_name} (@${user.username}) | AMHUB`,
		description:
			user.bio ??
			`Check out Alight Motion presets by ${user.display_name} on AMHUB.`,
	};
}

export default async function ProfilePage({ params }: PageProps) {
	const { username } = await params;
	const currentUser = await getCurrentProfile();
	const supabase = await createSupabaseServerClient();

	let user: Awaited<ReturnType<typeof getUserByUsername>> = null;

	if (
		currentUser &&
		(username === "me" ||
			username.toLowerCase() === currentUser.username.toLowerCase())
	) {
		user = await getUserByAuthId(supabase, currentUser.id);
	}

	if (!user) {
		try {
			user = await getUserByUsername(supabase, username, currentUser?.id);
		} catch {
			notFound();
		}
	}

	if (!user) {
		notFound();
	}

	const rawPresets = await listCreatorPresets(supabase, user.id);
	const presets = rawPresets.map(mapPresetToCardPreset);
	const isOwnProfile = currentUser?.id === user.id;

	const profileUserData = {
		id: user.id,
		username: user.username,
		displayName: user.display_name,
		avatarUrl: user.avatar_url,
		bio: user.bio,
		isVerified: user.is_verified,
		followerCount: user.follower_count,
		followingCount: user.following_count,
		presetCount: user.preset_count,
		websiteUrl: user.website_url,
		tiktokHandle: user.tiktok_handle,
		instagramHandle: user.instagram_handle,
		youtubeUrl: user.youtube_url,
		createdAt: user.created_at,
	};

	return (
		<ProfileClient
			user={profileUserData}
			isOwnProfile={isOwnProfile}
			presets={presets}
		/>
	);
}
