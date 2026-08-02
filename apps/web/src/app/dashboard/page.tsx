import { getFollowerCount } from "@/dal/users.dal";
import { listCreatorPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { DashboardClient } from "./_components/DashboardClient";

export const metadata: Metadata = {
	title: "Creator Dashboard | PresetHub",
	description:
		"View your preset analytics, downloads, likes, and manage your published content.",
};

export default async function DashboardPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const [rawPresets, followerCount] = await Promise.all([
		listCreatorPresets(supabase, user.id),
		getFollowerCount(supabase, user.id),
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
		displayName:
			user.user_metadata?.display_name ||
			user.email?.split("@")[0] ||
			"Creator",
		username:
			user.user_metadata?.username || user.email?.split("@")[0] || "creator",
		avatarUrl: user.user_metadata?.avatar_url || null,
	};

	return (
		<DashboardClient user={dashboardUserData} stats={stats} presets={presets} />
	);
}
