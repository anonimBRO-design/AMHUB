"use client";

import { PresetGrid } from "@presethub/ui";

export default function BookmarksPage() {
	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Bookmarks</h1>
			<PresetGrid
				presets={[]}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
