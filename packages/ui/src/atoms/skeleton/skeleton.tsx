import * as React from "react";
import { cn } from "../../lib/utils";
import type { RadiusToken } from "../../tokens";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant: "text" | "avatar" | "card" | "thumbnail" | "custom";
	width?: string | number;
	height?: string | number;
	rounded?: RadiusToken;
	lines?: number;
	lastLineWidth?: string;
}

const RADIUS_MAP: Record<RadiusToken, string> = {
	none: "rounded-none",
	xs: "rounded-xs",
	sm: "rounded-sm",
	md: "rounded-md",
	lg: "rounded-lg",
	xl: "rounded-xl",
	"2xl": "rounded-2xl",
	full: "rounded-full",
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	(
		{
			className,
			variant,
			width,
			height,
			rounded,
			lines,
			lastLineWidth,
			style,
			...props
		},
		ref,
	) => {
		const baseClasses = "animate-pulse bg-[var(--color-bg-elevated)]";
		const lineIds = React.useMemo(
			() => Array.from({ length: lines || 1 }, () => crypto.randomUUID()),
			[lines],
		);

		if (variant === "text") {
			return (
				<div
					className={cn("flex flex-col gap-2", className)}
					ref={ref}
					{...props}
				>
					{lineIds.map((id, i) => (
						<div
							key={id}
							className={cn(
								baseClasses,
								"h-4 w-full rounded-[var(--radius-sm)]",
								i === (lines || 1) - 1 &&
									lastLineWidth &&
									"w-[var(--last-line-width)]",
							)}
							style={
								{
									height,
									"--last-line-width":
										i === (lines || 1) - 1 && lastLineWidth
											? lastLineWidth
											: "100%",
								} as React.CSSProperties
							}
						/>
					))}
				</div>
			);
		}

		const variantClasses = cn(
			baseClasses,
			variant === "avatar" && "rounded-full aspect-square",
			variant === "thumbnail" && "rounded-lg aspect-[4/3]",
			variant === "card" && "rounded-lg aspect-auto min-h-[200px]",
			rounded && RADIUS_MAP[rounded],
			className,
		);

		return (
			<div
				ref={ref}
				aria-hidden="true"
				className={variantClasses}
				style={{ width, height, ...style }}
				{...props}
			/>
		);
	},
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
