'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
  persistent?: boolean; // Jika true, tidak akan auto-dismiss
  onClose?: () => void;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 3000);

  useEffect(() => {
    if (toast.persistent) return;

    const duration = toast.duration || 3000;
    remainingTimeRef.current = duration;

    const updateProgress = () => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;

      setProgress(progressPercent);

      if (remaining <= 0) {
        onClose(toast.id);
      }
    };

    // Update progress setiap 50ms untuk smooth animation
    progressRef.current = setInterval(updateProgress, 50);

    // Auto close timer
    timerRef.current = setTimeout(() => {
      if (!isPaused) {
        onClose(toast.id);
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [toast.id, toast.duration, toast.persistent, isPaused, onClose]);

  const handleMouseEnter = () => {
    if (toast.persistent) return;
    setIsPaused(true);
    if (timerRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = (toast.duration || 3000) - elapsed;
    }
  };

  const handleMouseLeave = () => {
    if (toast.persistent) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const handleClose = () => {
    if (toast.onClose) {
      toast.onClose();
    }
    onClose(toast.id);
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
      progress: 'bg-green-500',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      progress: 'bg-red-500',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
      progress: 'bg-yellow-500',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      progress: 'bg-blue-500',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md',
        'animate-slide-in hover:shadow-xl transition-all duration-200',
        style.container
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Progress Bar */}
      {!toast.persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <div
            className={cn('h-full transition-all duration-75 ease-linear', style.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 pt-1">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', style.icon)}>
          {icons[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>
          )}
          <p className="text-sm font-medium break-words">{toast.message}</p>
          
          {/* Action Button */}
          {toast.action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={toast.action.variant || 'primary'}
                onClick={() => {
                  toast.action?.onClick();
                  handleClose();
                }}
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -mt-1 -mr-1"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?: ToastPosition;
  maxToasts?: number;
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ 
  toasts, 
  onClose, 
  position = 'top-right',
  maxToasts = 5 
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const displayedToasts = toasts.slice(0, maxToasts);

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        position === 'top-center' || position === 'bottom-center' 
          ? 'items-center' 
          : 'items-end',
        positionClasses[position]
      )}
    >
      {displayedToasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-slide-in"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
      {toasts.length > maxToasts && (
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-white dark:bg-gray-800 rounded border">
          +{toasts.length - maxToasts} more
        </div>
      )}
    </div>
  );
}

