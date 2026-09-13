import { formatCategory } from "@/lib/format-category";
import { type PresetCardPreset, PresetGrid } from "@presethub/ui";
import { Layers } from "lucide-react";

interface RelatedPresetsProps {
	presets: PresetCardPreset[];
	category?: string;
}

export function RelatedPresets({ presets, category }: RelatedPresetsProps) {
	if (!presets || presets.length === 0) return null;

	const formattedCat = formatCategory(category);

	return (
		<section className="space-y-4 pt-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
						<Layers className="w-4 h-4" />
					</div>
					<h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						More {formattedCat ? `${formattedCat} ` : ""}Presets
					</h2>
				</div>
			</div>

			<PresetGrid
				presets={presets}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</section>
	);
}
