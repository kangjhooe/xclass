'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { counselingApi, CounselingSession, CounselingSessionCreateData } from '@/lib/api/counseling';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { studentsApi } from '@/lib/api/students';
import { teachersApi } from '@/lib/api/teachers';
import { useToastStore } from '@/lib/store/toast';

export default function CounselingPage() {
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [filters, setFilters] = useState({
    studentId: '',
    counselorId: '',
    status: 'all',
    startDate: '',
    endDate: '',
    search: '',
  });
  const getDefaultDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<CounselingSessionCreateData>({
    studentId: 0,
    counselorId: undefined,
    sessionDate: getDefaultDateTime(),
    issue: '',
    notes: '',
    status: 'scheduled',
    followUp: '',
    followUpDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const queryClient = useQueryClient();

  // Fetch students and teachers for dropdowns
  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!, { limit: 1000 }),
    enabled: !!tenantId,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', tenantId],
    queryFn: () => teachersApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['counseling-sessions', tenantId, filters, currentPage],
    queryFn: () =>
      counselingApi.getAll(tenantId!, {
        studentId: filters.studentId ? Number(filters.studentId) : undefined,
        counselorId: filters.counselorId ? Number(filters.counselorId) : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined,
        page: currentPage,
        limit,
      }),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CounselingSessionCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return counselingApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling-sessions', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Sesi konseling berhasil dibuat');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat sesi konseling';
      showError(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CounselingSessionCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return counselingApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling-sessions', tenantId] });
      setIsEditModalOpen(false);
      setSelectedSession(null);
      resetForm();
      success('Sesi konseling berhasil diperbarui');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui sesi konseling';
      showError(errorMessage);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return counselingApi.updateStatus(tenantId, id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling-sessions', tenantId] });
      success('Status sesi konseling berhasil diperbarui');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui status';
      showError(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return counselingApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counseling-sessions', tenantId] });
      success('Sesi konseling berhasil dihapus');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus sesi konseling';
      showError(errorMessage);
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      counselorId: undefined,
      sessionDate: getDefaultDateTime(),
      issue: '',
      notes: '',
      status: 'scheduled',
      followUp: '',
      followUpDate: '',
    });
    setSelectedSession(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (session: CounselingSession) => {
    setSelectedSession(session);
    const formatDateTimeLocal = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch {
        return '';
      }
    };
    setFormData({
      studentId: session.studentId,
      counselorId: session.counselorId,
      sessionDate: formatDateTimeLocal(session.sessionDate),
      issue: session.issue || '',
      notes: session.notes || '',
      status: session.status as any,
      followUp: session.followUp || '',
      followUpDate: formatDateTimeLocal(session.followUpDate),
    });
    setIsEditModalOpen(true);
  };

  const handleView = (session: CounselingSession) => {
    setSelectedSession(session);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi konseling ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: string, currentStatus: string) => {
    if (status === currentStatus) return;
    
    const statusLabels: Record<string, string> = {
      scheduled: 'Terjadwal',
      in_progress: 'Berlangsung',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    
    if (confirm(`Apakah Anda yakin ingin mengubah status menjadi "${statusLabels[status]}"?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'in_progress':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Terjadwal';
      case 'in_progress':
        return 'Berlangsung';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const totalSessions = sessionsData?.total || 0;
  const scheduledCount = sessionsData?.data?.filter((s) => s.status === 'scheduled').length || 0;
  const completedCount = sessionsData?.data?.filter((s) => s.status === 'completed').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Konseling
              </h1>
              <p className="text-gray-600">Manajemen sesi konseling siswa</p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Sesi Baru
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sesi</p>
                <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terjadwal</p>
                <p className="text-3xl font-bold text-yellow-600">{scheduledCount}</p>
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
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Cari masalah, catatan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
              <select
                value={filters.studentId}
                onChange={(e) => {
                  setFilters({ ...filters, studentId: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konselor</label>
              <select
                value={filters.counselorId}
                onChange={(e) => {
                  setFilters({ ...filters, counselorId: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua</option>
                {teachersData?.data?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="scheduled">Terjadwal</option>
                <option value="in_progress">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
                    <TableHead className="font-semibold text-gray-700">Konselor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Sesi</TableHead>
                    <TableHead className="font-semibold text-gray-700">Masalah</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsData?.data?.map((session) => (
                    <TableRow key={session.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        {session.student?.name || `ID: ${session.studentId}`}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {session.counselor?.name || session.counselorId ? `ID: ${session.counselorId}` : '-'}
                      </TableCell>
                      <TableCell>{formatDateTime(session.sessionDate)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={session.issue}>
                          {session.issue}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={session.status}
                          onChange={(e) => handleStatusChange(session.id, e.target.value, session.status)}
                          className={`px-3 py-1 text-xs font-bold rounded-full border-0 ${getStatusColor(session.status)}`}
                        >
                          <option value="scheduled">Terjadwal</option>
                          <option value="in_progress">Berlangsung</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(session)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Lihat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(session)}
                            className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(session.id)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessionsData?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada sesi konseling</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {sessionsData && sessionsData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, sessionsData.total)} dari {sessionsData.total}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(sessionsData.totalPages, p + 1))}
                    disabled={currentPage === sessionsData.totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Sesi Konseling Baru"
          size="lg"
        >
            <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tenantId) {
                alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                return;
              }
              // Convert datetime-local to ISO string
              const submitData = {
                ...formData,
                sessionDate: formData.sessionDate ? new Date(formData.sessionDate).toISOString() : '',
                followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
              };
              createMutation.mutate(submitData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konselor</label>
              <select
                value={formData.counselorId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    counselorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Konselor (Opsional)</option>
                {teachersData?.data?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal & Waktu Sesi <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="in_progress">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tindak Lanjut</label>
              <textarea
                value={formData.followUp}
                onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tindak Lanjut</label>
              <input
                type="datetime-local"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
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
              <Button type="submit" loading={createMutation.isPending}>
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
          }}
          title="Edit Sesi Konseling"
          size="lg"
        >
            <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tenantId || !selectedSession) {
                alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                return;
              }
              // Convert datetime-local to ISO string
              const submitData = {
                ...formData,
                sessionDate: formData.sessionDate ? new Date(formData.sessionDate).toISOString() : undefined,
                followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : (formData.followUpDate === '' ? null : undefined),
              };
              updateMutation.mutate({ id: selectedSession.id, data: submitData });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konselor</label>
              <select
                value={formData.counselorId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    counselorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Konselor (Opsional)</option>
                {teachersData?.data?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal & Waktu Sesi <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="in_progress">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tindak Lanjut</label>
              <textarea
                value={formData.followUp}
                onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tindak Lanjut</label>
              <input
                type="datetime-local"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSession(null);
          }}
          title="Detail Sesi Konseling"
          size="lg"
        >
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Siswa</p>
                  <p className="font-semibold text-gray-800">
                    {selectedSession.student?.name || `ID: ${selectedSession.studentId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Konselor</p>
                  <p className="font-semibold text-gray-800">
                    {selectedSession.counselor?.name || selectedSession.counselorId ? `ID: ${selectedSession.counselorId}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Sesi</p>
                  <p className="font-semibold text-gray-800">{formatDateTime(selectedSession.sessionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${getStatusColor(selectedSession.status)}`}>
                    {getStatusLabel(selectedSession.status)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Masalah</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedSession.issue}</p>
                </div>
              </div>
              {selectedSession.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Catatan</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedSession.notes}</p>
                  </div>
                </div>
              )}
              {selectedSession.followUp && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tindak Lanjut</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedSession.followUp}</p>
                  </div>
                </div>
              )}
              {selectedSession.followUpDate && (
                <div>
                  <p className="text-sm text-gray-600">Tanggal Tindak Lanjut</p>
                  <p className="font-semibold text-gray-800">{formatDateTime(selectedSession.followUpDate)}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Dibuat</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedSession.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diperbarui</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedSession.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}

