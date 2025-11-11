# Image Optimization Documentation

## Overview

This document describes the image optimization strategy implemented in the frontend to improve performance, reduce bandwidth, and enhance user experience.

## Features

### 1. Next.js Image Optimization

The application uses Next.js built-in Image component which provides:
- **Automatic format optimization**: Serves WebP/AVIF when supported
- **Responsive images**: Generates multiple sizes for different devices
- **Lazy loading**: Images load only when they enter viewport
- **Blur placeholder**: Shows blur placeholder while loading
- **Priority loading**: Critical images can be loaded with priority

### 2. OptimizedImage Component

Located in `frontend/components/ui/OptimizedImage.tsx`:

```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={85}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

**Props:**
- `src`: Image source URL
- `alt`: Alt text (required)
- `width` / `height`: Image dimensions
- `fill`: Use fill mode for responsive containers
- `sizes`: Responsive sizes string
- `quality`: Image quality (1-100, default: 85)
- `priority`: Load with priority (for above-the-fold images)
- `placeholder`: 'blur' or 'empty'
- `blurDataURL`: Base64 blur placeholder
- `objectFit`: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
- `fallback`: Fallback image URL

### 3. LazyImage Component

Combines lazy loading with optimization:

```typescript
import { LazyImage } from '@/components/lazy/LazyImage';

<LazyImage
  src="/large-image.jpg"
  alt="Description"
  width={1200}
  height={800}
  placeholder="/placeholder.jpg"
/>
```

### 4. Image Optimization Utilities

Located in `frontend/lib/utils/imageOptimization.ts`:

```typescript
import {
  getOptimizedImageUrl,
  generateBlurDataURL,
  getResponsiveSizes,
  getOptimalFormat,
  preloadImage,
} from '@/lib/utils/imageOptimization';

// Generate optimized URL
const optimizedUrl = getOptimizedImageUrl(src, {
  width: 800,
  quality: 85,
  format: 'webp',
});

// Generate blur placeholder
const blurDataURL = generateBlurDataURL(10, 10);

// Get responsive sizes
const sizes = getResponsiveSizes({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw',
});

// Preload critical image
preloadImage('/hero-image.jpg');
```

## Configuration

### Next.js Config

Image optimization is configured in `next.config.js`:

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '3000',
    },
  ],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

## Best Practices

### 1. Use OptimizedImage for All Images

✅ **Good:**
```typescript
<OptimizedImage
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
/>
```

❌ **Bad:**
```typescript
<img src="/photo.jpg" alt="Photo" />
```

### 2. Set Priority for Above-the-Fold Images

```typescript
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true} // Load immediately
/>
```

### 3. Use Fill Mode for Responsive Containers

```typescript
<div className="relative w-full h-64">
  <OptimizedImage
    src="/banner.jpg"
    alt="Banner"
    fill
    sizes="100vw"
    objectFit="cover"
  />
</div>
```

### 4. Provide Blur Placeholder

```typescript
const blurDataURL = generateBlurDataURL(10, 10);

<OptimizedImage
  src="/image.jpg"
  alt="Image"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataURL}
/>
```

### 5. Use LazyImage for Below-the-Fold Images

```typescript
<LazyImage
  src="/gallery-image.jpg"
  alt="Gallery"
  width={400}
  height={300}
/>
```

### 6. Optimize Image Sizes

- **Hero images**: 1920x1080 (max)
- **Thumbnails**: 400x300
- **Avatars**: 128x128
- **Icons**: 64x64 or smaller

### 7. Use Appropriate Quality

- **High quality (90-100)**: Hero images, featured content
- **Medium quality (75-85)**: General content images
- **Low quality (60-75)**: Thumbnails, previews

## Performance Benefits

1. **Reduced Bandwidth**
   - Automatic format optimization (WebP/AVIF)
   - Responsive image sizes
   - Quality optimization

2. **Faster Load Times**
   - Lazy loading for below-the-fold images
   - Priority loading for critical images
   - Blur placeholder for better perceived performance

3. **Better User Experience**
   - Smooth loading transitions
   - No layout shift
   - Progressive image loading

4. **SEO Benefits**
   - Proper alt text
   - Fast loading times
   - Better Core Web Vitals scores

## Image Formats

### AVIF
- Best compression
- Modern browsers only
- Smallest file size

### WebP
- Good compression
- Wide browser support
- Good fallback option

### JPEG
- Universal support
- Good for photos
- Larger file size

### PNG
- Lossless compression
- Good for graphics
- Larger file size

## Examples

### Example 1: Hero Image

```typescript
<OptimizedImage
  src="/hero.jpg"
  alt="Hero Banner"
  width={1920}
  height={1080}
  priority={true}
  quality={90}
  placeholder="blur"
  blurDataURL={heroBlurDataURL}
/>
```

### Example 2: Gallery Grid

```typescript
<div className="grid grid-cols-3 gap-4">
  {images.map((image, index) => (
    <LazyImage
      key={image.id}
      src={image.url}
      alt={image.alt}
      width={400}
      height={300}
      quality={85}
    />
  ))}
</div>
```

### Example 3: Avatar

```typescript
<OptimizedImage
  src={user.avatar}
  alt={user.name}
  width={128}
  height={128}
  className="rounded-full"
  objectFit="cover"
/>
```

### Example 4: Responsive Banner

```typescript
<div className="relative w-full h-64 md:h-96">
  <OptimizedImage
    src="/banner.jpg"
    alt="Banner"
    fill
    sizes="(max-width: 768px) 100vw, 80vw"
    objectFit="cover"
    priority={true}
  />
</div>
```

## Troubleshooting

### Issue: Images not loading

**Solution:**
1. Check if domain is in `remotePatterns` in `next.config.js`
2. Verify image URL is correct
3. Check browser console for errors

### Issue: Images too large

**Solution:**
1. Reduce quality parameter
2. Use appropriate dimensions
3. Consider using smaller image sizes

### Issue: Layout shift

**Solution:**
1. Always provide width and height
2. Use fill mode for responsive containers
3. Use blur placeholder

### Issue: Slow image loading

**Solution:**
1. Enable priority for above-the-fold images
2. Use lazy loading for below-the-fold
3. Optimize image file sizes before upload
4. Use CDN for image delivery

## Monitoring

Track image performance:

```typescript
// Measure image load time
const startTime = performance.now();
const img = new Image();
img.onload = () => {
  const loadTime = performance.now() - startTime;
  console.log(`Image load time: ${loadTime}ms`);
};
img.src = imageUrl;
```

## Next Steps

1. Optimize existing images
2. Convert to OptimizedImage component
3. Add blur placeholders
4. Set appropriate priorities
5. Monitor performance metrics

