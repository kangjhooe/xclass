'use client';

/**
 * Lazy loaded report builder components
 */

import { lazy } from 'react';

export const LazyReportBuilder = lazy(() => 
  import('@/components/report-builder/ReportBuilder').then(module => ({ default: module.ReportBuilder }))
);

