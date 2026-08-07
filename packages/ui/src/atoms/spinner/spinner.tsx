import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const spinnerVariants = cva("inline-block", {
	variants: {
		size: {
			sm: "h-4 w-4",
			md: "h-6 w-6",
			lg: "h-8 w-8",
		},
		variant: {
			ring: "animate-spin rounded-full border-2 border-t-transparent",
			dots: "flex items-center justify-center gap-1",
		},
	},
	defaultVariants: {
		size: "md",
		variant: "ring",
	},
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
	label?: string;
	color?: "accent" | "white" | "current";
	className?: string;
}

const colorVariants = {
	accent: "border-[var(--color-interactive-primary)]",
	white: "border-white",
	current: "border-current",
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
	(
		{ size, variant, color = "accent", label = "Loading", className, ...props },
		ref,
	) => {
		if (variant === "dots") {
			return (
				<output
					aria-label={label}
					className={cn(spinnerVariants({ size, variant }), className)}
					{...props}
				>
					<div
						className={cn(
							"h-full w-full rounded-full bg-current animate-pulse",
							color === "accent"
								? "bg-[var(--color-interactive-primary)]"
								: color === "white"
									? "bg-white"
									: "bg-current",
						)}
						style={{ animationDelay: "-0.3s" }}
					/>
					<div
						className={cn(
							"h-full w-full rounded-full bg-current animate-pulse",
							color === "accent"
								? "bg-[var(--color-interactive-primary)]"
								: color === "white"
									? "bg-white"
									: "bg-current",
						)}
						style={{ animationDelay: "-0.15s" }}
					/>
					<div
						className={cn(
							"h-full w-full rounded-full bg-current animate-pulse",
							color === "accent"
								? "bg-[var(--color-interactive-primary)]"
								: color === "white"
									? "bg-white"
									: "bg-current",
						)}
					/>
				</output>
			);
		}
		return (
			<div
				ref={ref}
				role="status"
				aria-label={label}
				className={cn(
					spinnerVariants({ size, variant }),
					colorVariants[color],
					className,
				)}
				style={{ animationDuration: "var(--dur-loop-fast)" }}
				{...props}
			/>
		);
	},
);
Spinner.displayName = "Spinner";

export { Spinner };
