import { type VariantProps, cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center font-medium",
	{
		variants: {
			variant: {
				category: "bg-opacity-[0.15] rounded-[var(--radius-full)]",
				difficulty: "rounded-[var(--radius-md)]",
				status: "rounded-[var(--radius-md)]",
				rarity: "rounded-[var(--radius-md)]",
				count:
					"bg-transparent text-[var(--color-text-secondary)] rounded-[var(--radius-full)]",
				new: "bg-[var(--color-bg-accent)] text-[var(--color-text-accent)] rounded-[var(--radius-full)]",
			},
			size: {
				sm: "px-2 py-0.5 text-[var(--font-size-label-sm)]",
				md: "px-3 py-1 text-[var(--font-size-label-md)]",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

export interface BadgeProps {
	variant: "category" | "difficulty" | "status" | "rarity" | "count" | "new";
	value: string | number;
	size?: "sm" | "md";
	icon?: LucideIcon;
}

const styleMap: Record<string, Record<string, string>> = {
	category: {
		velocity:
			"bg-[var(--color-category-velocity)] text-[var(--color-category-velocity)] bg-opacity-[0.15]",
		transition:
			"bg-[var(--color-category-transition)] text-[var(--color-category-transition)] bg-opacity-[0.15]",
		color:
			"bg-[var(--color-category-color)] text-[var(--color-category-color)] bg-opacity-[0.15]",
		anime:
			"bg-[var(--color-category-anime)] text-[var(--color-category-anime)] bg-opacity-[0.15]",
		gaming:
			"bg-[var(--color-category-gaming)] text-[var(--color-category-gaming)] bg-opacity-[0.15]",
		lyric:
			"bg-[var(--color-category-lyric)] text-[var(--color-category-lyric)] bg-opacity-[0.15]",
		"3d": "bg-[var(--color-category-3d)] text-[var(--color-category-3d)] bg-opacity-[0.15]",
		other:
			"bg-[var(--color-category-other)] text-[var(--color-category-other)] bg-opacity-[0.15]",
	},
	rarity: {
		common:
			"bg-[var(--color-rarity-common)] text-[var(--color-rarity-common)] bg-opacity-[0.15]",
		rare: "bg-[var(--color-rarity-rare)] text-[var(--color-rarity-rare)] bg-opacity-[0.15]",
		epic: "bg-[var(--color-rarity-epic)] text-[var(--color-rarity-epic)] bg-opacity-[0.15]",
		legendary: "bg-[var(--gradient-legendary)] text-white",
	},
	difficulty: {
		beginner: "bg-[var(--color-bg-success)] text-[var(--color-text-success)]",
		intermediate:
			"bg-[var(--color-bg-warning)] text-[var(--color-text-warning)]",
		advanced: "bg-[var(--color-bg-error)] text-[var(--color-text-error)]",
	},
	status: {
		published: "bg-[var(--color-bg-success)] text-[var(--color-text-success)]",
		pending: "bg-[var(--color-bg-warning)] text-[var(--color-text-warning)]",
		rejected: "bg-[var(--color-bg-error)] text-[var(--color-text-error)]",
		removed: "bg-[var(--color-bg-error)] text-[var(--color-text-error)]",
	},
};

export const Badge = ({ variant, value, size, icon: Icon }: BadgeProps) => {
	const val = String(value).toLowerCase();
	const variantStyles = styleMap[variant]?.[val] || "";

	return (
		<span className={cn(badgeVariants({ variant, size }), variantStyles)}>
			{Icon && <Icon className="mr-1 h-3 w-3" />}
			{value}
		</span>
	);
};
