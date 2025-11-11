'use client';

import { Suspense, ReactNode } from 'react';
import { SkeletonPage } from '../ui/Skeleton';

interface LazyPageProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component for lazy loaded pages
 */
export function LazyPage({ children, fallback = <SkeletonPage /> }: LazyPageProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

