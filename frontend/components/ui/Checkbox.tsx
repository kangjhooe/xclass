'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'peer sr-only',
              className
            )}
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 border-2 rounded transition-all duration-200',
              'peer-checked:bg-blue-600 peer-checked:border-blue-600',
              'peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              'group-hover:border-blue-400',
              props.disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
                : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600',
              indeterminate && 'bg-blue-600 border-blue-600'
            )}
          >
            {indeterminate ? (
              <svg
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
              </svg>
            ) : (
              <svg
                className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <span
            className={cn(
              'text-sm font-medium',
              props.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

