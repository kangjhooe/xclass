import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query configuration with caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes even when not in use
      gcTime: 10 * 60 * 1000, // Previously cacheTime
      // Retry failed requests
      retry: 1,
      // Refetch on window focus (can be disabled for better performance)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

/**
 * Cache key generators
 */
export const cacheKeys = {
  // User keys
  user: (id: number) => ['user', id] as const,
  users: (filters?: any) => ['users', filters] as const,

  // Tenant keys
  tenant: (id: number) => ['tenant', id] as const,
  tenantByNpsn: (npsn: string) => ['tenant', 'npsn', npsn] as const,

  // Student keys
  student: (tenantId: number, id: number) => ['students', tenantId, id] as const,
  students: (tenantId: number, filters?: any) => ['students', tenantId, filters] as const,

  // Teacher keys
  teacher: (tenantId: number, id: number) => ['teachers', tenantId, id] as const,
  teachers: (tenantId: number, filters?: any) => ['teachers', tenantId, filters] as const,

  // Class keys
  class: (tenantId: number, id: number) => ['classes', tenantId, id] as const,
  classes: (tenantId: number) => ['classes', tenantId] as const,

  // Subject keys
  subject: (tenantId: number, id: number) => ['subjects', tenantId, id] as const,
  subjects: (tenantId: number) => ['subjects', tenantId] as const,

  // Dashboard keys
  dashboard: (tenantId: number) => ['dashboard', tenantId] as const,

  // Analytics keys
  analytics: (tenantId: number, module: string, filters?: any) =>
    ['analytics', tenantId, module, filters] as const,

  // Audit trail keys
  auditTrail: (tenantId: number, filters?: any) => ['audit-trail', tenantId, filters] as const,
};

/**
 * Invalidate related cache entries
 */
export function invalidateRelatedCache(tenantId: number, type: 'student' | 'teacher' | 'class' | 'subject') {
  queryClient.invalidateQueries({ queryKey: [type + 's', tenantId] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', tenantId] });
}

