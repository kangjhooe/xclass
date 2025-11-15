'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createFocusTrap } from '@/lib/utils/accessibility';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const cleanup = createFocusTrap(contentRef.current);
      return cleanup;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative w-full max-h-[90vh] bg-white rounded-t-2xl shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col',
          'dark:bg-slate-800',
          className
        )}
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            {title && (
              <h2 id="bottom-sheet-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

