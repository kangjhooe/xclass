import { useState, useCallback } from 'react';

export interface UseLoadingStateReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook untuk mengelola loading state
 * 
 * @example
 * ```tsx
 * const { isLoading, withLoading } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *   await withLoading(async () => {
 *     await api.create(data);
 *   });
 * };
 * ```
 */
export function useLoadingState(): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setIsLoading(true);
      return await asyncFn();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

