"use client";

import { FilterChip, PresetGrid, SearchBar } from "@presethub/ui";

export default function ExplorePage() {
	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Explore Presets</h1>
			<SearchBar value="" onChange={() => {}} onSubmit={() => {}} />
			<div className="flex gap-2">
				<FilterChip label="All" isActive={true} onClick={() => {}} />
			</div>
			<PresetGrid
				presets={[]}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
