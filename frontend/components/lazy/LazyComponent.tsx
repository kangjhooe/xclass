'use client';

import { Suspense, ReactNode, ComponentType } from 'react';
import { SkeletonCard } from '../ui/Skeleton';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
}

/**
 * Wrapper component for lazy loaded components
 */
export function LazyComponent({ 
  children, 
  fallback = <SkeletonCard />,
  minHeight = '200px'
}: LazyComponentProps) {
  return (
    <Suspense 
      fallback={
        <div style={{ minHeight }}>
          {fallback}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

