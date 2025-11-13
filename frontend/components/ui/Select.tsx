import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends Omit<React.ComponentPropsWithRef<'select'>, 'placeholder'> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, placeholder, children, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

