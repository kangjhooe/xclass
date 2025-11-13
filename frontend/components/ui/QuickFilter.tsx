'use client';

import { useState, useCallback } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

export interface QuickFilterOption {
  key: string;
  label: string;
  value: string | number | boolean;
  count?: number;
  icon?: React.ReactNode;
}

export interface QuickFilterProps {
  options: QuickFilterOption[];
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  label?: string;
  showAll?: boolean;
  allLabel?: string;
  className?: string;
  variant?: 'tabs' | 'buttons' | 'chips';
}

export function QuickFilter({
  options,
  value,
  onChange,
  label,
  showAll = true,
  allLabel = 'Semua',
  className,
  variant = 'buttons',
}: QuickFilterProps) {
  const handleChange = useCallback((newValue: string | number | boolean) => {
    onChange(newValue);
  }, [onChange]);

  if (variant === 'tabs') {
    return (
      <div className={cn('border-b border-border', className)}>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {showAll && (
            <button
              onClick={() => handleChange('all')}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                (value === 'all' || value === undefined)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {allLabel}
            </button>
          )}
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => handleChange(option.value)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
                value === option.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {option.icon}
              {option.label}
              {option.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 py-0.5 px-2 rounded-full text-xs font-semibold',
                    value === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {showAll && (
          <button
            onClick={() => handleChange('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              (value === 'all' || value === undefined)
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {allLabel}
          </button>
        )}
        {options.map((option) => (
          <button
            key={String(option.value)}
            onClick={() => handleChange(option.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              value === option.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                  value === option.value
                    ? 'bg-primary/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default: buttons variant
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {showAll && (
          <Button
            variant={value === 'all' || value === undefined ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleChange('all')}
          >
            {allLabel}
          </Button>
        )}
        {options.map((option) => (
          <Button
            key={String(option.value)}
            variant={value === option.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleChange(option.value)}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                {option.count}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

