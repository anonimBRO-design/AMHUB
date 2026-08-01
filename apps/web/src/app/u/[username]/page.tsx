import { listCreatorPresets } from "@/data/presets";
import { getUserByUsername, getUserByUsernameOrNull } from "@/dal/users.dal";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresetGrid } from "@presethub/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHeaderClient } from "./_components/profile-header-client";

interface PageProps {
	params: Promise<{ username: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { username } = await params;
	const supabase = await createSupabaseServerClient();
	const user = await getUserByUsernameOrNull(supabase, username);

	if (!user) {
		return {
			title: "User Not Found | PresetHub",
		};
	}

	return {
		title: `${user.display_name} (@${user.username}) | PresetHub`,
		description: user.bio ?? `Check out Alight Motion presets by ${user.display_name} on PresetHub.`,
	};
}

export default async function ProfilePage({ params }: PageProps) {
	const { username } = await params;
	const currentUser = await getCurrentUser();
	const supabase = await createSupabaseServerClient();

	let user: Awaited<ReturnType<typeof getUserByUsername>>;
	try {
		user = await getUserByUsername(supabase, username, currentUser?.id);
	} catch {
		notFound();
	}

	const rawPresets = await listCreatorPresets(supabase, user.id);
	const presets = rawPresets.map(mapPresetToCardPreset);
	const isOwnProfile = currentUser?.id === user.id;

	const headerUser = {
		username: user.username,
		displayName: user.display_name,
		avatarUrl: user.avatar_url ?? undefined,
		badges: [],
	};

	return (
		<div className="space-y-8">
			<ProfileHeaderClient user={headerUser} isOwnProfile={isOwnProfile} />
			<div className="px-6 space-y-4">
				<h2 className="text-xl font-bold">Presets by {user.display_name}</h2>
				<PresetGrid
					presets={presets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			</div>
		</div>
	);
}
