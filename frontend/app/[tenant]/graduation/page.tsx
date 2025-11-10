'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { graduationApi, Graduation, GraduationCreateData } from '@/lib/api/graduation';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function GraduationPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenant as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGraduation, setSelectedGraduation] = useState<Graduation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<GraduationCreateData>({
    academic_year_id: 0,
    student_id: 0,
    class_id: undefined,
    graduation_date: '',
    certificate_number: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['graduations', tenantId],
    queryFn: () => graduationApi.getAll(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: GraduationCreateData) => graduationApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduations', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => graduationApi.approve(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduations', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => graduationApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduations', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      academic_year_id: 0,
      student_id: 0,
      class_id: undefined,
      graduation_date: '',
      certificate_number: '',
      notes: '',
    });
    setSelectedGraduation(null);
  };

  const filteredData = data?.data?.filter((graduation) => {
    if (filterStatus !== 'all' && graduation.status !== filterStatus) return false;
    return true;
  }) || [];

  const totalGraduations = data?.data?.length || 0;
  const pendingCount = data?.data?.filter((g) => g.status === 'pending').length || 0;
  const graduatedCount = data?.data?.filter((g) => g.status === 'graduated').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Kelulusan
              </h1>
              <p className="text-gray-600">Manajemen kelulusan siswa</p>
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
              Tambah Kelulusan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kelulusan</p>
                <p className="text-3xl font-bold text-blue-600">{totalGraduations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
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
                <p className="text-sm text-gray-600 mb-1">Sudah Lulus</p>
                <p className="text-3xl font-bold text-green-600">{graduatedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <option value="graduated">Sudah Lulus</option>
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
                    <TableHead className="font-semibold text-gray-700">NIS</TableHead>
                    <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tahun Pelajaran</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Lulus</TableHead>
                    <TableHead className="font-semibold text-gray-700">No. Sertifikat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((graduation) => (
                    <TableRow key={graduation.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{graduation.student_name || '-'}</TableCell>
                      <TableCell>{graduation.student_nis || '-'}</TableCell>
                      <TableCell>{graduation.class_name || '-'}</TableCell>
                      <TableCell>{graduation.academic_year_name || '-'}</TableCell>
                      <TableCell>{graduation.graduation_date ? formatDate(graduation.graduation_date) : '-'}</TableCell>
                      <TableCell>{graduation.certificate_number || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          graduation.status === 'graduated' 
                            ? 'bg-green-500 text-white' 
                            : graduation.status === 'approved'
                            ? 'bg-blue-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}>
                          {graduation.status === 'pending' ? 'Menunggu' :
                           graduation.status === 'approved' ? 'Disetujui' :
                           graduation.status === 'graduated' ? 'Sudah Lulus' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {graduation.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveMutation.mutate(graduation.id)}
                              className="hover:bg-green-50 hover:border-green-300 transition-colors"
                              loading={approveMutation.isPending}
                            >
                              Setujui
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus data kelulusan ini?')) {
                                deleteMutation.mutate(graduation.id);
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
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada data kelulusan</p>
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
          title="Tambah Kelulusan"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <input
                type="number"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kelulusan</label>
              <input
                type="date"
                value={formData.graduation_date}
                onChange={(e) => setFormData({ ...formData, graduation_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Sertifikat</label>
              <input
                type="text"
                value={formData.certificate_number}
                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Simpan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}
