'use client';

import { useState, useEffect } from 'react';
import { useLazyLoad } from '@/lib/hooks/useLazyLoad';
import { OptimizedImage, OptimizedImageProps } from '@/components/ui/OptimizedImage';
import { generateBlurDataURL } from '@/lib/utils/imageOptimization';

interface LazyImageProps extends Omit<OptimizedImageProps, 'src' | 'alt' | 'placeholder'> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
}

/**
 * Lazy loaded optimized image component
 * Combines lazy loading with Next.js Image optimization
 */
export function LazyImage({
  src,
  placeholder,
  alt,
  className,
  fallback = '/placeholder-image.png',
  blurDataURL,
  ...props
}: LazyImageProps) {
  const { elementRef, isVisible } = useLazyLoad<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
  });
  const [imageSrc, setImageSrc] = useState(placeholder || fallback);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      setShouldLoad(true);
      setImageSrc(src);
    }
  }, [isVisible, src, shouldLoad]);

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(
    props.width || 10,
    props.height || 10
  );

  return (
    <div ref={elementRef} className={className}>
      {shouldLoad ? (
        <OptimizedImage
          src={imageSrc}
          alt={alt}
          blurDataURL={defaultBlurDataURL}
          placeholder="blur"
          onError={() => {
            if (imageSrc !== fallback) {
              setImageSrc(fallback);
            }
          }}
          {...props}
        />
      ) : (
        <OptimizedImage
          src={placeholder || fallback}
          alt={alt}
          blurDataURL={defaultBlurDataURL}
          placeholder="blur"
          {...props}
        />
      )}
    </div>
  );
}

