import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps
  extends Omit<React.ComponentProps<"input">, "children" | "className"> {
  className?: string
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      id,
      required,
      type,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId()
    const inputId = id ?? autoId

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
