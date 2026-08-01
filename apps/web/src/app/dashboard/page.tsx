import { getFollowerCount } from "@/dal/users.dal";
import { listCreatorPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreatorDashboard, PresetGrid } from "@presethub/ui";
import type { Metadata } from "next";

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
	};

	return (
		<div className="space-y-8">
			<CreatorDashboard stats={stats} />
			<div className="space-y-4">
				<h2 className="text-xl font-bold">Your Presets ({presets.length})</h2>
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
