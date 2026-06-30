"use client";

import { ProfileHeader } from "@presethub/ui";
import { use } from "react";

export default function ProfilePage({
	params,
}: { params: Promise<{ username: string }> }) {
	const { username } = use(params);

	// Placeholder
	const user = {
		username: username,
		displayName: "John Doe",
		avatarUrl: "/avatar.jpg",
		badges: [],
	};

	return (
		<ProfileHeader
			user={user}
			isOwnProfile={false}
			onFollow={() => {}}
			onShare={() => {}}
		/>
	);
}
