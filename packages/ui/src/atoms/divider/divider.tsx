import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const dividerVariants = cva("shrink-0 border-[var(--color-border-subtle)]", {
	variants: {
		variant: {
			horizontal: "w-full border-t",
			vertical: "h-full border-l",
			text: "w-full",
		},
		spacing: {
			sm: "my-2",
			md: "my-4",
			lg: "my-6",
		},
	},
	defaultVariants: {
		variant: "horizontal",
		spacing: "md",
	},
});

export interface DividerProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof dividerVariants> {
	label?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
	({ variant, label, spacing, className, ...props }, ref) => {
		if (variant === "text") {
			return (
				<div
					className={cn(
						"flex items-center",
						dividerVariants({ spacing, className }),
					)}
					ref={ref}
					{...props}
				>
					<hr className="flex-grow border-t border-[var(--color-border-subtle)]" />
					<span className="mx-2 text-[var(--font-size-body-xs)] text-[var(--color-text-tertiary)]">
						{label}
					</span>
					<hr className="flex-grow border-t border-[var(--color-border-subtle)]" />
				</div>
			);
		}

		return (
			<hr
				className={cn(dividerVariants({ variant, spacing, className }))}
				ref={ref as React.Ref<HTMLHRElement>}
				{...props}
			/>
		);
	},
);
Divider.displayName = "Divider";

export { Divider };
