import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--font-size-label-md)] font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shadow-focus)] disabled:opacity-40 disabled:pointer-events-none ring-offset-background select-none",
	{
		variants: {
			variant: {
				default:
					"bg-[var(--color-interactive-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-primary-hover)] active:bg-[var(--color-interactive-primary-active)] border border-transparent",
				secondary:
					"bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]",
				outline:
					"border border-[var(--color-border-default)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]",
				ghost:
					"border border-transparent hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]",
				destructive:
					"bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-danger-hover)]",
				link: "text-[var(--color-text-accent)] underline-offset-4 hover:underline",
			},
			size: {
				sm: "min-h-[36px] px-3 py-1.5 text-[var(--font-size-label-sm)] rounded-[var(--radius-sm)]",
				md: "min-h-[44px] px-4 py-2 text-[var(--font-size-label-md)] rounded-[var(--radius-md)]",
				lg: "min-h-[48px] px-6 py-3 text-[var(--font-size-label-lg)] rounded-[var(--radius-lg)]",
				icon: "min-h-[40px] min-w-[40px] p-2 rounded-[var(--radius-md)]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
	isDisabled?: boolean;
	leadingIcon?: LucideIcon;
	trailingIcon?: LucideIcon;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			isLoading,
			isDisabled,
			leadingIcon: LeadingIcon,
			trailingIcon: TrailingIcon,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={isDisabled || isLoading}
				aria-busy={isLoading}
				{...props}
			>
				{isLoading && (
					<svg
						className="mr-2 h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						role="img"
						aria-label="Loading"
					>
						<title>Loading</title>
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
				)}

				{!isLoading && LeadingIcon && <LeadingIcon className="mr-2 h-4 w-4" />}
				{children}
				{!isLoading && TrailingIcon && (
					<TrailingIcon className="ml-2 h-4 w-4" />
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
