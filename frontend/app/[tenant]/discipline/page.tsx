'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  disciplineApi,
  DisciplinaryAction,
  DisciplinaryActionCreateData,
} from '@/lib/api/discipline';
import { studentsApi } from '@/lib/api/students';
import { teachersApi } from '@/lib/api/teachers';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function DisciplinePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DisciplinaryAction | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSanctionType, setFilterSanctionType] = useState<string>('');
  const [filterStudentId, setFilterStudentId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<DisciplinaryActionCreateData>({
    studentId: 0,
    reporterId: undefined,
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    sanctionType: 'warning',
    sanctionDetails: '',
    status: 'pending',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      'discipline',
      tenantId,
      filterStatus,
      filterSanctionType,
      filterStudentId,
      currentPage,
    ],
    queryFn: () =>
      disciplineApi.getAll(tenantId!, {
        status: filterStatus || undefined,
        sanctionType: filterSanctionType || undefined,
        studentId: filterStudentId,
        page: currentPage,
        limit: 20,
      }),
    enabled: !!tenantId,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', tenantId],
    queryFn: () => teachersApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: DisciplinaryActionCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return disciplineApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DisciplinaryActionCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return disciplineApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui tindakan disiplin';
      alert(errorMessage);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return disciplineApi.updateStatus(tenantId, id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return disciplineApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      reporterId: undefined,
      incidentDate: new Date().toISOString().split('T')[0],
      description: '',
      sanctionType: 'warning',
      sanctionDetails: '',
      status: 'pending',
      notes: '',
    });
    setSelectedAction(null);
  };

  const handleViewDetail = (action: DisciplinaryAction) => {
    setFormData({
      studentId: 0,
      reporterId: undefined,
      incidentDate: new Date().toISOString().split('T')[0],
      description: '',
      sanctionType: 'warning',
      sanctionDetails: '',
      status: 'pending',
      notes: '',
    });
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleEdit = (action: DisciplinaryAction) => {
    setFormData({
      studentId: action.studentId,
      reporterId: action.reporterId,
      incidentDate: new Date(action.incidentDate).toISOString().split('T')[0],
      description: action.description,
      sanctionType: action.sanctionType,
      sanctionDetails: action.sanctionDetails || '',
      status: action.status,
      notes: action.notes || '',
    });
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (formData.studentId === 0) {
      alert('Pilih siswa terlebih dahulu.');
      return;
    }

    if (selectedAction && selectedAction.id) {
      // Edit mode
      updateMutation.mutate({ id: selectedAction.id, data: formData });
    } else {
      // Create mode
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus tindakan disiplin ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    if (confirm(`Apakah Anda yakin ingin mengubah status menjadi ${getStatusLabel(newStatus)}?`)) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getSanctionBadge = (sanctionType: string) => {
    const sanctionMap: Record<string, { label: string; className: string }> = {
      warning: { label: 'Peringatan', className: 'bg-yellow-100 text-yellow-800' },
      reprimand: { label: 'Teguran', className: 'bg-orange-100 text-orange-800' },
      suspension: { label: 'Skorsing', className: 'bg-red-100 text-red-800' },
      expulsion: { label: 'Dikeluarkan', className: 'bg-red-200 text-red-900' },
    };
    const sanctionInfo = sanctionMap[sanctionType] || {
      label: sanctionType,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${sanctionInfo.className}`}>
        {sanctionInfo.label}
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Menunggu',
      active: 'Aktif',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return statusMap[status] || status;
  };

  const totalActions = data?.total || 0;
  const pendingCount =
    data?.data?.filter((a) => a.status === 'pending').length || 0;
  const activeCount = data?.data?.filter((a) => a.status === 'active').length || 0;
  const completedCount =
    data?.data?.filter((a) => a.status === 'completed').length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="discipline"
        title="Kedisiplinan"
        description="Kelola tindakan disiplin siswa"
        actions={({ themeConfig }) => (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className={themeConfig.primaryButton}
          >
            <svg
              className="w-5 h-5 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Tindakan Disiplin
          </Button>
        )}
        stats={[
          {
            label: 'Total Tindakan',
            value: totalActions,
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            label: 'Menunggu',
            value: pendingCount,
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            label: 'Aktif',
            value: activeCount,
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            ),
          },
          {
            label: 'Selesai',
            value: completedCount,
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Sanksi
                  </label>
                  <select
                    value={filterSanctionType}
                    onChange={(e) => {
                      setFilterSanctionType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Jenis</option>
                    <option value="warning">Peringatan</option>
                    <option value="reprimand">Teguran</option>
                    <option value="suspension">Skorsing</option>
                    <option value="expulsion">Dikeluarkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Siswa
                  </label>
                  <select
                    value={filterStudentId || ''}
                    onChange={(e) => {
                      setFilterStudentId(
                        e.target.value ? parseInt(e.target.value) : undefined
                      );
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Siswa</option>
                    {studentsData?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} {student.nisn ? `(${student.nisn})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterStatus('');
                      setFilterSanctionType('');
                      setFilterStudentId(undefined);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-2xl border-2 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div
                  className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}
                ></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-b-2 border-white/20">
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Tanggal
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Siswa
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Deskripsi
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Jenis Sanksi
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">
                            Pelapor
                          </TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.data?.map((action, index) => (
                          <TableRow
                            key={action.id}
                            className={`transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                            } hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                          >
                            <TableCell className="font-medium text-gray-800">
                              {formatDate(action.incidentDate)}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800">
                              {action.student?.name || `Siswa #${action.studentId}`}
                              {action.student?.nisn && (
                                <span className="text-xs text-gray-500 block">
                                  NISN: {action.student.nisn}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={action.description}>
                                {action.description}
                              </div>
                              {action.sanctionDetails && (
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  {action.sanctionDetails}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getSanctionBadge(action.sanctionType)}</TableCell>
                            <TableCell>
                              <select
                                value={action.status}
                                onChange={(e) =>
                                  handleStatusChange(action.id, e.target.value)
                                }
                                className={`text-xs rounded-full px-2 py-1 border-0 font-medium cursor-pointer ${
                                  action.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : action.status === 'active'
                                    ? 'bg-blue-100 text-blue-800'
                                    : action.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                                disabled={updateStatusMutation.isPending}
                              >
                                <option value="pending">Menunggu</option>
                                <option value="active">Aktif</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              {action.reporter?.name || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetail(action)}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                  Detail
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(action)}
                                  className="hover:bg-green-50 hover:border-green-300 transition-colors"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(action.id)}
                                  className="hover:bg-red-600 transition-colors"
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {data?.data?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-gray-500 font-medium">
                                  Tidak ada data tindakan disiplin
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-600">
                      Halaman {currentPage} dari {data.totalPages} (Total: {data.total})
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      disabled={currentPage === data.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                )}
              </>
            )}

            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              title={
                selectedAction && selectedAction.id && formData.description
                  ? 'Edit Tindakan Disiplin'
                  : selectedAction && selectedAction.id
                  ? 'Detail Tindakan Disiplin'
                  : 'Tambah Tindakan Disiplin'
              }
              size="lg"
            >
              {selectedAction && selectedAction.id && !formData.description ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Siswa
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        {selectedAction.student?.name || `Siswa #${selectedAction.studentId}`}
                        {selectedAction.student?.nisn && (
                          <span className="text-xs text-gray-500 block">
                            NISN: {selectedAction.student.nisn}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pelapor
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        {selectedAction.reporter?.name || '-'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Kejadian
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      {formatDate(selectedAction.incidentDate)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi Pelanggaran
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                      {selectedAction.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Sanksi
                      </label>
                      <div className="px-3 py-2">
                        {getSanctionBadge(selectedAction.sanctionType)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="px-3 py-2">
                        {getStatusBadge(selectedAction.status)}
                      </div>
                    </div>
                  </div>

                  {selectedAction.sanctionDetails && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detail Sanksi
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                        {selectedAction.sanctionDetails}
                      </div>
                    </div>
                  )}

                  {selectedAction.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                        {selectedAction.notes}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div>Dibuat: {formatDate(selectedAction.createdAt)}</div>
                    <div>Diperbarui: {formatDate(selectedAction.updatedAt)}</div>
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
                      Tutup
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentId: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0">Pilih Siswa</option>
                      {studentsData?.data?.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} {student.nisn ? `(${student.nisn})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pelapor
                    </label>
                    <select
                      value={formData.reporterId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reporterId: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Pelapor (Opsional)</option>
                      {teachersData?.data?.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Kejadian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) =>
                        setFormData({ ...formData, incidentDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Sanksi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.sanctionType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sanctionType: e.target.value as DisciplinaryActionCreateData['sanctionType'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="warning">Peringatan</option>
                      <option value="reprimand">Teguran</option>
                      <option value="suspension">Skorsing</option>
                      <option value="expulsion">Dikeluarkan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Pelanggaran <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan pelanggaran yang dilakukan siswa..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Sanksi
                  </label>
                  <textarea
                    value={formData.sanctionDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, sanctionDetails: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detail sanksi yang diberikan (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as DisciplinaryActionCreateData['status'],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan tambahan (opsional)"
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
                    loading={selectedAction && selectedAction.id ? updateMutation.isPending : createMutation.isPending}
                    className={themeConfig.primaryButton}
                  >
                    {selectedAction && selectedAction.id ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
              )}
            </Modal>
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

