'use client';

import { Suspense, ComponentType } from 'react';
import { SkeletonPage } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DynamicRouteLoaderProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Wrapper for dynamically loaded routes with error handling
 */
export function DynamicRouteLoader({
  component: Component,
  fallback = <SkeletonPage />,
  errorFallback,
}: DynamicRouteLoaderProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

