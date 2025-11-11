'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseCodeSplitOptions {
  preload?: boolean;
  retries?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for code splitting with loading and error states
 */
export function useCodeSplit<T>(
  importFunc: () => Promise<{ default: T }>,
  options: UseCodeSplitOptions = {}
) {
  const { preload = false, retries = 3, onLoad, onError } = options;
  const [component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!preload);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const module = await importFunc();
        setComponent(module.default);
        setIsLoading(false);
        onLoad?.();
        return;
      } catch (err) {
        lastError = err as Error;
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    setError(lastError);
    setIsLoading(false);
    onError?.(lastError!);
  }, [importFunc, retries, onLoad, onError]);

  useEffect(() => {
    if (preload) {
      load();
    }
  }, [preload, load]);

  return {
    component,
    isLoading,
    error,
    load,
    reload: load,
  };
}

/**
 * Hook for preloading modules
 */
export function usePreload(importFunc: () => Promise<any>, deps: any[] = []) {
  useEffect(() => {
    // Preload on mount or when deps change
    importFunc().catch((error) => {
      console.error('Preload failed:', error);
    });
  }, deps);
}

