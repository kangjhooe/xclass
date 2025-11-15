'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initGA, trackPageView, trackEvent, trackRegistration, trackLogin, trackCTAClick, trackFormSubmit } from './ga';

/**
 * Hook to initialize analytics and track page views
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize GA on mount
    initGA();
  }, []);

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      const fullPath = searchParams ? `${pathname}?${searchParams.toString()}` : pathname;
      trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  return {
    trackEvent,
    trackRegistration,
    trackLogin,
    trackCTAClick,
    trackFormSubmit,
  };
}

