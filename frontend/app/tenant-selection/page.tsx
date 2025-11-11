'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { tenantAccessApi, TenantAccessRecord } from '@/lib/api/tenantAccess';
import { tenantApi, Tenant } from '@/lib/api/tenant';

interface DisplayTenant {
  id: number;
  npsn?: string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export default function TenantSelectionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [manualError, setManualError] = useState('');
  const [identifierInput, setIdentifierInput] = useState('');

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const grantsQuery = useQuery<TenantAccessRecord[]>({
    queryKey: ['tenant-selection', 'grants'],
    queryFn: () => tenantAccessApi.getSuperAdminGrants(),
    enabled: hasHydrated && isAuthenticated && user?.role === 'super_admin',
  });

  const ownTenantQuery = useQuery<Tenant>({
    queryKey: ['tenant-selection', 'tenant', user?.tenant_id ?? user?.instansiId],
    queryFn: async () => {
      const tenantIdentifier = user?.tenant_id ?? user?.instansiId;
      if (!tenantIdentifier) {
        throw new Error('Tenant ID tidak tersedia');
      }
      return tenantApi.getById(tenantIdentifier);
    },
    enabled:
      hasHydrated &&
      isAuthenticated &&
      user?.role !== 'super_admin' &&
      !!(user?.tenant_id ?? user?.instansiId),
  });

  const manualLookup = useMutation<Tenant, Error, string>({
    mutationFn: async (identifier: string) => tenantApi.getByIdentifier(identifier.trim()),
    onSuccess: (tenant) => {
      setManualError('');
      setIdentifierInput(tenant.npsn || tenant.id?.toString() || '');
      handleEnterTenant(tenant);
    },
    onError: (error) => {
      setManualError(error.message || 'Tenant tidak ditemukan');
    },
  });

  const grantMap = useMemo(() => {
    if (!grantsQuery.data) {
      return new Map<number, TenantAccessRecord>();
    }
    return new Map(grantsQuery.data.map((grant) => [grant.tenantId, grant]));
  }, [grantsQuery.data]);

  const availableTenants: DisplayTenant[] = useMemo(() => {
    if (user?.role === 'super_admin') {
      return grantsQuery.data?.map((grant) => ({
        id: grant.tenant?.id ?? grant.tenantId,
        npsn: grant.tenant?.npsn,
        name: grant.tenant?.name,
        email: grant.tenant?.email,
        phone: grant.tenant?.phone,
        isActive: grant.tenant?.isActive,
      })) ?? [];
    }

    if (ownTenantQuery.data) {
      return [ownTenantQuery.data];
    }

    return [];
  }, [user?.role, grantsQuery.data, ownTenantQuery.data]);

  const handleEnterTenant = (tenant: DisplayTenant | Tenant, grant?: TenantAccessRecord) => {
    const identifier = tenant.npsn || tenant.id?.toString();
    if (!identifier) {
      setManualError('Tenant tidak memiliki identifier yang valid');
      return;
    }

    if (typeof window !== 'undefined') {
      if (user?.role === 'super_admin') {
        const activeGrant = grant ?? grantMap.get(tenant.id);
        if (activeGrant) {
          sessionStorage.setItem(
            'delegatedTenant',
            JSON.stringify({
              tenantId: tenant.id,
              tenantIdentifier: identifier,
              tenantName: tenant.name,
              expiresAt: activeGrant.expiresAt,
            })
          );
        } else {
          sessionStorage.removeItem('delegatedTenant');
        }
      } else {
        sessionStorage.removeItem('delegatedTenant');
      }
    }

    router.push(`/${identifier}/dashboard`);
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifierInput.trim()) {
      setManualError('Masukkan NPSN atau ID tenant terlebih dahulu');
      return;
    }
    manualLookup.mutate(identifierInput.trim());
  };

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  const isLoading = grantsQuery.isLoading || ownTenantQuery.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center text-white mb-10">
          <h1 className="text-3xl font-bold mb-2">Pilih Tenant</h1>
          <p className="text-slate-300">
            Pilih instansi yang ingin Anda kelola atau masukkan NPSN apabila tidak muncul di daftar.
          </p>
        </header>

        <section className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-6 mb-10 shadow-xl shadow-blue-900/20">
          <h2 className="text-lg font-semibold text-white mb-4">Pencarian Cepat</h2>
          <form onSubmit={handleManualSubmit} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={identifierInput}
              onChange={(event) => {
                setIdentifierInput(event.target.value);
                if (manualError) {
                  setManualError('');
                }
              }}
              placeholder="Masukkan NPSN atau ID tenant"
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-60"
              disabled={manualLookup.isPending}
            >
              {manualLookup.isPending ? 'Mencari...' : 'Cari dan Masuk'}
            </button>
          </form>
          {manualError && <p className="mt-3 text-sm text-red-300">{manualError}</p>}
        </section>

        <section className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-6 shadow-xl shadow-blue-900/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Tenant Tersedia</h2>
            {user?.role === 'super_admin' && (
              <span className="text-sm text-slate-300">
                Total akses aktif: {availableTenants.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <svg className="h-8 w-8 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : availableTenants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Belum ada tenant yang tersedia</h3>
              <p className="text-slate-300">
                Gunakan pencarian NPSN di atas atau hubungi admin untuk mendapatkan akses.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-white transition hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-900/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{tenant.name || 'Tanpa Nama'}</h3>
                      <p className="text-sm text-slate-300">NPSN: {tenant.npsn || 'Tidak tersedia'}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tenant.isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'
                      }`}
                    >
                      {tenant.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  {tenant.email && <p className="text-sm text-slate-300">Email: {tenant.email}</p>}
                  {tenant.phone && <p className="text-sm text-slate-300">Telp: {tenant.phone}</p>}
                  <button
                    onClick={() => handleEnterTenant(tenant)}
                    className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2.5 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
                  >
                    Masuk ke Tenant
                  </button>
                  {user?.role === 'super_admin' && grantMap.get(tenant.id)?.expiresAt && (
                    <p className="mt-3 text-xs text-slate-400">
                      Akses berakhir: {new Date(grantMap.get(tenant.id)!.expiresAt!).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
