import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { Skeleton } from "../../atoms/skeleton";
import { Spinner } from "../../atoms/spinner";
import { cn } from "../../lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
	icon: LucideIcon;
	value: number;
	label: string;
	delta?: number;
	deltaPeriod?: string;
	format?: "number" | "compact" | "percentage";
	isLoading?: boolean;
}

const formatValue = (
	value: number,
	format: StatCardProps["format"] = "number",
) => {
	if (format === "percentage") return `${value}%`;
	return new Intl.NumberFormat("en-US", {
		notation: format === "compact" ? "compact" : "standard",
	}).format(value);
};

const formatDelta = (delta: number) => {
	return `${delta > 0 ? "+" : ""}${delta}%`;
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
	(
		{
			icon: Icon,
			value,
			label,
			delta,
			deltaPeriod,
			format = "number",
			isLoading,
			className,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-card)]",
					className,
				)}
				{...props}
			>
				<div className="flex items-center gap-4">
					<Icon
						className="h-6 w-6 text-[var(--color-text-secondary)]"
						aria-hidden="true"
					/>
					{isLoading && <Spinner size="sm" />}
				</div>

				<div>
					<div className="text-[var(--font-size-display-md)] font-semibold tabular-nums text-[var(--color-text-primary)]">
						{isLoading ? (
							<Skeleton variant="text" width={100} height={32} />
						) : (
							formatValue(value, format)
						)}
					</div>
					<div className="text-[var(--font-size-label-sm)] text-[var(--color-text-secondary)]">
						{label}
					</div>
				</div>

				{!isLoading && delta !== undefined && (
					<div
						className={cn(
							"flex items-center gap-1 text-[var(--font-size-body-xs)]",
							delta >= 0
								? "text-[var(--color-text-success)]"
								: "text-[var(--color-text-error)]",
						)}
					>
						<span aria-hidden="true">{delta >= 0 ? "▲" : "▼"}</span>
						<span>
							{formatDelta(delta)} {deltaPeriod}
						</span>
					</div>
				)}
			</div>
		);
	},
);

StatCard.displayName = "StatCard";
