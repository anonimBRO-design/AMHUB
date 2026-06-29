import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../../lib/utils"
import { LucideIcon } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--font-size-label-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shadow-focus)] disabled:opacity-40 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-interactive-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-primary-hover)] active:bg-[var(--color-interactive-primary-active)]",
        secondary: "bg-[var(--color-interactive-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-secondary-hover)]",
        outline: "border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
        ghost: "hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
        destructive: "bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-danger-hover)]",
        link: "text-[var(--color-text-accent)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-[var(--space-4)] px-[var(--space-3)] py-[var(--space-1_5)] text-[var(--font-size-label-sm)]",
        md: "h-[var(--space-5)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--font-size-label-md)]",
        lg: "h-[var(--space-6)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-label-lg)]",
        icon: "h-[var(--space-5)] w-[var(--space-5)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, isDisabled, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {!isLoading && LeadingIcon && <LeadingIcon className="mr-2 h-4 w-4" />}
        {children}
        {!isLoading && TrailingIcon && <TrailingIcon className="ml-2 h-4 w-4" />}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
