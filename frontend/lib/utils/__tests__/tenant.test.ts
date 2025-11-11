import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { getTenantId, getTenantNpsn } from '../tenant';
import { tenantApi } from '@/lib/api/tenant';

vi.mock('@/lib/api/tenant', () => ({
  tenantApi: {
    getByIdentifier: vi.fn(),
  },
}));

describe('tenant utils', () => {
  const mockGetByIdentifier = tenantApi.getByIdentifier as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mengembalikan ID tenant dari identifier non-numerik', async () => {
    mockGetByIdentifier.mockResolvedValueOnce({ id: 42, npsn: '12345678' });

    const result = await getTenantId('SMA-TEST');

    expect(mockGetByIdentifier).toHaveBeenCalledWith('SMA-TEST');
    expect(result).toBe(42);
  });

  it('mengembalikan ID tenant dari identifier numerik yang memerlukan resolusi', async () => {
    mockGetByIdentifier.mockResolvedValueOnce({ id: 9, npsn: '87654321' });

    const result = await getTenantId('87654321');

    expect(mockGetByIdentifier).toHaveBeenCalledWith('87654321');
    expect(result).toBe(9);
  });

  it('fallback ke parseInt ketika tenant tidak ditemukan untuk identifier numerik', async () => {
    mockGetByIdentifier.mockRejectedValueOnce(new Error('Not found'));

    const result = await getTenantId('100');

    expect(mockGetByIdentifier).toHaveBeenCalledWith('100');
    expect(result).toBe(100);
  });

  it('melempar error ketika identifier non-numerik tidak ditemukan', async () => {
    mockGetByIdentifier.mockRejectedValueOnce(new Error('Tenant tidak ditemukan'));

    await expect(getTenantId('INVALID')).rejects.toThrow('Tenant dengan identifier INVALID tidak ditemukan');
  });

  it('mengembalikan NPSN tenant ketika ditemukan', async () => {
    mockGetByIdentifier.mockResolvedValueOnce({ id: 7, npsn: '99887766' });

    const result = await getTenantNpsn('99887766');

    expect(mockGetByIdentifier).toHaveBeenCalledWith('99887766');
    expect(result).toBe('99887766');
  });

  it('melempar error ketika NPSN tidak ditemukan', async () => {
    mockGetByIdentifier.mockRejectedValueOnce(new Error('Not found'));

    await expect(getTenantNpsn('not-found')).rejects.toThrow('Tenant dengan identifier not-found tidak ditemukan');
  });
});
