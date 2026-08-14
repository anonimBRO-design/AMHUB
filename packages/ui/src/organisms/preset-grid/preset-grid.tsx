import type * as React from "react";
import { Skeleton } from "../../atoms/skeleton/skeleton";
import { cn } from "../../lib/utils";
import {
	PresetCard,
	type PresetCardPreset,
} from "../../molecules/preset-card/preset-card";

export interface PresetGridProps {
	presets: PresetCardPreset[];
	isLoading: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; "2xl"?: number };
	variant?: "masonry" | "equal";
	emptyState?: React.ReactNode;
}

export const PresetGrid = ({
	presets,
	isLoading,
	hasMore,
	onLoadMore,
	columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 3, "2xl": 4 },
	variant = "masonry",
	emptyState,
}: PresetGridProps) => {
	return (
		<div
			role="feed"
			aria-label="Preset gallery"
			aria-busy={isLoading}
			className={cn(
				"grid gap-4 w-full max-w-full overflow-hidden",
				variant === "masonry" ? "items-start" : "items-stretch",
				"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
			)}
		>
			{presets.map((preset) => (
				<PresetCard key={preset.id} preset={preset} />
			))}
			{isLoading &&
				Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Fixed length skeleton list
					<Skeleton key={`skeleton-${i}`} variant="card" />
				))}
		</div>
	);
};
