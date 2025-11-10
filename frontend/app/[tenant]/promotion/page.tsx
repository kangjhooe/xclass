'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { promotionApi, Promotion, PromotionCreateData } from '@/lib/api/promotion';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function PromotionPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenant as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<PromotionCreateData>({
    academic_year_id: 0,
    from_class_id: 0,
    to_class_id: 0,
    student_id: 0,
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['promotions', tenantId],
    queryFn: () => promotionApi.getAll(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: PromotionCreateData) => promotionApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => promotionApi.approve(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => promotionApi.reject(tenantId, id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      academic_year_id: 0,
      from_class_id: 0,
      to_class_id: 0,
      student_id: 0,
      notes: '',
    });
    setSelectedPromotion(null);
  };

  const filteredData = data?.data?.filter((promotion) => {
    if (filterStatus !== 'all' && promotion.status !== filterStatus) return false;
    return true;
  }) || [];

  const totalPromotions = data?.data?.length || 0;
  const pendingCount = data?.data?.filter((p) => p.status === 'pending').length || 0;
  const approvedCount = data?.data?.filter((p) => p.status === 'approved').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Kenaikan Kelas
              </h1>
              <p className="text-gray-600">Manajemen proses kenaikan kelas siswa</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajukan Kenaikan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pengajuan</p>
                <p className="text-3xl font-bold text-blue-600">{totalPromotions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Persetujuan</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-gray-700">Siswa</TableHead>
                    <TableHead className="font-semibold text-gray-700">Dari Kelas</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ke Kelas</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tahun Pelajaran</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((promotion) => (
                    <TableRow key={promotion.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{promotion.student_name || '-'}</TableCell>
                      <TableCell>{promotion.from_class_name || '-'}</TableCell>
                      <TableCell>{promotion.to_class_name || '-'}</TableCell>
                      <TableCell>{promotion.academic_year_name || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          promotion.status === 'approved' 
                            ? 'bg-green-500 text-white' 
                            : promotion.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}>
                          {promotion.status === 'pending' ? 'Menunggu' :
                           promotion.status === 'approved' ? 'Disetujui' :
                           promotion.status === 'rejected' ? 'Ditolak' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {promotion.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveMutation.mutate(promotion.id)}
                                className="hover:bg-green-50 hover:border-green-300 transition-colors"
                                loading={approveMutation.isPending}
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt('Alasan penolakan:');
                                  if (reason) {
                                    rejectMutation.mutate({ id: promotion.id, reason });
                                  }
                                }}
                                className="hover:bg-red-600 transition-colors"
                                loading={rejectMutation.isPending}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
                                deleteMutation.mutate(promotion.id);
                              }
                            }}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada pengajuan kenaikan kelas</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Ajukan Kenaikan Kelas"
          size="md"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.academic_year_id}
                onChange={(e) => setFormData({ ...formData, academic_year_id: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dari Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.from_class_id}
                onChange={(e) => setFormData({ ...formData, from_class_id: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ke Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.to_class_id}
                onChange={(e) => setFormData({ ...formData, to_class_id: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
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
                Ajukan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}
