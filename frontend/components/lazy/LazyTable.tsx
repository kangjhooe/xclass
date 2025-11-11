'use client';

import { Suspense, ReactNode } from 'react';
import { SkeletonTable } from '../ui/Skeleton';

interface LazyTableProps {
  children: ReactNode;
  rows?: number;
  columns?: number;
}

/**
 * Lazy loaded table wrapper
 */
export function LazyTable({ 
  children, 
  rows = 10, 
  columns = 6 
}: LazyTableProps) {
  return (
    <Suspense fallback={<SkeletonTable rows={rows} columns={columns} />}>
      {children}
    </Suspense>
  );
}

