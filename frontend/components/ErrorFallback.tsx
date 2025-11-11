'use client';

import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  message?: string;
}

/**
 * Komponen fallback yang dapat digunakan dengan ErrorBoundary
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorFallback error={error} resetErrorBoundary={reset} />}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Terjadi Kesalahan',
  message,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            {message || 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-2">
                Error Details (Development Only):
              </p>
              <pre className="text-xs text-red-700 overflow-auto max-h-64">
                {error.toString()}
              </pre>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={resetErrorBoundary} variant="primary">
              Coba Lagi
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              variant="outline"
            >
              Muat Ulang Halaman
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              variant="secondary"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Komponen untuk menampilkan error inline (tidak full page)
 */
export function InlineError({
  error,
  onRetry,
  title = 'Error',
  message,
}: {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  message?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">{title}</h3>
          <p className="text-sm text-red-700">
            {message || errorMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

