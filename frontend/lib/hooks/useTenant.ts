import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTenantId, getTenantNpsn } from '@/lib/utils/tenant';

/**
 * Custom hook to get tenant ID (numeric) from URL parameter (NPSN or ID)
 * This hook resolves NPSN to numeric ID if needed
 * Returns: { tenantId, loading, error }
 */
export function useTenantIdState(): { tenantId: number | undefined; loading: boolean; error: Error | null } {
  const params = useParams();
  const tenantIdentifier = params?.tenant as string;
  const [tenantId, setTenantId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantIdentifier) {
      setLoading(false);
      setError(new Error('Tenant identifier tidak ditemukan'));
      return;
    }

    setLoading(true);
    setError(null);
    
    getTenantId(tenantIdentifier)
      .then((id) => {
        setTenantId(id ?? undefined);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Error getting tenant ID:', err);
        const errorMessage = err instanceof Error ? err : new Error('Gagal memuat data tenant');
        setError(errorMessage);
        setTenantId(undefined);
        setLoading(false);
      });
  }, [tenantIdentifier]);

  return { tenantId, loading, error };
}

/**
 * Custom hook to get tenant ID (numeric) from URL parameter (NPSN or ID)
 * This hook resolves NPSN to numeric ID if needed
 * Returns: number | undefined (for backward compatibility)
 */
export function useTenantId(): number | undefined {
  const { tenantId } = useTenantIdState();
  return tenantId;
}

/**
 * Custom hook to get tenant NPSN from URL parameter
 */
export function useTenantNpsn(): string | null {
  const params = useParams();
  return (params?.tenant as string) || null;
}

/**
 * Custom hook that returns both tenant ID and NPSN
 */
export function useTenant() {
  const params = useParams();
  const tenantIdentifier = params?.tenant as string;
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [npsn, setNpsn] = useState<string | null>(tenantIdentifier || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantIdentifier) {
      setLoading(false);
      return;
    }

    Promise.all([
      getTenantId(tenantIdentifier),
      getTenantNpsn(tenantIdentifier),
    ])
      .then(([id, npsnValue]) => {
        setTenantId(id);
        setNpsn(npsnValue);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting tenant data:', error);
        setLoading(false);
      });
  }, [tenantIdentifier]);

  return { tenantId, npsn, loading };
}

