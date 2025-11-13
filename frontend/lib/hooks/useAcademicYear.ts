import { useQuery } from '@tanstack/react-query';
import { academicYearsApi, AcademicYear } from '@/lib/api/academic-years';

export function useActiveAcademicYear(tenantId?: number, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery<AcademicYear | null>({
    queryKey: ['academic-year', 'active', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID is required to fetch active academic year');
      }
      return academicYearsApi.getActive(tenantId);
    },
    enabled: Boolean(tenantId) && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

