/**
 * Image optimization utilities
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Generate optimized image URL (for external image services)
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  // If using Next.js Image Optimization API
  if (src.startsWith('/') || src.startsWith('http://localhost') || src.includes('your-domain.com')) {
    // Next.js will handle optimization automatically
    return src;
  }

  // For external images, you might want to use a service like:
  // - Cloudinary
  // - Imgix
  // - ImageKit
  // - Your own image optimization service

  // Example with query parameters (adjust based on your service)
  const params = new URLSearchParams();
  if (options.width) params.append('w', String(options.width));
  if (options.height) params.append('h', String(options.height));
  if (options.quality) params.append('q', String(options.quality));
  if (options.format) params.append('f', options.format);
  if (options.fit) params.append('fit', options.fit);

  return params.toString() ? `${src}?${params.toString()}` : src;
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Simple base64 encoded SVG placeholder
  // In production, you might want to generate actual blur placeholder from image
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
  </svg>`;
  
  // For Node.js environment (SSR) - Next.js provides Buffer globally
  if (typeof Buffer !== 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  
  // For browser environment - use btoa
  if (typeof window !== 'undefined' && typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  // Fallback - return simple data URL without base64
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Get responsive image sizes
 */
export function getResponsiveSizes(breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
  } = breakpoints || {};

  return `(max-width: 768px) ${mobile}, (max-width: 1200px) ${tablet}, ${desktop}`;
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get optimal image dimensions based on container
 */
export function getOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  const containerAspectRatio = containerWidth / containerHeight;

  if (aspectRatio > containerAspectRatio) {
    // Image is wider, fit to width
    return {
      width: containerWidth,
      height: containerWidth / aspectRatio,
    };
  } else {
    // Image is taller, fit to height
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight,
    };
  }
}

/**
 * Check if image should be loaded with priority
 */
export function shouldLoadPriority(
  index: number,
  aboveTheFold: number = 3
): boolean {
  return index < aboveTheFold;
}

/**
 * Get image format based on browser support
 */
export function getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';

  // Check AVIF support
  const avifSupported = document.createElement('canvas')
    .toDataURL('image/avif')
    .indexOf('data:image/avif') === 0;

  if (avifSupported) return 'avif';

  // Check WebP support
  const webpSupported = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;

  if (webpSupported) return 'webp';

  return 'jpeg';
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Lazy load image with Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: { rootMargin?: string; threshold?: number } = {}
): () => void {
  const { rootMargin = '50px', threshold = 0.1 } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    { rootMargin, threshold }
  );

  observer.observe(img);

  return () => observer.disconnect();
}

