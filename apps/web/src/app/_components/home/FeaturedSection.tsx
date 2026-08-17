import { type PresetCardPreset, PresetCard } from "@presethub/ui";
import { Sparkles } from "lucide-react";

interface FeaturedSectionProps {
	presets: PresetCardPreset[];
}

export function FeaturedSection({ presets }: FeaturedSectionProps) {
	// Show top 3 featured items if available, or top 3 presets
	const featuredItems = presets.filter((p) => p.isFeatured).slice(0, 3);
	const displayItems =
		featuredItems.length > 0 ? featuredItems : presets.slice(0, 3);

	if (displayItems.length === 0) return null;

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
				<span className="font-display text-xs font-semibold tracking-wider text-amber-400">
					PRO SELECTIONS
				</span>
			</div>

			{/* Responsive Cards Grid using official PresetCard */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{displayItems.map((preset) => (
					<PresetCard key={preset.id} preset={preset} variant="featured" />
				))}
			</div>
		</section>
	);
}
