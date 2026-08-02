"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Bookmark, Search } from "lucide-react";
import { useState } from "react";

interface MobileBookmarksViewProps {
	bookmarks: PresetCardPreset[];
}

export function MobileBookmarksView({ bookmarks }: MobileBookmarksViewProps) {
	const [query, setQuery] = useState("");

	const filteredBookmarks = bookmarks.filter(
		(b) =>
			!query.trim() ||
			b.title.toLowerCase().includes(query.toLowerCase()) ||
			b.creator.displayName.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<div className="md:hidden space-y-4 pb-24">
			<div className="flex items-center gap-3 p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
					<Bookmark className="w-6 h-6 fill-current" />
				</div>
				<div>
					<h1 className="text-lg font-extrabold text-[var(--color-text-primary)]">
						Your Library
					</h1>
					<p className="text-xs text-[var(--color-text-secondary)] font-medium">
						{bookmarks.length} Bookmarked Presets
					</p>
				</div>
			</div>

			<div className="relative flex items-center">
				<Search className="absolute left-4 w-4 h-4 text-[var(--color-text-tertiary)]" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search saved presets..."
					className="w-full min-h-[48px] pl-11 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
				/>
			</div>

			<PresetGrid
				presets={filteredBookmarks}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
