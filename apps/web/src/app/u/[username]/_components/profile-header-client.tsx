"use client";

import { ProfileHeader } from "@presethub/ui";

interface ProfileHeaderClientProps {
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		badges: Array<{
			key: string;
			name: string;
			description?: string;
			iconUrl?: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		}>;
	};
	isOwnProfile: boolean;
}

export function ProfileHeaderClient({
	user,
	isOwnProfile,
}: ProfileHeaderClientProps) {
	const handleFollow = async () => {
		try {
			await fetch(`/api/users/${user.username}/follow`, { method: "POST" });
		} catch (e) {
			console.error("Failed to follow user", e);
		}
	};

	const handleShare = async () => {
		if (typeof window !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.writeText(window.location.href);
		}
	};

	return (
		<ProfileHeader
			user={user}
			isOwnProfile={isOwnProfile}
			onFollow={handleFollow}
			onShare={handleShare}
		/>
	);
}
