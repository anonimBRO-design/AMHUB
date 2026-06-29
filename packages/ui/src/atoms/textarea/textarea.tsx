import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../../lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 py-2 text-[var(--font-size-body-md)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      resize: "vertical",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">,
    VariantProps<typeof textareaVariants> {
  label?: string
  hint?: string
  error?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  showCount?: boolean
  value: string
  onChange: (value: string) => void
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      resize,
      label,
      hint,
      error,
      isDisabled,
      isReadOnly,
      isRequired,
      maxLength,
      showCount,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId()
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    
    const isError = !!error
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    }

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[var(--font-size-label-md)] font-medium text-[var(--color-text-secondary)]">
            {label}
            {isRequired && <span className="text-[var(--color-text-error)] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ resize, className }),
            isError && "border-[var(--color-border-error)] ring-[var(--shadow-focus-error)]"
          )}
          ref={ref}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={isError}
          aria-describedby={cn(hint && hintId, isError && errorId)}
          {...props}
        />
        <div className="flex justify-between gap-2">
          {(hint || error) && (
            <p
              id={isError ? errorId : hintId}
              className={cn(
                "text-[var(--font-size-body-xs)]",
                isError ? "text-[var(--color-text-error)]" : "text-[var(--color-text-secondary)]"
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
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
