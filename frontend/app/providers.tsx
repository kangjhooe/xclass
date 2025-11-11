'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/cache/reactQueryConfig';
import { ToastProvider } from './toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}

