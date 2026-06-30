"use client";

import { CreatorDashboard, PresetGrid } from "@presethub/ui";

export default function DashboardPage() {
	const stats = {
		totalDownloads: 100,
		totalViews: 200,
		followerCount: 10,
		totalLikes: 30,
	};
	return (
		<div className="space-y-8">
			<CreatorDashboard stats={stats} />
			<PresetGrid
				presets={[]}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
