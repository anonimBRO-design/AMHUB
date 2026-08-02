"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Heart, Search } from "lucide-react";
import { useState } from "react";

interface MobileLikesViewProps {
	likedPresets: PresetCardPreset[];
}

export function MobileLikesView({ likedPresets }: MobileLikesViewProps) {
	const [query, setQuery] = useState("");

	const filteredLikes = likedPresets.filter(
		(l) =>
			!query.trim() ||
			l.title.toLowerCase().includes(query.toLowerCase()) ||
			l.creator.displayName.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<div className="md:hidden space-y-4 pb-24">
			<div className="flex items-center gap-3 p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
					<Heart className="w-6 h-6 fill-current" />
				</div>
				<div>
					<h1 className="text-lg font-extrabold text-[var(--color-text-primary)]">
						Liked Presets
					</h1>
					<p className="text-xs text-[var(--color-text-secondary)] font-medium">
						{likedPresets.length} Favorites
					</p>
				</div>
			</div>

			<div className="relative flex items-center">
				<Search className="absolute left-4 w-4 h-4 text-[var(--color-text-tertiary)]" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search liked presets..."
					className="w-full min-h-[48px] pl-11 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
			</div>

			<PresetGrid
				presets={filteredLikes}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
