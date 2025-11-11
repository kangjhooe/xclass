'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AnalyticsData } from '../../components/analytics/AnalyticsDashboard';

export interface UseAnalyticsOptions {
  module: string; // 'students', 'teachers', 'attendance', 'grades', etc.
  tenantId?: number | string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  enabled?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions) {
  const { module, tenantId, dateRange, filters, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', module, tenantId, dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      // Analytics endpoint supports both /analytics/{module} and /tenants/:tenant/analytics/{module}
      // The tenant middleware will handle tenant context
      const baseUrl = `/analytics/${module}`;

      const response = await apiClient.get(`${baseUrl}?${params.toString()}`);
      return response.data;
    },
    enabled: enabled && !!module,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook untuk mendapatkan analytics siswa
 */
export function useStudentAnalytics(tenantId?: number | string, options?: Omit<UseAnalyticsOptions, 'module'>) {
  return useAnalytics({
    module: 'students',
    tenantId,
    ...options,
  });
}

/**
 * Hook untuk mendapatkan analytics guru
 */
export function useTeacherAnalytics(tenantId?: number | string, options?: Omit<UseAnalyticsOptions, 'module'>) {
  return useAnalytics({
    module: 'teachers',
    tenantId,
    ...options,
  });
}

/**
 * Hook untuk mendapatkan analytics absensi
 */
export function useAttendanceAnalytics(tenantId?: number | string, options?: Omit<UseAnalyticsOptions, 'module'>) {
  return useAnalytics({
    module: 'attendance',
    tenantId,
    ...options,
  });
}

/**
 * Hook untuk mendapatkan analytics nilai
 */
export function useGradesAnalytics(tenantId?: number | string, options?: Omit<UseAnalyticsOptions, 'module'>) {
  return useAnalytics({
    module: 'grades',
    tenantId,
    ...options,
  });
}

