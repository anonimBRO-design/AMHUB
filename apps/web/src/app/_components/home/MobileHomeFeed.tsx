"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { ChevronRight, Download, Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

interface MobileHomeFeedProps {
	presets: PresetCardPreset[];
	categories: { id: string; name: string }[];
}

export function MobileHomeFeed({ presets, categories }: MobileHomeFeedProps) {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Local filtering based on category and search query
	const filteredPresets = useMemo(() => {
		return presets.filter((preset) => {
			const matchesCategory =
				activeCategory === "all" ||
				preset.category.toLowerCase() === activeCategory.toLowerCase();
			const matchesSearch =
				preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				preset.creator.displayName
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				preset.creator.username
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	}, [presets, activeCategory, searchQuery]);

	// Extract trending items from the whole list
	const trendingPresets = useMemo(() => {
		return [...presets]
			.sort((a, b) => b.downloadCount - a.downloadCount)
			.slice(0, 5);
	}, [presets]);

	return (
		<div className="md:hidden flex flex-col pb-32">
			{/* 1. HERO BANNER */}
			<div className="-mx-4 mb-8 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 px-4 py-8 text-white min-h-[200px] flex flex-col justify-end relative overflow-hidden">
				{/* Decorative background blur */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

				<div className="relative z-10 space-y-4">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-sm">
							AM
						</div>
						<span className="text-lg font-extrabold tracking-tight">AMHUB</span>
					</div>

					<div>
						<h1 className="text-[28px] font-black leading-tight mb-2">
							Discover Next-Gen Presets
						</h1>
						<p className="text-[15px] text-white/80">
							Elevate your videos with premium Alight Motion presets
						</p>
					</div>

					<button
						type="button"
						className="min-h-[56px] w-full bg-white text-purple-700 font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-lg active:scale-[0.98] transition-transform"
					>
						Start Creating
					</button>
				</div>
			</div>

			{/* 2. SEARCH BAR */}
			<div className="sticky top-[64px] z-30 px-4 mb-8">
				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search presets, creators..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full min-h-[52px] pl-12 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
					/>
				</div>
			</div>

			{/* 3. CATEGORY CHIPS */}
			<div className="px-4 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<div className="flex gap-3 pb-2">
					<button
						type="button"
						onClick={() => setActiveCategory("all")}
						className={`shrink-0 min-h-[48px] px-5 rounded-full text-sm font-semibold transition-colors ${
							activeCategory === "all"
								? "bg-[var(--color-interactive-primary)] text-white"
								: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-gray-700"
						}`}
					>
						All Presets
					</button>
					{categories.map((cat) => (
						<button
							type="button"
							key={cat.id}
							onClick={() => setActiveCategory(cat.id)}
							className={`shrink-0 min-h-[48px] px-5 rounded-full text-sm font-semibold transition-colors ${
								activeCategory === cat.id
									? "bg-[var(--color-interactive-primary)] text-white"
									: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-gray-700"
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			</div>

			{/* 4. TRENDING SECTION */}
			{searchQuery === "" && activeCategory === "all" && (
				<div className="mb-8 space-y-4">
					<div className="flex items-center justify-between px-4">
						<h2 className="text-xl font-bold">Trending Now</h2>
						<Link
							href="/trending"
							className="text-sm font-semibold text-violet-600 flex items-center gap-1 active:opacity-70"
						>
							See all <ChevronRight className="w-4 h-4" />
						</Link>
					</div>

					<div className="flex gap-4 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
						{trendingPresets.map((preset) => (
							<div
								key={preset.id}
								className="w-72 shrink-0 snap-start rounded-2xl overflow-hidden shadow-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex flex-col"
							>
								<div className="relative aspect-[4/3] w-full bg-gray-100">
									{preset.thumbnailUrl ? (
										<img
											src={preset.thumbnailUrl}
											alt={preset.title}
											className="w-full h-full object-cover"
											loading="lazy"
										/>
									) : (
										<div className="w-full h-full bg-gray-200" />
									)}
									<div className="absolute bottom-2 right-2 rounded-full bg-black/60 text-white text-sm font-bold px-3 py-1 flex items-center gap-1 backdrop-blur-sm">
										<Download className="w-4 h-4" />
										{preset.downloadCount > 1000
											? `${(preset.downloadCount / 1000).toFixed(1)}k`
											: preset.downloadCount}
									</div>
								</div>

								<div className="p-3">
									<h3 className="text-[15px] font-bold line-clamp-2 leading-tight mb-3">
										{preset.title}
									</h3>
									<div className="flex items-center gap-2">
										{preset.creator.avatarUrl ? (
											<img
												src={preset.creator.avatarUrl}
												alt={preset.creator.username}
												className="w-8 h-8 rounded-full object-cover"
											/>
										) : (
											<div className="w-8 h-8 rounded-full bg-gray-200" />
										)}
										<span className="text-sm text-gray-500 font-medium truncate">
											@{preset.creator.username}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 5. MAIN FEED */}
			<div className="px-4 space-y-4">
				<h2 className="text-xl font-bold">
					{searchQuery ? "Search Results" : "For You"}
				</h2>

				{filteredPresets.length === 0 ? (
					<div className="py-12 text-center text-gray-500 text-[15px]">
						No presets found. Try a different search or category.
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3">
						{filteredPresets.map((preset) => (
							<div
								key={preset.id}
								className="rounded-2xl overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md flex flex-col active:scale-[0.98] transition-transform"
							>
								<div className="relative aspect-[3/4] w-full bg-gray-100">
									{preset.thumbnailUrl ? (
										<img
											src={preset.thumbnailUrl}
											alt={preset.title}
											className="w-full h-full object-cover"
											loading="lazy"
										/>
									) : (
										<div className="w-full h-full bg-gray-200" />
									)}
									<div className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur text-white text-[13px] font-semibold px-3 py-1 truncate max-w-[85%] shadow-sm">
										{preset.category}
									</div>
								</div>

								<div className="p-3 flex flex-col flex-grow">
									<h3 className="text-sm font-bold line-clamp-2 leading-tight mb-3 flex-grow">
										{preset.title}
									</h3>
									<div className="flex items-center gap-2 mt-auto">
										{preset.creator.avatarUrl ? (
											<img
												src={preset.creator.avatarUrl}
												alt={preset.creator.username}
												className="w-7 h-7 rounded-full object-cover shrink-0"
											/>
										) : (
											<div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
										)}
										<span className="text-[13px] text-gray-500 font-medium truncate">
											@{preset.creator.username}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
