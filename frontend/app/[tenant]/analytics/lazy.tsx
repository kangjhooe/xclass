'use client';

/**
 * Lazy loaded analytics components
 */

import { lazy } from 'react';

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard }))
);

export const LazyAnalyticsWidget = lazy(() => 
  import('@/components/analytics/AnalyticsWidget').then(module => ({ default: module.AnalyticsWidget }))
);

