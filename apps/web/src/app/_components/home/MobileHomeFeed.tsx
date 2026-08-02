"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Flame, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileHomeFeedProps {
	presets: PresetCardPreset[];
	categories: { id: string; name: string }[];
}

export function MobileHomeFeed({ presets, categories }: MobileHomeFeedProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("all");

	const filteredPresets = presets.filter((p) => {
		const matchesSearch =
			!searchQuery.trim() ||
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.creator.displayName.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			activeCategory === "all" ||
			p.category.toLowerCase() === activeCategory.toLowerCase();
		return matchesSearch && matchesCategory;
	});

	const trendingPresets = presets.slice(0, 4);

	return (
		<div className="md:hidden space-y-6 pb-24">
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-interactive-primary)] via-purple-900 to-[var(--color-bg-surface)] p-5 text-white shadow-2xl space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<img
							src="/logo.png"
							alt="AMHUB Logo"
							className="w-8 h-8 rounded-xl object-contain shadow-md"
						/>
						<span className="text-xs font-bold tracking-wider uppercase text-purple-200">
							AMHUB Mobile
						</span>
					</div>
					<span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-white/10">
						v1.0 Ready
					</span>
				</div>

				<div className="space-y-1">
					<h1 className="text-2xl font-black tracking-tight text-white leading-tight">
						Pro Alight Motion Presets
					</h1>
					<p className="text-xs text-purple-200/90 leading-relaxed">
						Discover velocity, transitions, and XML editing presets.
					</p>
				</div>
			</div>

			<div className="sticky top-16 z-30 pt-1 pb-2 bg-[var(--color-bg-base)]/90 backdrop-blur-xl">
				<div className="relative flex items-center">
					<Search className="absolute left-4 w-4 h-4 text-[var(--color-text-tertiary)]" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search presets, creators..."
						className="w-full min-h-[50px] pl-11 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] shadow-lg"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between px-1">
					<span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Categories
					</span>
				</div>
				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
					<button
						type="button"
						onClick={() => setActiveCategory("all")}
						className={`shrink-0 min-h-[44px] px-4 rounded-2xl text-xs font-bold transition-all shadow-md ${
							activeCategory === "all"
								? "bg-[var(--color-interactive-primary)] text-white"
								: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
						}`}
					>
						✨ All Presets
					</button>
					{categories.map((c) => (
						<button
							key={c.id}
							type="button"
							onClick={() => setActiveCategory(c.id)}
							className={`shrink-0 min-h-[44px] px-4 rounded-2xl text-xs font-bold transition-all shadow-md ${
								activeCategory === c.id
									? "bg-[var(--color-interactive-primary)] text-white"
									: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
							}`}
						>
							{c.name}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
						<Flame className="w-4 h-4 fill-current" />
						<span>Trending Edits</span>
					</div>
					<Link
						href="/explore"
						className="text-[11px] font-bold text-[var(--color-interactive-primary)]"
					>
						See All →
					</Link>
				</div>

				<div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
					{trendingPresets.map((preset) => (
						<Link
							key={preset.id}
							href={`/preset/${preset.slug}`}
							className="shrink-0 w-60 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden shadow-xl space-y-2 p-2.5 hover:border-[var(--color-interactive-primary)] transition-all"
						>
							<div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
								<img
									src={
										preset.thumbnailUrl ||
										"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80"
									}
									alt={preset.title}
									className="w-full h-full object-cover"
								/>
								<span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-amber-400 border border-amber-500/30">
									🔥 {preset.downloadCount}
								</span>
							</div>
							<div className="px-1 space-y-1">
								<h3 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
									{preset.title}
								</h3>
								<div className="flex items-center gap-2">
									<img
										src={
											preset.creator.avatarUrl ||
											`https://api.dicebear.com/7.x/identicon/svg?seed=${preset.creator.username}`
										}
										alt={preset.creator.displayName}
										className="w-4 h-4 rounded-full object-cover"
									/>
									<span className="text-[11px] text-[var(--color-text-tertiary)] truncate">
										@{preset.creator.username}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between px-1">
					<span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Featured Catalog ({filteredPresets.length})
					</span>
				</div>
				<PresetGrid
					presets={filteredPresets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			</div>
		</div>
	);
}
