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
	columns?: { xs: 1; sm: 1; md: 2; lg: 3; xl: 4; "2xl": 5 };
	variant?: "masonry" | "equal";
	emptyState?: React.ReactNode;
}

export const PresetGrid = ({
	presets,
	isLoading,
	hasMore,
	onLoadMore,
	columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4, "2xl": 5 },
	variant = "masonry",
	emptyState,
}: PresetGridProps) => {
	return (
		<div
			role="feed"
			aria-label="Preset gallery"
			aria-busy={isLoading}
			className={cn(
				"grid gap-4",
				variant === "masonry" ? "items-start" : "items-stretch",
				columns.xs === 1 && "grid-cols-1",
				columns.sm === 1 && "sm:grid-cols-1",
				columns.md === 2 && "md:grid-cols-2",
				columns.lg === 3 && "lg:grid-cols-3",
				columns.xl === 4 && "xl:grid-cols-4",
				columns["2xl"] === 5 && "2xl:grid-cols-5",
			)}
		>
			{presets.map((preset) => (
				<PresetCard key={preset.id} preset={preset} />
			))}
			{isLoading &&
				Array.from({ length: columns.md }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Fixed length skeleton list
					<Skeleton key={`skeleton-${i}`} variant="card" />
				))}
		</div>
	);
};
