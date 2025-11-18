# Code Splitting & Lazy Loading Strategy

## Overview

Strategi code splitting dan lazy loading untuk mengoptimalkan performa aplikasi Next.js dengan mengurangi initial bundle size dan meningkatkan time-to-interactive.

## Implementasi yang Sudah Ada

### 1. Route-Level Code Splitting

Next.js App Router secara otomatis melakukan code splitting per route. Setiap folder di `app/` akan menjadi route terpisah dengan bundle sendiri.

**Struktur:**
```
app/
  [tenant]/
    dashboard/          → Bundle terpisah
    students/           → Bundle terpisah
    teachers/           → Bundle terpisah
    analytics/          → Bundle terpisah
    ...
```

### 2. Component-Level Lazy Loading

Komponen besar dan jarang digunakan di-lazy load menggunakan React `lazy()`:

**Contoh:**
```typescript
// frontend/app/[tenant]/analytics/lazy.tsx
import { lazy } from 'react';

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
);
```

**Penggunaan:**
```typescript
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

### 3. Utility Functions

#### `lazyLoad()` - Lazy load dengan Suspense wrapper
```typescript
import { lazyLoad, DefaultLazyFallback } from '@/lib/utils/lazyLoad';

const LazyComponent = lazyLoad(
  () => import('./HeavyComponent'),
  <DefaultLazyFallback />
);
```

#### `useLazyLoad()` - Hook untuk lazy loading elements
```typescript
import { useLazyLoad } from '@/lib/hooks/useLazyLoad';

function MyComponent() {
  const { elementRef, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
  });

  return (
    <div ref={elementRef}>
      {isVisible && <HeavyContent />}
    </div>
  );
}
```

## Best Practices

### 1. Lazy Load Heavy Components

Lazy load komponen yang:
- Jarang digunakan (modals, sidebars, tabs)
- Menggunakan library besar (charts, editors, maps)
- Memiliki dependencies berat

**Contoh:**
```typescript
// ✅ Good: Lazy load chart component
const LazyChart = lazy(() => import('@/components/charts/Chart'));

// ❌ Bad: Import langsung untuk komponen besar
import Chart from '@/components/charts/Chart';
```

### 2. Preload Critical Routes

Preload route yang kemungkinan besar akan diakses:

```typescript
import { useRouter } from 'next/navigation';

function Navigation() {
  const router = useRouter();
  
  const handleHover = () => {
    // Preload route saat hover
    router.prefetch('/dashboard/students');
  };

  return (
    <Link 
      href="/dashboard/students"
      onMouseEnter={handleHover}
    >
      Students
    </Link>
  );
}
```

### 3. Dynamic Imports dengan Chunk Names

Gunakan chunk names untuk kontrol yang lebih baik:

```typescript
// frontend/lib/utils/chunkNames.ts
export function createChunkName(name: string) {
  return () => import(/* webpackChunkName: "chunk-name" */ `./${name}`);
}
```

### 4. Code Splitting untuk Third-Party Libraries

Split library besar ke chunk terpisah:

```typescript
// next.config.js
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
      },
      charts: {
        test: /[\\/]node_modules[\\/](recharts|chart\.js)[\\/]/,
        name: 'charts',
        priority: 20,
      },
    },
  };
  return config;
}
```

## Komponen yang Perlu Lazy Load

### Prioritas Tinggi

1. **Analytics Dashboard** ✅ (Sudah diimplementasikan)
   - Chart components
   - Analytics widgets

2. **Data Tables dengan Pagination**
   - Table components dengan banyak fitur
   - Export/Import modals

3. **Rich Text Editors**
   - WYSIWYG editors
   - Markdown editors

4. **File Upload Components**
   - Drag & drop uploaders
   - Image editors

5. **Modal Components**
   - Large modals dengan forms
   - Confirmation dialogs

### Prioritas Sedang

1. **Settings Pages**
   - Configuration forms
   - Advanced settings

2. **Report Generators**
   - PDF generators
   - Excel exporters

3. **Calendar Components**
   - Full calendar views
   - Event schedulers

## Monitoring Bundle Size

### 1. Analyze Bundle

```bash
npm run build
npm run analyze
```

### 2. Check Bundle Size

Next.js akan menampilkan bundle size untuk setiap route saat build:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          87.3 kB
├ ○ /[tenant]/dashboard                  12.4 kB         94.5 kB
├ ○ /[tenant]/students                  8.1 kB          90.2 kB
└ ○ /[tenant]/analytics                 45.2 kB         127.3 kB
```

### 3. Target Bundle Size

- **Initial Load**: < 200 KB (gzipped)
- **Route Bundle**: < 50 KB (gzipped)
- **Vendor Bundle**: < 300 KB (gzipped)

## Optimization Checklist

- [x] Route-level code splitting (otomatis dengan App Router)
- [x] Component lazy loading untuk analytics
- [x] Lazy loading utilities
- [x] Image lazy loading
- [ ] Dynamic imports untuk heavy modals
- [ ] Code splitting untuk third-party libraries
- [ ] Preload critical routes
- [ ] Bundle size monitoring

## Next Steps

1. **Implement lazy loading untuk modals besar**
2. **Split vendor bundles** (charts, editors, dll)
3. **Preload routes** yang sering diakses
4. **Monitor bundle size** secara berkala
5. **Optimize images** dengan Next.js Image component

