import type { PresetCardPreset } from "@presethub/ui";
import { ArrowUpRight, Download, Eye, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

interface FeaturedSectionProps {
	presets: PresetCardPreset[];
}

export function FeaturedSection({ presets }: FeaturedSectionProps) {
	// Show top 3 featured items if available
	const featuredItems = presets.slice(0, 3);

	if (featuredItems.length === 0) return null;

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
						<Sparkles className="w-4 h-4" />
					</div>
					<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						Featured Spotlight
					</h2>
				</div>
				<span className="font-display text-xs font-semibold tracking-wider text-[var(--color-interactive-primary)]">
					PRO SELECTIONS
				</span>
			</div>

			{/* Responsive Carousel / Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{featuredItems.map((preset) => (
					<Link
						key={preset.id}
						href={`/preset/${preset.slug}`}
						className="group relative overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-default)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]"
					>
						{/* Aspect Ratio Container */}
						<div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
							<img
								src={preset.thumbnailUrl}
								alt={preset.title}
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							{/* Gradient Overlay */}
							<div className="absolute inset-0 bg-[var(--color-bg-base)]/40" />

							{/* Format & Category Badges */}
							<div className="absolute top-3 left-3 flex items-center gap-2">
								<span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white border border-white/20">
									{preset.difficulty}
								</span>
								<span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white border border-white/10">
									{preset.category}
								</span>
							</div>

							{/* Top Right Action Icon */}
							<div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 border border-white/10">
								<ArrowUpRight className="w-4 h-4" />
							</div>
						</div>

						{/* Card Content */}
						<div className="p-4 space-y-3">
							<h3 className="font-display text-base font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-interactive-primary)] transition-colors">
								{preset.title}
							</h3>

							{/* Creator Info & Stats */}
							<div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border-subtle)]">
								<div className="flex items-center gap-2">
									<img
										src={
											preset.creator.avatarUrl ||
											`https://api.dicebear.com/7.x/identicon/svg?seed=${preset.creator.username}`
										}
										alt={preset.creator.displayName}
										className="w-5 h-5 rounded-full object-cover border border-white/10"
									/>
									<span className="font-body font-medium text-[var(--color-text-primary)] truncate max-w-[110px]">
										{preset.creator.displayName}
									</span>
								</div>

								<div className="flex items-center gap-3 text-xs font-semibold font-body">
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
