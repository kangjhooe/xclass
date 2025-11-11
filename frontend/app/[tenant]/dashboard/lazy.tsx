'use client';

/**
 * Lazy loaded dashboard components
 * This file exports components that should be lazy loaded
 */

import { lazy } from 'react';

// Lazy load heavy chart components
export const LazyLineChart = lazy(() => 
  import('@/components/ui/Charts').then(module => ({ default: module.LineChartComponent }))
);

export const LazyBarChart = lazy(() => 
  import('@/components/ui/Charts').then(module => ({ default: module.BarChartComponent }))
);

export const LazyPieChart = lazy(() => 
  import('@/components/ui/Charts').then(module => ({ default: module.PieChartComponent }))
);

// Lazy load analytics dashboard
export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard }))
);

