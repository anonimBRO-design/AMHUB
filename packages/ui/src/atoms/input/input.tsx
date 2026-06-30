import { type VariantProps, cva } from "class-variance-authority";
import { type LucideIcon, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const inputVariants = cva(
	"flex h-[var(--space-5)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 py-2 text-[var(--font-size-body-md)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "",
				search: "pl-10",
				password: "pr-10",
				prefix: "pl-3",
				suffix: "pr-3",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface InputProps
	extends Omit<
			React.InputHTMLAttributes<HTMLInputElement>,
			"value" | "onChange"
		>,
		VariantProps<typeof inputVariants> {
	label?: string;
	hint?: string;
	error?: string;
	leadingIcon?: LucideIcon;
	trailingIcon?: LucideIcon;
	prefix?: string;
	suffix?: string;
	isDisabled?: boolean;
	isReadOnly?: boolean;
	isRequired?: boolean;
	showCount?: boolean;
	value: string;
	onChange: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			variant,
			label,
			hint,
			error,
			leadingIcon: LeadingIcon,
			trailingIcon: TrailingIcon,
			prefix,
			suffix,
			isDisabled,
			isReadOnly,
			isRequired,
			maxLength,
			showCount,
			type = "text",
			value,
			onChange,
			placeholder,
			id,
			...props
		},
		ref,
	) => {
		const inputId = id || React.useId();
		const errorId = `${inputId}-error`;
		const hintId = `${inputId}-hint`;

		const isError = !!error;

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		};

		const showClearButton = type === "search" && value.length > 0;

		return (
			<div className="flex w-full flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-[var(--font-size-label-md)] font-medium text-[var(--color-text-secondary)]"
					>
						{label}
						{isRequired && (
							<span className="text-[var(--color-text-error)] ml-1">*</span>
						)}
					</label>
				)}
				<div className="relative flex items-center">
					{LeadingIcon && (
						<div className="absolute left-3 text-[var(--color-text-tertiary)]">
							<LeadingIcon className="h-4 w-4" />
						</div>
					)}
					{type === "search" && (
						<div className="absolute left-3 text-[var(--color-text-tertiary)]">
							<Search className="h-4 w-4" />
						</div>
					)}
					{prefix && (
						<span className="absolute left-3 text-[var(--color-text-tertiary)]">
							{prefix}
						</span>
					)}
					<input
						id={inputId}
						type={type}
						className={cn(
							inputVariants({ variant, className }),
							isError &&
								"border-[var(--color-border-error)] ring-[var(--shadow-focus-error)]",
							(LeadingIcon || type === "search" || prefix) && "pl-10",
						)}
						ref={ref}
						disabled={isDisabled}
						readOnly={isReadOnly}
						required={isRequired}
						maxLength={maxLength}
						value={value}
						onChange={handleChange}
						placeholder={placeholder}
						aria-invalid={isError}
						aria-describedby={cn(hint && hintId, isError && errorId)}
						{...props}
					/>
					{showClearButton && (
						<button
							type="button"
							className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
							onClick={() => onChange("")}
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
					{TrailingIcon && !showClearButton && (
						<div className="absolute right-3 text-[var(--color-text-tertiary)]">
							<TrailingIcon className="h-4 w-4" />
						</div>
					)}
					{suffix && (
						<span className="absolute right-3 text-[var(--color-text-tertiary)]">
							{suffix}
						</span>
					)}
				</div>
				<div className="flex justify-between gap-2">
					{(hint || error) && (
						<p
							id={isError ? errorId : hintId}
							className={cn(
								"text-[var(--font-size-body-xs)]",
								isError
									? "text-[var(--color-text-error)]"
									: "text-[var(--color-text-secondary)]",
							)}
						>
							{error || hint}
						</p>
					)}
					{showCount && maxLength && (
						<span className="text-[var(--font-size-body-xs)] text-[var(--color-text-secondary)]">
							{value.length}/{maxLength}
						</span>
					)}
				</div>
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input, inputVariants };
