'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/cache/reactQueryConfig';
import { ToastProvider } from './toast-provider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { registerServiceWorker } from '@/lib/utils/serviceWorker';
import { initGA } from '@/lib/analytics/ga';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker in production
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }

    // Initialize Google Analytics
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

