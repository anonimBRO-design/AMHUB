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
	isOwnProfile?: boolean;
	currentUserId?: string;
	onDeletePreset?: (presetId: string) => Promise<void> | void;
}

export const PresetGrid = ({
	presets,
	isLoading,
	hasMore,
	onLoadMore,
	columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 3, "2xl": 4 },
	variant = "masonry",
	emptyState,
	isOwnProfile = false,
	currentUserId,
	onDeletePreset,
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
			{presets.map((preset) => {
				const isOwner =
					isOwnProfile ||
					Boolean(
						currentUserId &&
							preset.creator?.id &&
							currentUserId === preset.creator.id,
					);
				return (
					<PresetCard
						key={preset.id}
						preset={preset}
						isOwner={isOwner}
						onDelete={onDeletePreset}
					/>
				);
			})}
			{isLoading &&
				Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Fixed length skeleton list
					<Skeleton key={`skeleton-${i}`} variant="card" />
				))}
		</div>
	);
};
