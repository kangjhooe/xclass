'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from './Skeleton';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

/**
 * Optimized Image component using Next.js Image with additional features
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  className,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  fallback = '/placeholder-image.png',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }
    onError?.();
  };

  // If fill is true, width and height are not needed
  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {isLoading && (
          <Skeleton
            variant="rectangular"
            className="absolute inset-0"
            animation="pulse"
          />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn(
            'transition-opacity duration-300',
            isLoading && 'opacity-0',
            hasError && 'opacity-50',
            className
          )}
          style={{ objectFit, objectPosition }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  if (!width || !height) {
    // Fallback to regular img if dimensions not provided
    return (
      <div className={cn('relative inline-block', className)}>
        {isLoading && (
          <Skeleton
            variant="rectangular"
            width={width || '100%'}
            height={height || '200px'}
            className="absolute inset-0"
            animation="pulse"
          />
        )}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            isLoading && 'opacity-0',
            hasError && 'opacity-50',
            className
          )}
          style={{ objectFit, objectPosition }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          className="absolute inset-0"
          animation="pulse"
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          hasError && 'opacity-50',
          className
        )}
        style={{ objectFit, objectPosition }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

