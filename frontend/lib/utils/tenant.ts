import { tenantApi } from '@/lib/api/tenant';

/**
 * Get tenant numeric ID from identifier (NPSN or numeric ID)
 * This function resolves NPSN to numeric ID if needed
 */
export async function getTenantId(identifier: string): Promise<number> {
  if (!identifier) {
    throw new Error('Tenant identifier tidak boleh kosong');
  }

  // Try to resolve using the identifier API first
  try {
    const tenant = await tenantApi.getByIdentifier(identifier);
    if (tenant && tenant.id) {
      return tenant.id;
    }
    throw new Error(`Tenant dengan identifier ${identifier} tidak ditemukan`);
  } catch (error: any) {
    // If it's a network error or 404, throw a more descriptive error
    if (error?.isNetworkError) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    
    if (error?.response?.status === 404) {
      throw new Error(`Tenant dengan identifier ${identifier} tidak ditemukan`);
    }
    
    // If identifier is numeric and API failed, it might be an ID already
    // But we should still throw an error to be safe, unless it's a network issue
    if (/^\d+$/.test(identifier)) {
      // Re-throw with more context
      const errorMessage = error?.message || `Gagal memuat tenant dengan identifier ${identifier}`;
      throw new Error(errorMessage);
    }
    
    // Re-throw the original error
    throw error instanceof Error ? error : new Error(`Gagal memuat tenant: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Get tenant NPSN from identifier
 * Returns the identifier if it's already NPSN, or resolves ID to NPSN
 */
export async function getTenantNpsn(identifier: string): Promise<string> {
  try {
    const tenant = await tenantApi.getByIdentifier(identifier);
    return tenant.npsn;
  } catch (error) {
    throw new Error(`Tenant dengan identifier ${identifier} tidak ditemukan`);
  }
}

