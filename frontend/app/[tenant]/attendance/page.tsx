'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { attendanceApi, Attendance, AttendanceCreateData } from '@/lib/api/attendance';
import { studentsApi } from '@/lib/api/students';
import { schedulesApi } from '@/lib/api/schedules';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function AttendancePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterClassId, setFilterClassId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<AttendanceCreateData>({
    studentId: 0,
    scheduleId: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', tenantId, filterDate, filterClassId],
    queryFn: () => attendanceApi.getAll(tenantId!, { date: filterDate }),
    enabled: !!tenantId,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: schedulesData } = useQuery({
    queryKey: ['schedules', tenantId],
    queryFn: () => schedulesApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: AttendanceCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return attendanceApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return attendanceApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', tenantId] });
      setIsModalOpen(false);
      setSelectedAttendance(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return attendanceApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      scheduleId: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      notes: '',
    });
    setSelectedAttendance(null);
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      studentId: attendance.studentId,
      scheduleId: attendance.scheduleId,
      date: attendance.date,
      status: attendance.status,
      notes: attendance.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedAttendance) {
      updateMutation.mutate({ id: selectedAttendance.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      present: { label: 'Hadir', className: 'bg-green-100 text-green-800' },
      absent: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-800' },
      late: { label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800' },
      excused: { label: 'Izin', className: 'bg-blue-100 text-blue-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const totalAttendance = data?.data?.length || 0;
  const presentCount = data?.data?.filter((a) => a.status === 'present').length || 0;
  const absentCount = data?.data?.filter((a) => a.status === 'absent').length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="attendance"
        title="Data Absensi"
        description="Kelola data absensi siswa"
        actions={({ themeConfig }) => (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className={themeConfig.primaryButton}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Absensi
          </Button>
        )}
        stats={[
          {
            label: 'Total Absensi',
            value: totalAttendance,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Hadir',
            value: presentCount,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ),
          },
          {
            label: 'Tidak Hadir',
            value: absentCount,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                  <select
                    value={filterClassId || ''}
                    onChange={(e) => setFilterClassId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Kelas</option>
                    {schedulesData?.data?.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.classRoom?.name || schedule.subject?.name || `Jadwal ${schedule.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterDate(new Date().toISOString().split('T')[0]);
                      setFilterClassId(undefined);
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
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 border-b-2 border-white/20">
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Siswa</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Mata Pelajaran</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Tanggal</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Catatan</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((attendance, index) => (
                        <TableRow 
                          key={attendance.id} 
                          className={`transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                          } hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                        >
                          <TableCell>{formatDate(attendance.date)}</TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {attendance.student?.name || `Siswa #${attendance.studentId}`}
                          </TableCell>
                          <TableCell>
                            {attendance.schedule?.subject?.name || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                          <TableCell>{attendance.notes || '-'}</TableCell>
                          <TableCell>
                            {attendance.teacher?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(attendance)}
                                className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(attendance.id)}
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
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Tidak ada data absensi</p>
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
              title={selectedAttendance ? 'Edit Absensi' : 'Tambah Absensi'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option value="">Pilih Siswa</option>
                      {studentsData?.data?.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jadwal <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.scheduleId}
                      onChange={(e) => setFormData({ ...formData, scheduleId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Jadwal</option>
                      {schedulesData?.data?.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.classRoom?.name || schedule.subject?.name || `Jadwal ${schedule.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AttendanceCreateData['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="present">Hadir</option>
                      <option value="absent">Tidak Hadir</option>
                      <option value="late">Terlambat</option>
                      <option value="excused">Izin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Opsional"
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
                    loading={createMutation.isPending || updateMutation.isPending}
                    className={themeConfig.primaryButton}
                  >
                    {selectedAttendance ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

