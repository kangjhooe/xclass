'use client';

import { useState, useEffect, useRef } from 'react';

export interface UseLazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Hook for lazy loading elements using Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasLoaded)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              setHasLoaded(true);
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error };
}

