import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface FilterChipProps {
	label: string;
	icon?: LucideIcon;
	isActive: boolean;
	isDisabled?: boolean;
	onClick: () => void;
	count?: number;
}

export const FilterChip = ({
	label,
	icon: Icon,
	isActive,
	isDisabled,
	onClick,
	count,
}: FilterChipProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isDisabled}
			aria-pressed={isActive}
			className={cn(
				"inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-full)] border px-[var(--space-3)] py-[var(--space-1)] text-[var(--font-size-label-sm)] font-medium transition-colors",
				isActive
					? "border-[var(--color-border-accent)] bg-[var(--color-bg-accent)] text-[var(--color-text-accent)]"
					: "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]",
				isDisabled && "cursor-not-allowed opacity-50",
			)}
		>
			{Icon && <Icon size={14} />}
			{label}
			{count !== undefined && ` (${count})`}
		</button>
	);
};
