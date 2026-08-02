import { type PresetCardPreset, PresetGrid } from "@presethub/ui";
import { Grid, Sparkles } from "lucide-react";

interface PresetCarouselProps {
	presets: PresetCardPreset[];
	title?: string;
}

export function PresetCarousel({
	presets,
	title = "Browse All Presets",
}: PresetCarouselProps) {
	return (
		<section className="space-y-4">
			{/* Section Header */}
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
						<Grid className="w-4 h-4" />
					</div>
					<h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						{title}
					</h2>
				</div>
				<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
					{presets.length} Presets
				</span>
			</div>

			{/* Presets Grid */}
			{presets.length > 0 ? (
				<PresetGrid
					presets={presets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			) : (
				<div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
					<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
						<Sparkles className="w-6 h-6" />
					</div>
					<h3 className="text-base font-bold text-[var(--color-text-primary)]">
						No Presets Found
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] max-w-xs">
						Try adjusting your search query or switching categories to discover
						Alight Motion presets.
					</p>
				</div>
			)}
		</section>
	);
}
