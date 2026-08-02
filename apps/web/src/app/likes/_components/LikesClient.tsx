"use client";

import { type PresetCardPreset, PresetGrid } from "@presethub/ui";
import { Heart, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface LikesClientProps {
	initialPresets: PresetCardPreset[];
}

const CATEGORIES = [
	"All",
	"Velocity",
	"Transition",
	"Color",
	"Anime",
	"Gaming",
	"Lyric",
];

export function LikesClient({ initialPresets }: LikesClientProps) {
	const [presets] = useState(initialPresets);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const filteredPresets = presets.filter((p) => {
		const matchesCategory =
			selectedCategory === "All" ||
			p.category.toLowerCase() === selectedCategory.toLowerCase();

		const matchesSearch =
			!searchQuery.trim() ||
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.creator.displayName.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesCategory && matchesSearch;
	});

	return (
		<div className="space-y-6 max-w-6xl mx-auto pb-12">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
						<Heart className="w-4 h-4 fill-current" />
						<span>Favorites</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						Liked Presets
					</h1>
				</div>

				<div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
					<Sparkles className="w-4 h-4 text-rose-400" />
					<span>{presets.length} Presets Liked</span>
				</div>
			</div>

			{/* Sticky Search & Category Bar */}
			<div className="space-y-3 sticky top-16 z-20 backdrop-blur-xl bg-[var(--color-bg-base)]/80 py-2">
				{/* Search Bar */}
				<div className="relative flex items-center min-h-[48px] px-3.5 gap-2.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg focus-within:border-[var(--color-interactive-primary)]">
					<Search className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search in your liked presets..."
						className="w-full bg-transparent text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				{/* Category Chips */}
				<div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs select-none">
					{CATEGORIES.map((cat) => {
						const isActive = selectedCategory === cat;
						return (
							<button
								key={cat}
								type="button"
								onClick={() => setSelectedCategory(cat)}
								className={`shrink-0 min-h-[38px] px-4 rounded-xl border font-semibold transition-all active:scale-95 ${
									isActive
										? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
										: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
								}`}
							>
								{cat}
							</button>
						);
					})}
				</div>
			</div>

			{/* Presets Feed or Empty State */}
			{filteredPresets.length > 0 ? (
				<PresetGrid
					presets={filteredPresets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			) : (
				<div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3 max-w-md mx-auto my-8 shadow-xl">
					<div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
						<Heart className="w-8 h-8 fill-current" />
					</div>
					<h3 className="text-base font-bold text-[var(--color-text-primary)]">
						No Liked Presets Yet
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
						{searchQuery
							? `No liked presets matching "${searchQuery}".`
							: "Tap the heart icon on any preset to add it to your favorites."}
					</p>
				</div>
			)}
		</div>
	);
}
