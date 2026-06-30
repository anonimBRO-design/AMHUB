import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeChipProps {
	badge: {
		key: string;
		name: string;
		description?: string;
		iconUrl?: string;
		rarity: "common" | "rare" | "epic" | "legendary";
	};
	earnedAt?: string;
	size?: "sm" | "md";
	showTooltip?: boolean;
}

export const BadgeChip = ({
	badge,
	earnedAt,
	size = "md",
	showTooltip = true,
}: BadgeChipProps) => {
	const isLegendary = badge.rarity === "legendary";

	return (
		<div
			className={cn(
				"inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-full)] border px-[var(--space-2)] py-[var(--space-1)] text-[var(--font-size-label-sm)] font-medium",
				badge.rarity === "common" &&
					"border-[var(--color-rarity-common)] bg-[var(--color-bg-surface)] text-[var(--color-rarity-common)]",
				badge.rarity === "rare" &&
					"border-[var(--color-rarity-rare)] bg-[var(--color-bg-surface)] text-[var(--color-rarity-rare)]",
				badge.rarity === "epic" &&
					"border-[var(--color-rarity-epic)] bg-[var(--color-bg-surface)] text-[var(--color-rarity-epic)]",
				isLegendary &&
					"border-[var(--color-rarity-legendary-start)] bg-[var(--color-bg-surface)] text-[var(--color-rarity-legendary-start)]",
				!earnedAt && "opacity-50 grayscale",
			)}
		>
			{isLegendary && "✦ "}
			{badge.name}
		</div>
	);
};
