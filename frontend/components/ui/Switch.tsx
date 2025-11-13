'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Switch({ label, description, className, ...props }: SwitchProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <div className="text-sm font-medium text-foreground">{label}</div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
        )}
      </label>
    </div>
  );
}

