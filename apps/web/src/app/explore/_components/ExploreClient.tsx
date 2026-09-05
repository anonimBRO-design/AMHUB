"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Compass, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CategoryScroller } from "./CategoryScroller";
import { EmptyState } from "./EmptyState";
import { FilterSheet } from "./FilterSheet";
import { SearchBar } from "./SearchBar";
import { SortMenu } from "./SortMenu";
import { TrendingSection } from "./TrendingSection";

interface ExploreClientProps {
	presets: PresetCardPreset[];
}

export function ExploreClient({ presets }: ExploreClientProps) {
	const searchParams = useSearchParams();
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

	const searchQuery = searchParams.get("search") ?? undefined;
	const category = searchParams.get("category") ?? undefined;
	const sort = searchParams.get("sort") ?? undefined;
	const difficulty = searchParams.get("difficulty") ?? undefined;
	const fileType = searchParams.get("fileType") ?? undefined;
	const amVersion = searchParams.get("amVersion") ?? undefined;

	let activeFilterCount = 0;
	if (category) activeFilterCount++;
	if (difficulty) activeFilterCount++;
	if (fileType) activeFilterCount++;
	if (amVersion) activeFilterCount++;
	if (sort && sort !== "created_at") activeFilterCount++;

	const isFiltered = Boolean(
		searchQuery || category || sort || difficulty || fileType || amVersion,
	);

	return (
		<div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-0">
			{/* Top Glass Header Banner */}
			<div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/15 rounded-full blur-[90px]" />

				<div className="space-y-2 relative z-10">
					<div className="flex items-center gap-2 text-xs font-extrabold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
						<span>Explore Catalog</span>
					</div>
					<h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
						Discover AMHUB Catalog
					</h1>
					{/* Navigation Tabs */}
					<div className="flex items-center gap-2 pt-2">
						<span className="px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-600/30">
							Presets
						</span>
						<a
							href="/creators"
							className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Jelajahi Kreator
						</a>
						<a
							href="/challenges"
							className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Challenge
						</a>
						<a
							href="/requests"
							className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Request
						</a>
					</div>
				</div>

				<div className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold tracking-wide w-fit">
					<Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
					<span>{presets.length} Presets Available</span>
				</div>
			</div>

			<SearchBar
				onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
				activeFilterCount={activeFilterCount}
			/>

			<div className="space-y-3">
				<CategoryScroller />
				<SortMenu />
			</div>

			<FilterSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
			/>

			{!isFiltered && <TrendingSection presets={presets} />}

			<section className="space-y-6">
				<div className="flex items-center justify-between px-1">
					<h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
						{searchQuery
							? `Results for "${searchQuery}"`
							: category
								? `${category.charAt(0).toUpperCase() + category.slice(1)} Presets`
								: "All Presets"}
					</h2>
				</div>

				{presets.length > 0 ? (
					<PresetGrid
						presets={presets}
						isLoading={false}
						hasMore={false}
						onLoadMore={() => {}}
					/>
				) : (
					<EmptyState searchQuery={searchQuery} category={category} />
				)}
			</section>
		</div>
	);
}
