"use client";

import { type PresetCardPreset, PresetGrid } from "@presethub/ui";
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

	// Count active non-default filters
	let activeFilterCount = 0;
	if (category) activeFilterCount++;
	if (difficulty) activeFilterCount++;
	if (fileType) activeFilterCount++;
	if (sort && sort !== "created_at") activeFilterCount++;

	const isFiltered = Boolean(
		searchQuery || category || sort || difficulty || fileType,
	);

	return (
		<div className="space-y-6 sm:space-y-8 pb-12">
			{/* Page Title & Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Compass className="w-4 h-4" />
						<span>Explore Catalog</span>
					</div>
					<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						Discover Alight Motion Presets
					</h1>
				</div>

				<div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
					<Sparkles className="w-4 h-4 text-amber-400" />
					<span>{presets.length} Presets Available</span>
				</div>
			</div>

			{/* Search Bar (Sticky Top) */}
			<SearchBar
				onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
				activeFilterCount={activeFilterCount}
			/>

			{/* Category Scroller & Sort Bar */}
			<div className="space-y-3">
				<CategoryScroller />
				<SortMenu />
			</div>

			{/* Filter Bottom Sheet (Mobile Dialog) */}
			<FilterSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
			/>

			{/* Trending Spotlight (Only shown on default unfiltered feed) */}
			{!isFiltered && <TrendingSection presets={presets} />}

			{/* Preset Catalog Feed */}
			<section className="space-y-4">
				<div className="flex items-center justify-between px-1">
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
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
