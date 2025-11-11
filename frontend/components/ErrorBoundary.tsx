'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Menangkap error JavaScript di mana saja di pohon komponen anak,
 * mencatat error tersebut, dan menampilkan UI fallback.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error ke console atau error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler jika ada
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Jika ada custom fallback, gunakan itu
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
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
                Terjadi Kesalahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    Error Details (Development Only):
                  </p>
                  <pre className="text-xs text-red-700 overflow-auto max-h-64">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2 pt-2 border-t border-red-300">
                        <p className="font-semibold mb-1">Component Stack:</p>
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={this.handleReset} variant="primary">
                  Coba Lagi
                </Button>
                <Button onClick={this.handleReload} variant="outline">
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

    return this.props.children;
  }
}

/**
 * Hook untuk menangani error dengan lebih mudah
 * 
 * @example
 * ```tsx
 * const { error, resetError } = useErrorHandler();
 * 
 * if (error) {
 *   return <ErrorDisplay error={error} onReset={resetError} />;
 * }
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason?.toString() || 'Unknown error'));
    };

    const handleErrorEvent = (event: ErrorEvent) => {
      handleError(new Error(event.message || 'Unknown error'));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleErrorEvent);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleErrorEvent);
    };
  }, [handleError]);

  return {
    error,
    resetError,
    handleError,
  };
}

/**
 * Higher-Order Component untuk wrap komponen dengan ErrorBoundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

