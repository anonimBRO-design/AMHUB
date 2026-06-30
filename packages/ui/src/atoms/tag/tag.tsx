import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const tagVariants = cva(
	"inline-flex items-center justify-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] rounded-[var(--radius-full)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shadow-focus)]",
	{
		variants: {
			size: {
				sm: "px-2.5 py-0.5 text-[var(--font-size-label-sm)]",
				md: "px-3 py-1 text-[var(--font-size-label-md)]",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

const tagActiveVariants =
	"bg-[var(--color-bg-accent)] text-[var(--color-text-accent)] border-[var(--color-border-accent)]";
const tagHoverVariants =
	"hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] cursor-pointer";

export interface TagProps {
	label: string;
	isActive?: boolean;
	isRemovable?: boolean;
	onRemove?: () => void;
	onClick?: () => void;
	size?: "sm" | "md";
	className?: string;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
	(
		{
			label,
			isActive,
			isRemovable,
			onRemove,
			onClick,
			size,
			className,
			...props
		},
		ref,
	) => {
		// If it is removable, the tag is a container and the X is the button.
		// If it is not removable and clickable, the tag itself is the button.
		const isClickable = !!onClick && !isRemovable;
		const Component = isClickable ? "button" : "span";

		return (
			<Component
				ref={ref as React.Ref<HTMLButtonElement & HTMLSpanElement>}
				className={cn(
					tagVariants({ size }),
					isActive && tagActiveVariants,
					!isActive && !isRemovable && onClick && tagHoverVariants,
					className,
				)}
				aria-pressed={isActive}
				onClick={onClick}
				type={isClickable ? "button" : undefined}
				{...props}
			>
				{label}
				{isRemovable && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove?.();
						}}
						aria-label={`Remove tag: ${label}`}
						className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--color-bg-error)] hover:text-[var(--color-text-error)]"
					>
						×
					</button>
				)}
			</Component>
		);
	},
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
