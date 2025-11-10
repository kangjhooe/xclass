import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface DividerProps {
  text?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ text, orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('inline-block h-full w-px bg-gray-200 mx-2', className)}
        role="separator"
      />
    );
  }

  if (text) {
    return (
      <div className={cn('relative flex items-center py-4', className)}>
        <div className="flex-grow border-t border-gray-200" />
        <span className="px-4 text-sm text-gray-500">{text}</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>
    );
  }

  return (
    <div
      className={cn('border-t border-gray-200', className)}
      role="separator"
    />
  );
}

