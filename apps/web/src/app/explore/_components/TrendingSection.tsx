import { PresetCard, type PresetCardPreset } from "@presethub/ui";
import { Flame, TrendingUp } from "lucide-react";
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

			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
				{trendingItems.map((preset) => (
					<PresetCard key={preset.id} preset={preset} variant="trending" />
				))}
			</div>
		</section>
	);
}
