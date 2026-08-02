"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileExploreViewProps {
	presets: PresetCardPreset[];
	categories: { id: string; name: string }[];
}

export function MobileExploreView({
	presets,
	categories,
}: MobileExploreViewProps) {
	const [query, setQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const filteredPresets = presets.filter((p) => {
		const matchesSearch =
			!query.trim() ||
			p.title.toLowerCase().includes(query.toLowerCase()) ||
			p.creator.displayName.toLowerCase().includes(query.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" ||
			p.category.toLowerCase() === selectedCategory.toLowerCase();
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="md:hidden space-y-4 pb-24">
			<div className="sticky top-16 z-30 pt-1 pb-2 bg-[var(--color-bg-base)]/90 backdrop-blur-xl space-y-3">
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search 1,000+ Alight Motion presets..."
							className="w-full min-h-[50px] pl-11 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)] shadow-lg"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
					<button
						type="button"
						onClick={() => setSelectedCategory("all")}
						className={`shrink-0 min-h-[42px] px-4 rounded-2xl text-xs font-bold transition-all shadow-md ${
							selectedCategory === "all"
								? "bg-[var(--color-interactive-primary)] text-white"
								: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
						}`}
					>
						✨ All
					</button>
					{categories.map((c) => (
						<button
							key={c.id}
							type="button"
							onClick={() => setSelectedCategory(c.id)}
							className={`shrink-0 min-h-[42px] px-4 rounded-2xl text-xs font-bold transition-all shadow-md ${
								selectedCategory === c.id
									? "bg-[var(--color-interactive-primary)] text-white"
									: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
							}`}
						>
							{c.name}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				{filteredPresets.map((preset) => (
					<Link
						key={preset.id}
						href={`/preset/${preset.slug}`}
						className="rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden shadow-lg space-y-2 p-2 hover:border-[var(--color-interactive-primary)] transition-all flex flex-col justify-between"
					>
						<div className="space-y-2">
							<div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40">
								<img
									src={
										preset.thumbnailUrl ||
										"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80"
									}
									alt={preset.title}
									className="w-full h-full object-cover"
								/>
								<span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-purple-300 border border-white/10">
									{preset.category}
								</span>
								<span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-emerald-400 border border-white/10">
									📥 {preset.downloadCount}
								</span>
							</div>

							<div className="px-1 space-y-1">
								<h3 className="text-xs font-bold text-[var(--color-text-primary)] line-clamp-2 leading-tight">
									{preset.title}
								</h3>
							</div>
						</div>

						<div className="flex items-center gap-1.5 px-1 pt-1 border-t border-[var(--color-border-subtle)]/60">
							<img
								src={
									preset.creator.avatarUrl ||
									`https://api.dicebear.com/7.x/identicon/svg?seed=${preset.creator.username}`
								}
								alt={preset.creator.displayName}
								className="w-4 h-4 rounded-full object-cover"
							/>
							<span className="text-[10px] text-[var(--color-text-tertiary)] truncate">
								@{preset.creator.username}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
