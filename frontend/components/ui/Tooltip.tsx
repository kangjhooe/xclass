'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-popover border-t-border',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-popover border-b-border',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-popover border-l-border',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-popover border-r-border',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-popover-foreground bg-popover rounded-lg shadow-lg whitespace-nowrap border border-border',
            positions[position],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrows[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

