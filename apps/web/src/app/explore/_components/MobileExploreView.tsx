"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { CheckCircle2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useMemo } from "react";

interface MobileExploreViewProps {
	presets: PresetCardPreset[];
	categories: { id: string; name: string }[];
}

export function MobileExploreView({
	presets,
	categories,
}: MobileExploreViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

	const filteredPresets = useMemo(() => {
		return presets.filter((preset) => {
			const matchesSearch =
				preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				preset.creator.username
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(preset.creator.displayName
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ??
					false);

			const matchesCategory = activeCategoryId
				? preset.category === activeCategoryId
				: true;

			return matchesSearch && matchesCategory;
		});
	}, [presets, searchQuery, activeCategoryId]);

	return (
		<div className="md:hidden pb-32">
			{/* STICKY HEADER */}
			<div className="sticky top-[64px] z-30 bg-background/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)] pb-4 pt-2">
				<div className="px-4">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search presets, creators..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full min-h-[52px] pl-12 pr-4 rounded-2xl bg-muted/50 border border-[var(--color-border-subtle)] text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20"
						/>
					</div>
				</div>

				{/* Categories */}
				<div className="mt-4 px-4 overflow-x-auto no-scrollbar">
					<div className="flex items-center gap-3 w-max">
						<button
							type="button"
							onClick={() => setActiveCategoryId(null)}
							className={`min-h-[48px] px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
								activeCategoryId === null
									? "bg-foreground text-background"
									: "bg-muted/50 text-foreground border border-[var(--color-border-subtle)]"
							}`}
						>
							All
						</button>
						{categories.map((cat) => (
							<button
								type="button"
								key={cat.id}
								onClick={() => setActiveCategoryId(cat.id)}
								className={`min-h-[48px] px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
									activeCategoryId === cat.id
										? "bg-foreground text-background"
										: "bg-muted/50 text-foreground border border-[var(--color-border-subtle)]"
								}`}
							>
								{cat.name}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="px-4 mt-6">
				<div className="mb-4">
					<p className="text-[15px] text-muted-foreground font-medium">
						{filteredPresets.length} presets found
					</p>
				</div>

				<div className="columns-2 gap-2 space-y-2">
					{filteredPresets.map((preset) => (
						<Link
							key={preset.id}
							href={`/preset/${preset.slug}`}
							className="block break-inside-avoid mb-2"
						>
							<div className="flex flex-col group cursor-pointer bg-card rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-sm">
								<div className="relative aspect-[3/4] w-full bg-muted overflow-hidden rounded-2xl">
									{preset.thumbnailUrl ? (
										<Image
											src={preset.thumbnailUrl}
											alt={preset.title}
											fill
											className="object-cover transition-transform group-hover:scale-105"
										/>
									) : (
										<div className="absolute inset-0 bg-muted" />
									)}

									{/* Category Badge Top-Left */}
									<div className="absolute top-2 left-2 z-10">
										<span className="inline-block bg-black/60 backdrop-blur rounded-full text-[13px] font-semibold text-white px-2.5 py-1">
											{categories.find((c) => c.id === preset.category)?.name ||
												preset.category}
										</span>
									</div>

									{/* Download Count Bottom-Right */}
									<div className="absolute bottom-2 right-2 z-10">
										<span className="inline-block bg-black/60 backdrop-blur rounded-full text-[13px] font-bold text-emerald-400 px-2.5 py-1">
											{Intl.NumberFormat("en-US", {
												notation: "compact",
											}).format(preset.downloadCount || 0)}
										</span>
									</div>
								</div>

								<div className="p-2.5">
									<h3 className="text-sm font-bold line-clamp-2 leading-snug text-foreground">
										{preset.title}
									</h3>

									<div className="flex items-center gap-2 mt-1.5">
										{preset.creator.avatarUrl ? (
											<div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-border">
												<Image
													src={preset.creator.avatarUrl}
													alt={preset.creator.username}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
												<span className="text-[10px] font-bold text-muted-foreground">
													{preset.creator.username.slice(0, 2).toUpperCase()}
												</span>
											</div>
										)}
										<span className="text-[13px] text-muted-foreground truncate">
											@{preset.creator.username}
										</span>
										{preset.creator.isVerified && (
											<CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
										)}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>

				{filteredPresets.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<p className="text-lg font-bold text-foreground">
							No presets found
						</p>
						<p className="text-[15px] text-muted-foreground mt-2">
							Try adjusting your search or filters.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
