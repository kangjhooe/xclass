'use client';

import { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { SkeletonPage, SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

/**
 * Lazy load component with Suspense wrapper
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): LazyExoticComponent<T> {
  return lazy(importFunc);
}

/**
 * Default fallback component for lazy loading
 */
export function DefaultLazyFallback() {
  return <SkeletonPage />;
}

/**
 * Table fallback for lazy loaded tables
 */
export function TableLazyFallback() {
  return (
    <div className="p-6">
      <SkeletonTable rows={10} columns={6} />
    </div>
  );
}

/**
 * Card fallback for lazy loaded cards
 */
export function CardLazyFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

/**
 * HOC to wrap lazy loaded component with Suspense
 */
export function withLazyLoad<T extends ComponentType<any>>(
  LazyComponent: LazyExoticComponent<T>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultLazyFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Create a lazy loaded component with automatic Suspense wrapper
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazyLoad(importFunc);
  return withLazyLoad(LazyComponent, fallback);
}

