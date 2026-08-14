import type { PresetCardPreset } from "@presethub/ui";
import { ArrowUpRight, Download, Flame, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";

interface TrendingSectionProps {
	presets: PresetCardPreset[];
}

export function TrendingSection({ presets }: TrendingSectionProps) {
	if (!presets || presets.length === 0) return null;

	const trendingItems = presets.slice(0, 3);
	// Extract top categories directly from real Supabase dataset
	const trendingCategories = Array.from(
		new Set(presets.map((p) => p.category)),
	).slice(0, 6);

	return (
		<section className="space-y-4">
			{/* Real Database Trending Search Terms */}
			{trendingCategories.length > 0 && (
				<div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
					<div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0 px-2">
						<TrendingUp className="w-3.5 h-3.5" />
						<span>Trending:</span>
					</div>
					{trendingCategories.map((cat) => (
						<Link
							key={cat}
							href={`/explore?category=${encodeURIComponent(cat.toLowerCase())}`}
							className="px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/20 transition-all shrink-0"
						>
							#{cat}
						</Link>
					))}
				</div>
			)}

			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-flame-500/10 text-rose-400 border border-rose-500/20">
						<Flame className="w-4 h-4 text-rose-400 animate-pulse" />
					</div>
					<h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
						Trending This Week
					</h2>
				</div>
				<span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
					TOP 3
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{trendingItems.map((preset) => (
					<Link
						key={preset.id}
						href={`/preset/${preset.slug}`}
						className="group relative overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-interactive-primary)]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-interactive-primary)]/10 active:scale-[0.99]"
					>
						<div className="relative aspect-[9/16] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
							{preset.thumbnailUrl ? (
								<img
									src={preset.thumbnailUrl}
									alt={preset.title}
									className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy"
								/>
							) : (
								<div className="h-full w-full bg-purple-950/40" />
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-transparent to-transparent" />

							<div className="absolute top-3 left-3 flex items-center gap-2">
								<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md">
									🔥 Trending
								</span>
								<span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white">
									{preset.category}
								</span>
							</div>

							<div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
								<ArrowUpRight className="w-4 h-4" />
							</div>
						</div>

						<div className="p-4 space-y-2.5">
							<h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-interactive-primary)] transition-colors">
								{preset.title}
							</h3>

							<div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border-subtle)]/60">
								<div className="flex items-center gap-2">
									{preset.creator.avatarUrl ? (
										<img
											src={preset.creator.avatarUrl}
											alt={preset.creator.displayName}
											className="w-5 h-5 rounded-full object-cover"
										/>
									) : (
										<div className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold text-[10px] flex items-center justify-center">
											{preset.creator.displayName.slice(0, 2).toUpperCase()}
										</div>
									)}
									<span className="font-medium text-[var(--color-text-primary)] truncate max-w-[100px]">
										{preset.creator.displayName}
									</span>
								</div>

								<div className="flex items-center gap-3 text-xs font-semibold">
									<span className="flex items-center gap-1 text-rose-400">
										<Heart className="w-3.5 h-3.5 fill-rose-400/20" />
										{preset.likeCount}
									</span>
									<span className="flex items-center gap-1 text-emerald-400">
										<Download className="w-3.5 h-3.5" />
										{preset.downloadCount}
									</span>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
