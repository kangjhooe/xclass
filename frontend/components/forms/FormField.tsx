'use client';

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' | 'textarea' | 'select';
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  options?: { value: string | number; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showError?: boolean;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      value,
      onChange,
      onBlur,
      error,
      required,
      placeholder,
      disabled,
      className,
      helpText,
      options,
      rows = 4,
      min,
      max,
      step,
      prefix,
      suffix,
      showError = true,
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
      onChange?.(newValue);
    };

    const renderInput = () => {
      const commonProps = {
        id: name,
        name,
        value: value ?? '',
        onChange: handleChange,
        onBlur,
        disabled,
        placeholder,
        className: cn(error && 'border-red-500 focus:border-red-500 focus:ring-red-500', className),
      };

      if (type === 'textarea') {
        return (
          <Textarea
            {...commonProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );
      }

      if (type === 'select') {
        return (
          <Select
            {...commonProps}
            ref={ref as React.Ref<HTMLSelectElement>}
          >
            {!required && <option value="">Pilih {label}</option>}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      }

      return (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {prefix}
            </div>
          )}
          <Input
            {...commonProps}
            type={type}
            min={min}
            max={max}
            step={step}
            className={cn(prefix && 'pl-10', suffix && 'pr-10', commonProps.className)}
            ref={ref as React.Ref<HTMLInputElement>}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {suffix}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium',
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {renderInput()}

        {showError && error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

