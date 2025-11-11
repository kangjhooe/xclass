# Code Splitting Documentation

## Overview

This document describes the code splitting strategy implemented to improve application performance by splitting code into smaller, loadable chunks.

## Strategy

### 1. Route-Based Splitting

Next.js automatically splits code by route. Each page gets its own chunk:

```typescript
// Automatically split by route
// app/[tenant]/dashboard/page.tsx -> dashboard chunk
// app/[tenant]/students/page.tsx -> students chunk
```

### 2. Component-Based Splitting

Heavy components are lazy loaded:

```typescript
// app/[tenant]/analytics/lazy.tsx
import { lazy } from 'react';

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard')
);
```

### 3. Vendor Splitting

Large libraries are split into separate chunks:

- **React/React-DOM**: Framework chunk
- **React Query**: Query chunk
- **Recharts**: Charts chunk
- **Other libraries**: Individual chunks

### 4. Common Chunks

Shared code is extracted into common chunks:

- **UI Components**: Shared UI components
- **Utilities**: Common utilities
- **Hooks**: Shared hooks
- **API**: API clients

## Configuration

### Webpack Configuration

Configured in `next.config.js`:

```javascript
webpack: (config, { isServer, dev }) => {
  if (!isServer && !dev) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        framework: {
          name: 'framework',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          priority: 40,
        },
        lib: {
          test: /[\\/]node_modules[\\/]/,
          priority: 30,
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20,
        },
      },
    };
  }
}
```

### Experimental Optimizations

```javascript
experimental: {
  optimizePackageImports: [
    '@tanstack/react-query',
    'recharts',
    'date-fns',
    'zustand',
  ],
}
```

## Usage

### 1. Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';
import { SkeletonPage } from '@/components/ui/Skeleton';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 2. Dynamic Route Loading

```typescript
import dynamic from 'next/dynamic';

const DynamicPage = dynamic(() => import('./Page'), {
  loading: () => <SkeletonPage />,
  ssr: false, // Disable SSR if needed
});
```

### 3. Preload Critical Modules

```typescript
import { usePreload } from '@/lib/hooks/useCodeSplit';

function MyComponent() {
  // Preload on hover or before navigation
  usePreload(() => import('./HeavyComponent'), []);
  
  return <div>...</div>;
}
```

### 4. Named Chunks

```typescript
import { getChunkNameComment } from '@/lib/utils/chunkNames';

const LazyComponent = lazy(() => 
  import(
    /* webpackChunkName: "analytics" */
    '@/components/analytics/AnalyticsDashboard'
  )
);
```

### 5. Retry on Failure

```typescript
import { lazyLoadWithRetry } from '@/lib/utils/codeSplitting';

const LazyComponent = lazy(
  lazyLoadWithRetry(() => import('./Component'), 3)
);
```

## Best Practices

### 1. Split Large Libraries

✅ **Good:**
```typescript
const Recharts = lazy(() => import('recharts'));
```

❌ **Bad:**
```typescript
import * as Recharts from 'recharts'; // Loads entire library
```

### 2. Split Heavy Components

✅ **Good:**
```typescript
const ReportBuilder = lazy(() => import('./ReportBuilder'));
```

❌ **Bad:**
```typescript
import { ReportBuilder } from './ReportBuilder'; // Loads immediately
```

### 3. Use Suspense Boundaries

✅ **Good:**
```typescript
<Suspense fallback={<SkeletonPage />}>
  <LazyComponent />
</Suspense>
```

❌ **Bad:**
```typescript
<LazyComponent /> // No fallback
```

### 4. Preload on Interaction

```typescript
function Navigation() {
  const handleMouseEnter = () => {
    // Preload route on hover
    import('./HeavyPage');
  };

  return (
    <Link href="/heavy-page" onMouseEnter={handleMouseEnter}>
      Heavy Page
    </Link>
  );
}
```

### 5. Group Related Components

```typescript
// Load related components together
const AnalyticsComponents = lazy(() => 
  import('./analytics').then(m => ({
    default: () => (
      <>
        <m.AnalyticsDashboard />
        <m.AnalyticsWidget />
      </>
    )
  }))
);
```

## Chunk Strategy

### Vendor Chunks

- **framework**: React, React-DOM
- **vendor-query**: React Query
- **vendor-charts**: Recharts
- **vendor-editor**: Rich text editors

### Feature Chunks

- **analytics**: Analytics components
- **report-builder**: Report builder
- **audit-trail**: Audit trail viewer
- **file-preview**: File preview components

### UI Chunks

- **ui-components**: Basic UI components
- **ui-forms**: Form components
- **ui-charts**: Chart components

### Common Chunks

- **commons**: Shared code (min 2 imports)
- **common-utils**: Utility functions
- **common-hooks**: Shared hooks

## Performance Benefits

1. **Reduced Initial Bundle Size**
   - Only load code needed for initial render
   - Smaller JavaScript bundles

2. **Faster Time to Interactive**
   - Less code to parse and execute
   - Faster initial render

3. **Better Caching**
   - Vendor chunks change less frequently
   - Better browser caching

4. **Parallel Loading**
   - Multiple chunks can load in parallel
   - Better network utilization

## Monitoring

### Analyze Bundle Size

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### Monitor Chunk Loading

```typescript
import { monitorChunkLoad } from '@/lib/utils/codeSplitting';

const stopMonitoring = monitorChunkLoad('analytics');
// Chunk loads...
stopMonitoring();
```

## Examples

### Example 1: Lazy Load Route

```typescript
// app/[tenant]/analytics/page.tsx
import { Suspense } from 'react';
import { LazyAnalyticsDashboard } from './lazy';
import { SkeletonPage } from '@/components/ui/Skeleton';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <LazyAnalyticsDashboard />
    </Suspense>
  );
}
```

### Example 2: Conditional Loading

```typescript
function MyComponent({ showChart }: { showChart: boolean }) {
  const [ChartComponent, setChartComponent] = useState(null);

  useEffect(() => {
    if (showChart && !ChartComponent) {
      import('./Chart').then(m => setChartComponent(m.default));
    }
  }, [showChart, ChartComponent]);

  return ChartComponent ? <ChartComponent /> : null;
}
```

### Example 3: Preload on Hover

```typescript
function NavigationLink({ href, children }) {
  const handleMouseEnter = () => {
    // Preload route
    import(`./pages${href}`);
  };

  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

## Troubleshooting

### Issue: Too many small chunks

**Solution:**
- Increase `minChunks` in webpack config
- Group related components
- Use `cacheGroups` to control splitting

### Issue: Large vendor chunk

**Solution:**
- Split vendor into smaller chunks
- Use `optimizePackageImports` for tree-shaking
- Lazy load heavy libraries

### Issue: Chunk loading fails

**Solution:**
- Implement retry mechanism
- Add error boundaries
- Check network connectivity
- Verify chunk names are correct

### Issue: Duplicate code in chunks

**Solution:**
- Increase `minChunks` for commons
- Check for duplicate imports
- Use `reuseExistingChunk: true`

## Next Steps

1. Analyze current bundle size
2. Identify large dependencies
3. Implement lazy loading for heavy components
4. Configure webpack splitting
5. Monitor chunk loading performance
6. Optimize based on metrics

