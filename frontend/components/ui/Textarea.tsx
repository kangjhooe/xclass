import * as React from "react"

import { cn } from "@/lib/utils/cn"

interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "children" | "className"> {
  className?: string
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId()
    const textareaId = id ?? autoId

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${textareaId}-helper`}
            className="mt-1 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

