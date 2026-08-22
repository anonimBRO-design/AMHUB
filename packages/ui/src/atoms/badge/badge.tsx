import { type VariantProps, cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center font-bold rounded-full transition-colors",
	{
		variants: {
			variant: {
				category: "bg-[var(--color-interactive-primary)] text-white shadow-sm",
				difficulty:
					"bg-white/10 backdrop-blur-md text-white border border-white/15 shadow-sm capitalize",
				fileType:
					"bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-sm uppercase tracking-wider font-extrabold",
				status: "rounded-[var(--radius-md)] font-medium",
				rarity: "rounded-[var(--radius-md)] font-medium",
				count:
					"bg-transparent text-[var(--color-text-secondary)] rounded-[var(--radius-full)] font-medium",
				new: "bg-[var(--color-bg-accent)] text-[var(--color-text-accent)] rounded-[var(--radius-full)]",
			},
			size: {
				sm: "px-2 py-0.5 text-[10px]",
				md: "px-3 py-1 text-xs",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

export interface BadgeProps {
	variant:
		| "category"
		| "difficulty"
		| "status"
		| "rarity"
		| "count"
		| "new"
		| "fileType";
	value: string | number;
	size?: "sm" | "md";
	icon?: LucideIcon;
	className?: string;
}

const styleMap: Record<string, Record<string, string>> = {
	category: {
		"jj-tipis": "bg-rose-500 text-white shadow-sm",
		"jj tipis": "bg-rose-500 text-white shadow-sm",
		"jj-melar": "bg-amber-500 text-white shadow-sm",
		"jj melar": "bg-amber-500 text-white shadow-sm",
		"jj-belah": "bg-purple-500 text-white shadow-sm",
		"jj belah": "bg-purple-500 text-white shadow-sm",
		jj: "bg-rose-500 text-white shadow-sm",
		velocity: "bg-[var(--color-category-velocity)] text-white shadow-sm",
		transition: "bg-[var(--color-category-transition)] text-white shadow-sm",
		color: "bg-[var(--color-category-color)] text-white shadow-sm",
		"jj-abstract": "bg-indigo-500 text-white shadow-sm",
		"jj abstract": "bg-indigo-500 text-white shadow-sm",
		"jj-db": "bg-blue-600 text-white shadow-sm",
		"jj db": "bg-blue-600 text-white shadow-sm",
		"jj-mekdi": "bg-red-500 text-white shadow-sm",
		"jj mekdi": "bg-red-500 text-white shadow-sm",
		"jj-kenyal": "bg-pink-500 text-white shadow-sm",
		"jj kenyal": "bg-pink-500 text-white shadow-sm",
		anime: "bg-[var(--color-category-anime)] text-white shadow-sm",
		gaming: "bg-[var(--color-category-gaming)] text-white shadow-sm",
		lyric: "bg-[var(--color-category-lyric)] text-white shadow-sm",
		"3d": "bg-[var(--color-category-3d)] text-white shadow-sm",
		slowmo: "bg-emerald-500 text-white shadow-sm",
		other: "bg-[var(--color-category-other)] text-white shadow-sm",
	},
	rarity: {
		common: "bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-500/30",
		rare: "bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30",
		epic: "bg-purple-500/20 text-purple-900 dark:text-purple-300 border border-purple-500/30",
		legendary:
			"bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/30 font-extrabold",
	},
	difficulty: {
		beginner: "bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30",
		intermediate: "bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/30",
		advanced: "bg-rose-500/20 text-rose-900 dark:text-rose-300 border border-rose-500/30",
	},
	status: {
		published:
			"bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30",
		pending: "bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/30",
		rejected: "bg-rose-500/20 text-rose-900 dark:text-rose-300 border border-rose-500/30",
		removed: "bg-rose-500/20 text-rose-900 dark:text-rose-300 border border-rose-500/30",
	},
};

export const Badge = ({
	variant,
	value,
	size = "sm",
	icon: Icon,
	className,
}: BadgeProps) => {
	const val = String(value).toLowerCase();
	const variantStyles = styleMap[variant]?.[val] || "";

	return (
		<span
			className={cn(badgeVariants({ variant, size }), variantStyles, className)}
		>
			{Icon && <Icon className="mr-1 h-3 w-3" />}
			{value}
		</span>
	);
};
