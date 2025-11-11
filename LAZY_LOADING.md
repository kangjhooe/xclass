# Lazy Loading Documentation

## Overview

This document describes the lazy loading strategy implemented in the frontend to improve initial load performance and reduce bundle size.

## What is Lazy Loading?

Lazy loading is a technique that defers loading of non-critical resources until they are needed. In React, this is achieved using:
- `React.lazy()` for code splitting
- `Suspense` for handling loading states
- Dynamic imports for route-based splitting

## Implementation

### 1. Utility Functions

Located in `frontend/lib/utils/lazyLoad.tsx`:

```typescript
import { lazyLoad, createLazyComponent, withLazyLoad } from '@/lib/utils/lazyLoad';

// Method 1: Basic lazy load
const LazyComponent = lazyLoad(() => import('./HeavyComponent'));

// Method 2: With custom fallback
const LazyComponent = lazyLoad(
  () => import('./HeavyComponent'),
  <CustomFallback />
);

// Method 3: Create with automatic Suspense wrapper
const LazyComponent = createLazyComponent(
  () => import('./HeavyComponent'),
  <CustomFallback />
);
```

### 2. Lazy Components

#### LazyPage
Wrapper for lazy loaded pages:

```typescript
import { LazyPage } from '@/components/lazy/LazyPage';

export default function MyPage() {
  return (
    <LazyPage>
      <HeavyPageContent />
    </LazyPage>
  );
}
```

#### LazyComponent
Wrapper for lazy loaded components:

```typescript
import { LazyComponent } from '@/components/lazy/LazyComponent';

function MyComponent() {
  return (
    <LazyComponent>
      <HeavyComponent />
    </LazyComponent>
  );
}
```

#### LazyImage
Lazy load images using Intersection Observer:

```typescript
import { LazyImage } from '@/components/lazy/LazyImage';

<LazyImage
  src="/large-image.jpg"
  alt="Description"
  placeholder="/placeholder.jpg"
  className="w-full h-auto"
/>
```

#### LazyTable
Lazy load table components:

```typescript
import { LazyTable } from '@/components/lazy/LazyTable';

<LazyTable rows={10} columns={6}>
  <TableComponent data={data} />
</LazyTable>
```

### 3. Route-Based Lazy Loading

For Next.js pages, use dynamic imports:

```typescript
// app/[tenant]/analytics/page.tsx
import { lazy, Suspense } from 'react';
import { SkeletonPage } from '@/components/ui/Skeleton';

const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(
    module => ({ default: module.AnalyticsDashboard })
  )
);

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <LazyAnalyticsDashboard {...props} />
    </Suspense>
  );
}
```

### 4. Component-Based Lazy Loading

For heavy components within pages:

```typescript
// Create lazy.tsx file in the same directory
// app/[tenant]/dashboard/lazy.tsx
import { lazy } from 'react';

export const LazyLineChart = lazy(() => 
  import('@/components/ui/Charts').then(
    module => ({ default: module.LineChartComponent })
  )
);

// Use in page
import { LazyLineChart } from './lazy';
import { Suspense } from 'react';

<Suspense fallback={<SkeletonChart />}>
  <LazyLineChart data={data} />
</Suspense>
```

### 5. Custom Hook: useLazyLoad

For lazy loading elements based on viewport visibility:

```typescript
import { useLazyLoad } from '@/lib/hooks/useLazyLoad';

function MyComponent() {
  const { elementRef, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  return (
    <div ref={elementRef}>
      {isVisible && <HeavyContent />}
    </div>
  );
}
```

## Best Practices

### 1. What to Lazy Load

✅ **Should lazy load:**
- Heavy third-party libraries (charts, editors, etc.)
- Large components not immediately visible
- Route-based pages
- Images below the fold
- Modal content
- Tab content that's not initially active

❌ **Don't lazy load:**
- Critical above-the-fold content
- Small components
- Frequently used utilities
- Layout components
- Navigation components

### 2. Fallback Components

Always provide meaningful fallbacks:

```typescript
// Good: Specific fallback
<Suspense fallback={<SkeletonTable rows={10} />}>
  <LazyTable />
</Suspense>

// Bad: No fallback or generic loading
<Suspense fallback={<div>Loading...</div>}>
  <LazyTable />
</Suspense>
```

### 3. Error Boundaries

Wrap lazy loaded components with error boundaries:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <Suspense fallback={<SkeletonPage />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

### 4. Preloading

Preload critical lazy components:

```typescript
// Preload on hover or before navigation
const handleMouseEnter = () => {
  import('./HeavyComponent');
};

<Link href="/heavy-page" onMouseEnter={handleMouseEnter}>
  Go to Heavy Page
</Link>
```

### 5. Code Splitting Strategy

- **Route-based splitting**: Each route gets its own chunk
- **Component-based splitting**: Heavy components in separate chunks
- **Library splitting**: Large libraries in vendor chunks

## Performance Benefits

1. **Reduced Initial Bundle Size**
   - Only load code needed for initial render
   - Smaller JavaScript bundles = faster page load

2. **Improved Time to Interactive (TTI)**
   - Less JavaScript to parse and execute
   - Faster initial render

3. **Better User Experience**
   - Progressive loading
   - Perceived performance improvement

4. **Reduced Memory Usage**
   - Components only loaded when needed
   - Better for mobile devices

## Monitoring

Track lazy loading performance:

```typescript
// Measure lazy load time
const startTime = performance.now();
const module = await import('./HeavyComponent');
const loadTime = performance.now() - startTime;
console.log(`Lazy load time: ${loadTime}ms`);
```

## Examples

### Example 1: Lazy Load Chart Component

```typescript
// dashboard/page.tsx
import { lazy, Suspense } from 'react';
import { SkeletonChart } from '@/components/ui/Skeleton';

const LazyChart = lazy(() => 
  import('@/components/ui/Charts').then(m => ({ default: m.LineChartComponent }))
);

export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<SkeletonChart />}>
        <LazyChart data={data} />
      </Suspense>
    </div>
  );
}
```

### Example 2: Lazy Load Modal Content

```typescript
const LazyModalContent = lazy(() => import('./ModalContent'));

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Suspense fallback={<div>Loading modal...</div>}>
        <LazyModalContent />
      </Suspense>
    </Modal>
  );
}
```

### Example 3: Lazy Load Images in Gallery

```typescript
import { LazyImage } from '@/components/lazy/LazyImage';

function ImageGallery({ images }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <LazyImage
          key={index}
          src={image.url}
          alt={image.alt}
          placeholder="/placeholder.jpg"
        />
      ))}
    </div>
  );
}
```

## Troubleshooting

### Issue: Component flashes during load

**Solution**: Use skeleton loaders that match the component structure

### Issue: Too many small chunks

**Solution**: Group related components or use webpack chunk configuration

### Issue: Lazy component not loading

**Solution**: 
1. Check import path is correct
2. Verify component is exported as default
3. Check browser console for errors

### Issue: Suspense boundary not catching

**Solution**: Ensure Suspense wraps the lazy component directly

## Next Steps

1. Identify heavy components using bundle analyzer
2. Implement lazy loading for identified components
3. Add appropriate fallbacks
4. Monitor performance improvements
5. Optimize based on metrics

