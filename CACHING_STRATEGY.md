# Caching Strategy Documentation

## Overview

This document describes the caching strategy implemented in the application for both backend (NestJS) and frontend (Next.js/React).

## Backend Caching

### Setup

The caching system uses `@nestjs/cache-manager` with support for:
- **In-memory cache** (default for development)
- **Redis** (for production, if configured)

### Configuration

1. **Environment Variables** (optional, for Redis):
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_password
   ```

2. **Module Setup**:
   The `CacheModule` is already imported globally in `app.module.ts`.

### Usage

#### Method 1: Using Decorators

```typescript
import { Cacheable, CacheInvalidate } from '@/common/decorators/cache.decorator';

@Cacheable('students:all', 300) // Cache for 5 minutes
async findAll() {
  // This result will be cached automatically
  return this.repository.find();
}

@CacheInvalidate('students:*')
async update(id: number, data: any) {
  // This will invalidate all cache keys matching 'students:*'
  return this.repository.update(id, data);
}
```

#### Method 2: Using CacheService Directly

```typescript
import { CacheService } from '@/common/cache/cache.service';
import { CacheKeys } from '@/common/cache/cache-keys';

constructor(private cacheService: CacheService) {}

async findOne(id: number) {
  const cacheKey = CacheKeys.student(id, tenantId);
  
  return this.cacheService.getOrSet(
    cacheKey,
    async () => {
      // This function will only execute if cache miss
      return this.repository.findOne({ where: { id } });
    },
    300 // TTL in seconds (5 minutes)
  );
}
```

#### Method 3: Manual Cache Management

```typescript
// Get from cache
const cached = await this.cacheService.get(key);
if (cached) return cached;

// Set cache
await this.cacheService.set(key, data, 300);

// Delete from cache
await this.cacheService.del(key);

// Invalidate pattern
await this.cacheService.invalidatePattern('tenant:*:students:*');
```

### Cache Keys

Use centralized cache keys from `CacheKeys` class:

```typescript
import { CacheKeys } from '@/common/cache/cache-keys';

// Single entity
CacheKeys.student(id, tenantId)
CacheKeys.teacher(id, tenantId)

// Lists
CacheKeys.students(tenantId, page, limit)
CacheKeys.teachers(tenantId, page, limit)

// Patterns for invalidation
CacheKeys.tenantPattern(tenantId)
CacheKeys.studentsPattern(tenantId)
```

## Frontend Caching

### React Query Configuration

React Query is configured with optimized caching in `frontend/lib/cache/reactQueryConfig.ts`:

- **Stale Time**: 5 minutes (data considered fresh)
- **Cache Time**: 10 minutes (data kept in cache)
- **Refetch on Window Focus**: Disabled (for better performance)
- **Refetch on Reconnect**: Enabled

### Usage

#### Basic Query with Caching

```typescript
import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/lib/cache/reactQueryConfig';

const { data, isLoading } = useQuery({
  queryKey: cacheKeys.students(tenantId, filters),
  queryFn: () => studentsApi.getAll(tenantId, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### Invalidate Cache After Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateRelatedCache } from '@/lib/cache/reactQueryConfig';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data) => studentsApi.create(tenantId, data),
  onSuccess: () => {
    // Invalidate related queries
    invalidateRelatedCache(tenantId, 'student');
    // Or manually
    queryClient.invalidateQueries({ 
      queryKey: ['students', tenantId] 
    });
  },
});
```

### LocalStorage Cache

For data that should persist across sessions:

```typescript
import { localStorageCache } from '@/lib/cache/localStorageCache';

// Get from cache
const cached = localStorageCache.get('user_preferences');
if (cached) return cached;

// Set cache (TTL: 1 hour)
localStorageCache.set('user_preferences', data, 60 * 60 * 1000);

// Get or set pattern
const data = await localStorageCache.getOrSet(
  'dashboard_data',
  async () => {
    return await fetchDashboardData();
  },
  30 * 60 * 1000 // 30 minutes
);
```

## Best Practices

### 1. Cache Invalidation

Always invalidate related cache when data changes:

```typescript
// After creating a student
await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(tenantId));
await this.cacheService.del(CacheKeys.dashboard(tenantId));
```

### 2. Cache Key Naming

Use consistent naming patterns:
- `tenant:{id}:entity:{id}` for single entities
- `tenant:{id}:entities` for lists
- Include filters in list keys: `tenant:{id}:entities:page:{page}:limit:{limit}`

### 3. TTL Selection

- **Frequently changing data**: 1-5 minutes
- **Moderately changing data**: 5-15 minutes
- **Rarely changing data**: 15-60 minutes
- **Static data**: 1 hour or more

### 4. Cache Warming

Pre-fetch frequently accessed data:

```typescript
// On app startup or user login
await Promise.all([
  this.cacheService.getOrSet(CacheKeys.dashboard(tenantId), () => this.getDashboard()),
  this.cacheService.getOrSet(CacheKeys.classes(tenantId), () => this.getClasses()),
]);
```

### 5. Error Handling

Cache should never break the application:

```typescript
try {
  return await this.cacheService.getOrSet(key, factory, ttl);
} catch (error) {
  // Fallback to direct database query
  console.error('Cache error:', error);
  return factory();
}
```

## Performance Monitoring

Monitor cache hit rates and adjust TTL accordingly:

```typescript
// Add logging to track cache performance
const start = Date.now();
const cached = await this.cacheService.get(key);
if (cached) {
  console.log(`Cache hit: ${key} (${Date.now() - start}ms)`);
} else {
  console.log(`Cache miss: ${key}`);
}
```

## Redis Setup (Production)

For production, configure Redis:

1. Install Redis:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   ```

2. Set environment variables:
   ```env
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   ```

3. The application will automatically use Redis if `REDIS_HOST` is set.

## Troubleshooting

### Cache Not Working

1. Check if `CacheModule` is imported in `app.module.ts`
2. Verify cache service is injected in your service
3. Check Redis connection (if using Redis)

### Memory Issues

1. Reduce cache TTL
2. Limit cache size in configuration
3. Implement cache eviction policies

### Stale Data

1. Reduce stale time
2. Implement proper cache invalidation
3. Use shorter TTL for frequently changing data

