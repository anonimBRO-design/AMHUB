import { getFollowerCount } from "@/dal/users.dal";
import { listCreatorPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardClient } from "./_components/DashboardClient";

export const metadata: Metadata = {
	title: "Creator Dashboard | AMHUB",
	description:
		"View your preset analytics, downloads, likes, and manage your published content.",
};

export default async function DashboardPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login");
	}

	const supabase = await createSupabaseServerClient();

	const [rawPresets, followerCount] = await Promise.all([
		listCreatorPresets(supabase, profile.id),
		getFollowerCount(supabase, profile.id),
	]);

	const presets = rawPresets.map(mapPresetToCardPreset);

	const stats = {
		totalDownloads: rawPresets.reduce((sum, p) => sum + p.download_count, 0),
		totalViews: rawPresets.reduce((sum, p) => sum + p.view_count, 0),
		followerCount,
		totalLikes: rawPresets.reduce((sum, p) => sum + p.like_count, 0),
		presetCount: presets.length,
	};

	const dashboardUserData = {
		displayName: profile.display_name,
		username: profile.username,
		avatarUrl: profile.avatar_url || null,
	};

	return (
		<DashboardClient user={dashboardUserData} stats={stats} presets={presets} />
	);
}
