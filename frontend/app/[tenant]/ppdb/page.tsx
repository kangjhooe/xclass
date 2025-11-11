'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { ppdbApi, PpdbApplication, PpdbApplicationCreateData } from '@/lib/api/ppdb';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function PPDBPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PpdbApplication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [formData, setFormData] = useState<PpdbApplicationCreateData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    parentName: '',
    parentPhone: '',
    previousSchool: '',
    desiredClass: '',
    notes: '',
  });
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ppdb', resolvedTenantId, currentPage, searchQuery, filterStatus],
    queryFn: () => ppdbApi.getAll(resolvedTenantId!, { 
      page: currentPage, 
      limit: itemsPerPage,
      search: searchQuery || undefined,
      status: filterStatus || undefined,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: PpdbApplicationCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.create(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Pendaftaran berhasil ditambahkan');
    },
    onError: () => {
      showError('Gagal menambahkan pendaftaran');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PpdbApplicationCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.update(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      setIsModalOpen(false);
      setSelectedApplication(null);
      resetForm();
      success('Pendaftaran berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate pendaftaran');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.approve(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      success('Pendaftaran berhasil disetujui');
    },
    onError: () => {
      showError('Gagal menyetujui pendaftaran');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.reject(resolvedTenantId, id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      success('Pendaftaran berhasil ditolak');
    },
    onError: () => {
      showError('Gagal menolak pendaftaran');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.delete(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      success('Pendaftaran berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus pendaftaran');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      birthPlace: '',
      address: '',
      parentName: '',
      parentPhone: '',
      previousSchool: '',
      desiredClass: '',
      notes: '',
    });
    setSelectedApplication(null);
  };

  const handleEdit = (application: PpdbApplication) => {
    setSelectedApplication(application);
    setFormData({
      name: application.name,
      email: application.email || '',
      phone: application.phone || '',
      birthDate: application.birthDate || '',
      birthPlace: application.birthPlace || '',
      address: application.address || '',
      parentName: application.parentName || '',
      parentPhone: application.parentPhone || '',
      previousSchool: application.previousSchool || '',
      desiredClass: application.desiredClass || '',
      notes: application.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedApplication) {
      updateMutation.mutate({ id: selectedApplication.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleApprove = (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menyetujui pendaftaran ini?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    const reason = prompt('Alasan penolakan (opsional):');
    if (confirm('Apakah Anda yakin ingin menolak pendaftaran ini?')) {
      rejectMutation.mutate({ id, reason: reason || undefined });
    }
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus pendaftaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    console.log(`Exporting to ${format}...`);
    success(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      registered: { label: 'Terdaftar', className: 'bg-blue-100 text-blue-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const totalPages = data ? Math.ceil((data.total || 0) / itemsPerPage) : 1;
  const paginatedData = data?.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">PPDB / SPMB</h1>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="ppdb" />
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Tambah Pendaftaran
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="Cari pendaftar..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="registered">Terdaftar</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Tanggal Lahir</TableHead>
                    <TableHead>Kelas yang Diinginkan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell>{application.email || '-'}</TableCell>
                      <TableCell>{application.phone || '-'}</TableCell>
                      <TableCell>{application.birthDate ? formatDate(application.birthDate) : '-'}</TableCell>
                      <TableCell>{application.desiredClass || '-'}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(application.id)}
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(application.id)}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(application)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(application.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data pendaftaran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedApplication ? 'Edit Pendaftaran' : 'Tambah Pendaftaran'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Orang Tua</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sekolah Sebelumnya</label>
                  <input
                    type="text"
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas yang Diinginkan</label>
                  <input
                    type="text"
                    value={formData.desiredClass}
                    onChange={(e) => setFormData({ ...formData, desiredClass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedApplication ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

