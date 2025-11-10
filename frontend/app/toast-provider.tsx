'use client';

import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/lib/store/toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

