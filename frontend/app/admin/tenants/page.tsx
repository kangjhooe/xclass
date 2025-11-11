'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi, Tenant } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortableTableHead, SortDirection } from '@/components/ui/SortableTableHead';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Textarea';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { tenantAccessApi, TenantAccessRecord } from '@/lib/api/tenantAccess';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<Partial<Tenant>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);
  const { success, error: showError } = useToastStore();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [accessRequests, setAccessRequests] = useState<TenantAccessRecord[]>([]);
  const [activeGrants, setActiveGrants] = useState<TenantAccessRecord[]>([]);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessSubmitting, setAccessSubmitting] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [accessForm, setAccessForm] = useState<{ reason: string; expiresAt: string }>({
    reason: '',
    expiresAt: '',
  });
  const [targetTenant, setTargetTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, [pagination.page]);

  useEffect(() => {
    loadAccessData();
  }, []);

  // Filter dan sort tenants
  const filteredAndSortedTenants = useMemo(() => {
    let filtered = [...allTenants];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tenant) =>
          tenant.npsn?.toLowerCase().includes(query) ||
          tenant.name?.toLowerCase().includes(query) ||
          tenant.email?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortConfig?.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Tenant];
        const bValue = b[sortConfig.key as keyof Tenant];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allTenants, searchQuery, sortConfig]);

  // Paginate filtered results
  const paginatedTenants = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredAndSortedTenants.slice(start, end);
  }, [filteredAndSortedTenants, pagination.page, pagination.limit]);

  // Update pagination when filtered results change
  useEffect(() => {
    const totalPages = Math.ceil(filteredAndSortedTenants.length / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total: filteredAndSortedTenants.length,
      totalPages: totalPages || 1,
      page: prev.page > totalPages && totalPages > 0 ? 1 : prev.page,
    }));
  }, [filteredAndSortedTenants.length, pagination.limit]);

  // Update tenants when paginated results change
  useEffect(() => {
    setTenants(paginatedTenants);
  }, [paginatedTenants]);

  const tenantAccessMap = useMemo(() => {
    const map: Record<number, { grant?: TenantAccessRecord; pending?: TenantAccessRecord; lastResponse?: TenantAccessRecord }> = {};

    activeGrants.forEach((grant) => {
      map[grant.tenantId] = {
        ...(map[grant.tenantId] || {}),
        grant,
      };
    });

    accessRequests.forEach((request) => {
      const entry = map[request.tenantId] || {};
      if (request.status === 'pending') {
        entry.pending = request;
      } else if (['rejected', 'revoked', 'expired', 'cancelled'].includes(request.status)) {
        if (!entry.lastResponse || new Date(request.updatedAt) > new Date(entry.lastResponse.updatedAt)) {
          entry.lastResponse = request;
        }
      }
      map[request.tenantId] = entry;
    });

    return map;
  }, [accessRequests, activeGrants]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllTenants({
        page: 1,
        limit: 1000, // Load all for client-side filtering
      });
      setAllTenants(response.data.data);
      setPagination({
        page: 1,
        limit: 20,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / 20),
      });
    } catch (err: any) {
      console.error('Error loading tenants:', err);
      showError(err?.response?.data?.message || 'Gagal memuat data tenants');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessData = async () => {
    try {
      const [requests, grants] = await Promise.all([
        tenantAccessApi.getSuperAdminRequests(),
        tenantAccessApi.getSuperAdminGrants(),
      ]);
      setAccessRequests(requests);
      setActiveGrants(grants);
    } catch (err: any) {
      console.error('Error loading tenant access data:', err);
      showError(err?.response?.data?.message || 'Gagal memuat data akses tenant');
    }
  };

  const handleCreate = () => {
    setEditingTenant(null);
    setFormData({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      ...tenant,
      settings: tenant.settings ? JSON.stringify(tenant.settings, null, 2) : '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.npsn?.trim()) {
      errors.npsn = 'NPSN wajib diisi';
    } else if (formData.npsn.length < 8) {
      errors.npsn = 'NPSN harus minimal 8 karakter';
    }

    if (!formData.name?.trim()) {
      errors.name = 'Nama wajib diisi';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    // Validate settings JSON if provided
    if (formData.settings && typeof formData.settings === 'string') {
      try {
        JSON.parse(formData.settings);
      } catch {
        errors.settings = 'Format JSON tidak valid';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...formData };

      // Parse settings JSON if it's a string
      if (dataToSave.settings && typeof dataToSave.settings === 'string') {
        try {
          dataToSave.settings = JSON.parse(dataToSave.settings);
        } catch {
          showError('Format JSON settings tidak valid');
          setSaving(false);
          return;
        }
      }

      if (editingTenant) {
        await adminApi.updateTenant(editingTenant.id, dataToSave);
        success('Tenant berhasil diperbarui');
      } else {
        await adminApi.createTenant(dataToSave);
        success('Tenant berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadTenants();
    } catch (err: any) {
      console.error('Error saving tenant:', err);
      showError(err?.response?.data?.message || 'Gagal menyimpan tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm('Yakin ingin mengaktifkan tenant ini?')) return;
    try {
      await adminApi.activateTenant(id);
      success('Tenant berhasil diaktifkan');
      loadTenants();
    } catch (err: any) {
      console.error('Error activating tenant:', err);
      showError(err?.response?.data?.message || 'Gagal mengaktifkan tenant');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Yakin ingin menonaktifkan tenant ini?')) return;
    try {
      await adminApi.deactivateTenant(id);
      success('Tenant berhasil dinonaktifkan');
      loadTenants();
    } catch (err: any) {
      console.error('Error deactivating tenant:', err);
      showError(err?.response?.data?.message || 'Gagal menonaktifkan tenant');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus tenant ini? Tindakan ini tidak dapat dibatalkan!')) return;
    try {
      await adminApi.deleteTenant(id);
      success('Tenant berhasil dihapus');
      loadTenants();
    } catch (err: any) {
      console.error('Error deleting tenant:', err);
      showError(err?.response?.data?.message || 'Gagal menghapus tenant');
    }
  };

  const handleOpenAccessModal = (tenant: Tenant) => {
    setTargetTenant(tenant);
    setAccessForm({
      reason: '',
      expiresAt: '',
    });
    setAccessError('');
    setAccessModalOpen(true);
  };

  const handleSubmitAccessRequest = async () => {
    if (!targetTenant) return;
    if (!accessForm.reason.trim()) {
      setAccessError('Alasan permintaan wajib diisi');
      return;
    }

    try {
      setAccessSubmitting(true);
      await tenantAccessApi.createAccessRequest({
        tenantId: targetTenant.id,
        reason: accessForm.reason.trim(),
        expiresAt: accessForm.expiresAt ? new Date(accessForm.expiresAt).toISOString() : undefined,
      });
      success('Permintaan akses dikirim ke admin tenant');
      setAccessModalOpen(false);
      loadAccessData();
    } catch (err: any) {
      console.error('Error submitting access request:', err);
      showError(err?.response?.data?.message || 'Gagal mengirim permintaan akses');
    } finally {
      setAccessSubmitting(false);
    }
  };

  const handleCancelAccessRequest = async (requestId: number) => {
    if (!confirm('Batalkan permintaan akses ini?')) return;
    try {
      await tenantAccessApi.cancelAccessRequest(requestId);
      success('Permintaan akses dibatalkan');
      loadAccessData();
    } catch (err: any) {
      console.error('Error cancelling access request:', err);
      showError(err?.response?.data?.message || 'Gagal membatalkan permintaan akses');
    }
  };

  const handleEnterTenant = (tenant: Tenant, grant: TenantAccessRecord) => {
    const identifier = tenant.npsn || tenant.id?.toString();
    if (!identifier) {
      showError('Tenant tidak memiliki identifier yang valid');
      return;
    }

    const params = new URLSearchParams({
      delegated: '1',
      tenantId: tenant.id.toString(),
    });
    if (tenant.name) {
      params.set('tenantName', tenant.name);
    }
    if (grant.expiresAt) {
      params.set('expiresAt', grant.expiresAt);
    }
    const url = `/${identifier}/dashboard?${params.toString()}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig?.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manajemen Tenants
            </h1>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Tenant
            </Button>
          </div>
          <p className="text-gray-600">Kelola semua tenant yang terdaftar di sistem</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
            <SearchInput
              placeholder="Cari berdasarkan NPSN, Nama, atau Email..."
              onSearch={setSearchQuery}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {tenants.length === 0 ? (
            <EmptyState
              title="Tidak ada tenant"
              description={
                searchQuery
                  ? `Tidak ada tenant yang sesuai dengan pencarian "${searchQuery}"`
                  : 'Belum ada tenant yang terdaftar. Klik tombol "Tambah Tenant" untuk menambahkan tenant baru.'
              }
              action={
                !searchQuery && (
                  <Button onClick={handleCreate}>Tambah Tenant Pertama</Button>
                )
              }
            />
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <SortableTableHead
                      sortKey="npsn"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      NPSN
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="name"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Nama
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="email"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Email
                    </SortableTableHead>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telepon
                    </th>
                    <SortableTableHead
                      sortKey="isActive"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Status
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="createdAt"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Tanggal Dibuat
                    </SortableTableHead>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akses Super Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => {
                    const accessInfo = tenantAccessMap[tenant.id] || {};
                    const grant = accessInfo.grant;
                    const pending = accessInfo.pending;
                    const lastResponse = accessInfo.lastResponse;
                    return (
                      <tr key={tenant.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tenant.npsn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                            tenant.isActive
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}
                        >
                          {tenant.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grant ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 font-semibold">Akses Aktif</span>
                            {grant.expiresAt ? (
                              <span className="text-xs text-gray-500">
                                Berlaku sampai {formatDate(grant.expiresAt)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Tanpa batas kedaluwarsa</span>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleEnterTenant(tenant, grant)}
                              className="mt-1"
                            >
                              Masuk sebagai Tenant
                            </Button>
                          </div>
                        ) : pending ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-amber-600 font-semibold">Menunggu Persetujuan</span>
                            <span className="text-xs text-gray-500">
                              Diajukan {formatDate(pending.requestedAt)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAccessRequest(pending.id)}
                            >
                              Batalkan Permintaan
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleOpenAccessModal(tenant)}>
                              Ajukan Akses
                            </Button>
                            {lastResponse && lastResponse.status === 'rejected' && (
                              <span className="text-xs text-red-500">
                                Ditolak: {lastResponse.rejectionReason || 'Tidak ada alasan'}
                              </span>
                            )}
                            {lastResponse && ['revoked', 'expired'].includes(lastResponse.status) && (
                              <span className="text-xs text-gray-500">
                                {lastResponse.status === 'revoked' ? 'Akses dicabut' : 'Akses kedaluwarsa'} pada{' '}
                                {formatDate(lastResponse.updatedAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(tenant)}
                          >
                            Edit
                          </Button>
                          {tenant.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(tenant.id)}
                            >
                              Nonaktifkan
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(tenant.id)}
                            >
                              Aktifkan
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(tenant.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium">
              Menampilkan <span className="font-bold text-blue-600">{tenants.length}</span> dari <span className="font-bold text-purple-600">{pagination.total}</span> tenant
              {searchQuery && ` (dari ${allTenants.length} total)`}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                className="disabled:opacity-50"
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                className="disabled:opacity-50"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !saving && setIsModalOpen(false)}
          title={editingTenant ? 'Edit Tenant' : 'Tambah Tenant'}
        >
          <div className="space-y-4">
            <Input
              label="NPSN"
              value={formData.npsn || ''}
              onChange={(e) => {
                setFormData({ ...formData, npsn: e.target.value });
                if (formErrors.npsn) {
                  setFormErrors({ ...formErrors, npsn: '' });
                }
              }}
              error={formErrors.npsn}
              required
            />
            <Input
              label="Nama"
              value={formData.name || ''}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: '' });
                }
              }}
              error={formErrors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: '' });
                }
              }}
              error={formErrors.email}
              required
            />
            <Input
              label="Telepon"
              value={formData.phone || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Input
              label="Alamat"
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
                disabled={saving}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Aktif
              </label>
            </div>
            <Textarea
              label="Settings (JSON)"
              value={
                typeof formData.settings === 'string'
                  ? formData.settings
                  : formData.settings
                  ? JSON.stringify(formData.settings, null, 2)
                  : ''
              }
              onChange={(e) =>
                setFormData({ ...formData, settings: e.target.value })
              }
              error={formErrors.settings}
              placeholder='{"key": "value"}'
              rows={6}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={accessModalOpen}
          onClose={() => !accessSubmitting && setAccessModalOpen(false)}
          title={targetTenant ? `Ajukan Akses ke ${targetTenant.name}` : 'Ajukan Akses Tenant'}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Permintaan akses akan dikirim ke admin tenant terkait untuk disetujui. Sertakan alasan dan, jika perlu, batas waktu akses.
            </p>
            <Textarea
              label="Alasan Permintaan"
              value={accessForm.reason}
              onChange={(e) => {
                setAccessForm({ ...accessForm, reason: e.target.value });
                setAccessError('');
              }}
              placeholder="Contoh: Perlu membantu konfigurasi modul pembayaran"
              rows={4}
              required
              error={accessError}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Waktu Akses (opsional)
              </label>
              <Input
                type="datetime-local"
                value={accessForm.expiresAt}
                onChange={(e) => setAccessForm({ ...accessForm, expiresAt: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Biarkan kosong jika akses tidak memiliki batas waktu otomatis.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setAccessModalOpen(false)}
                disabled={accessSubmitting}
              >
                Batal
              </Button>
              <Button onClick={handleSubmitAccessRequest} disabled={accessSubmitting}>
                {accessSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

