"use client";

import { PresetGrid } from "@presethub/ui";

export default function LikesPage() {
	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Likes</h1>
			<PresetGrid
				presets={[]}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
