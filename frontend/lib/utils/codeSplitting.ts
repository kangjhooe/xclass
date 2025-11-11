/**
 * Code splitting utilities and helpers
 */

import type { ComponentType } from 'react';

/**
 * Dynamic import with error handling
 */
export async function dynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  try {
    const module = await importFunc();
    return module.default;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Preload module for faster subsequent loads
 */
export function preloadModule(importFunc: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    importFunc().catch((error) => {
      console.error('Preload failed:', error);
    });
  }
}

/**
 * Create a dynamic route loader
 */
export function createRouteLoader<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) {
  return {
    default: async () => {
      const Component = await importFunc();
      return Component.default;
    },
    loading: loadingComponent,
  };
}

/**
 * Split large modules into smaller chunks
 */
export function splitModule<T>(
  modules: Record<string, () => Promise<T>>,
  chunkSize: number = 5
): Record<string, () => Promise<T>> {
  const chunks: Record<string, () => Promise<T>> = {};
  const moduleKeys = Object.keys(modules);
  
  for (let i = 0; i < moduleKeys.length; i += chunkSize) {
    const chunk = moduleKeys.slice(i, i + chunkSize);
    const chunkName = `chunk-${Math.floor(i / chunkSize)}`;
    
    chunks[chunkName] = async () => {
      const loadedModules: Record<string, T> = {};
      await Promise.all(
        chunk.map(async (key) => {
          const module = await modules[key]();
          loadedModules[key] = module;
        })
      );
      return loadedModules as T;
    };
  }
  
  return chunks;
}

/**
 * Lazy load with retry mechanism
 */
export function lazyLoadWithRetry<T>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3
): () => Promise<{ default: T }> {
  return async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Failed to load module after retries');
  };
}

/**
 * Get chunk name for a module
 */
export function getChunkName(modulePath: string): string {
  // Extract meaningful name from path
  const parts = modulePath.split('/');
  const fileName = parts[parts.length - 1]?.replace(/\.(tsx?|jsx?)$/, '') || 'module';
  return fileName.replace(/[^a-zA-Z0-9]/g, '-');
}

/**
 * Monitor chunk loading performance
 */
export function monitorChunkLoad(chunkName: string): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    if (loadTime > 1000) {
      console.warn(`Slow chunk load: ${chunkName} took ${loadTime.toFixed(2)}ms`);
    } else {
      console.log(`Chunk loaded: ${chunkName} in ${loadTime.toFixed(2)}ms`);
    }
  };
}

