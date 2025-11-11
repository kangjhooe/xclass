'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { financeApi, SPP, SPPCreateData } from '@/lib/api/finance';
import { studentsApi } from '@/lib/api/students';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function FinancePage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSPP, setSelectedSPP] = useState<SPP | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<SPPCreateData>({
    studentId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    dueDate: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['spp', resolvedTenantId, currentPage],
    queryFn: () => financeApi.getAllSPP(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', resolvedTenantId],
    queryFn: () => studentsApi.getAll(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: SPPCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createSPP(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ id, paidDate }: { id: number; paidDate: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.paySPP(resolvedTenantId, id, paidDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      dueDate: '',
      notes: '',
    });
    setSelectedSPP(null);
  };

  const handleEdit = (spp: SPP) => {
    setSelectedSPP(spp);
    setFormData({
      studentId: spp.studentId,
      month: spp.month,
      year: spp.year,
      amount: spp.amount,
      dueDate: spp.dueDate,
      notes: spp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    createMutation.mutate(formData);
  };

  const handlePay = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    const paidDate = prompt('Masukkan tanggal pembayaran (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (paidDate) {
      payMutation.mutate({ id, paidDate });
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    console.log(`Exporting to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const totalPages = data ? Math.ceil((data.total || 0) / itemsPerPage) : 1;
  const paginatedData = data?.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Belum Lunas', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Terlambat', className: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">SPP / Keuangan</h1>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="spp" />
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Tambah SPP
            </Button>
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
                    <TableHead>Siswa</TableHead>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((spp) => (
                    <TableRow key={spp.id}>
                      <TableCell className="font-medium">
                        {spp.student?.name || `Siswa #${spp.studentId}`}
                      </TableCell>
                      <TableCell>{MONTHS[spp.month - 1]}</TableCell>
                      <TableCell>{spp.year}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          Rp {spp.amount.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(spp.dueDate)}</TableCell>
                      <TableCell>{spp.paidDate ? formatDate(spp.paidDate) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(spp.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {spp.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePay(spp.id)}
                            >
                              Bayar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(spp)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Tidak ada data SPP
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
          title={selectedSPP ? 'Edit SPP' : 'Tambah SPP'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="0">Pilih Siswa</option>
                  {studentsData?.data?.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {MONTHS.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jatuh Tempo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                loading={createMutation.isPending}
              >
                Simpan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

