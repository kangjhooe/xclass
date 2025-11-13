'use client';

import { useMemo, useState } from 'react';
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
  const [filterScheduleId, setFilterScheduleId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<AttendanceCreateData['status'] | ''>('');
  const [formData, setFormData] = useState<AttendanceCreateData>({
    studentId: 0,
    scheduleId: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', tenantId, filterDate, filterScheduleId],
    queryFn: () => attendanceApi.getAll(tenantId!, { date: filterDate, scheduleId: filterScheduleId }),
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

  const filteredAttendances = useMemo(() => {
    if (!data?.data) {
      return [];
    }
    if (!filterStatus) {
      return data.data;
    }
    return data.data.filter((attendance) => attendance.status === filterStatus);
  }, [data?.data, filterStatus]);

  const { data: summaryData } = useQuery({
    queryKey: ['attendance-summary', tenantId, filterDate, filterScheduleId],
    queryFn: () =>
      attendanceApi.getSummary(tenantId!, {
        date: filterDate,
        scheduleId: filterScheduleId,
      }),
    enabled: !!tenantId,
  });

  const summaryFallback = {
    total: filteredAttendances.length,
    present: filteredAttendances.filter((a) => a.status === 'present').length,
    absent: filteredAttendances.filter((a) => a.status === 'absent').length,
    late: filteredAttendances.filter((a) => a.status === 'late').length,
    excused: filteredAttendances.filter((a) => a.status === 'excused').length,
  };

  const summary = filterStatus ? summaryFallback : summaryData ?? summaryFallback;

  const totalAttendance = filterStatus ? summaryFallback.total : summary.total;
  const presentCount = filterStatus ? summaryFallback.present : summary.present;
  const absentCount = filterStatus ? summaryFallback.absent : summary.absent;
  const lateCount = filterStatus ? summaryFallback.late : summary.late;
  const excusedCount = filterStatus ? summaryFallback.excused : summary.excused;

  const scheduleOptions = useMemo(() => {
    if (!schedulesData?.data) {
      return [];
    }
    return schedulesData.data.map((schedule) => {
      const className = schedule.classRoom?.name ?? '';
      const subjectName = schedule.subject?.name ?? '';
      const teacherName = schedule.teacher?.name ?? '';
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][schedule.dayOfWeek] ?? '';
      const timeRange = `${schedule.startTime} - ${schedule.endTime}`;
      const label = [className || subjectName, teacherName, `${dayName} ${timeRange}`]
        .filter(Boolean)
        .join(' • ');
      return {
        id: schedule.id,
        label: label || `Jadwal ${schedule.id}`,
        isActive: schedule.isActive ?? true,
      };
    });
  }, [schedulesData?.data]);

  const selectedScheduleMeta = useMemo(() => {
    if (filterScheduleId === undefined) {
      return undefined;
    }
    return scheduleOptions.find((option) => option.id === filterScheduleId);
  }, [scheduleOptions, filterScheduleId]);

  const dailyRange = useMemo(() => {
    if (!filterDate) {
      return undefined;
    }
    const end = new Date(filterDate);
    if (Number.isNaN(end.getTime())) {
      return undefined;
    }
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const toIsoDate = (date: Date) => date.toISOString().split('T')[0];
    return {
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
    };
  }, [filterDate]);

  const { data: dailyStats, isLoading: isLoadingDailyStats, isError: isDailyStatsError } = useQuery({
    queryKey: ['attendance-daily-stats', tenantId, filterScheduleId, dailyRange?.startDate, dailyRange?.endDate],
    queryFn: () =>
      attendanceApi.getDailyStats(tenantId!, {
        scheduleId: filterScheduleId,
        startDate: dailyRange!.startDate,
        endDate: dailyRange!.endDate,
      }),
    enabled: !!tenantId && !!dailyRange,
  });

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
          {
            label: 'Terlambat',
            value: lateCount,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            ),
          },
          {
            label: 'Izin',
            value: excusedCount,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jadwal</label>
                  <select
                    value={filterScheduleId || ''}
                    onChange={(e) =>
                      setFilterScheduleId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Jadwal</option>
                    {scheduleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                        {!option.isActive ? ' (Tidak Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Status</option>
                    <option value="present">Hadir</option>
                    <option value="absent">Tidak Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="excused">Izin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterDate(new Date().toISOString().split('T')[0]);
                      setFilterScheduleId(undefined);
                      setFilterStatus('');
                    }}
                    className="w-full px-4 py-3 rounded-2xl border-2 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
              {selectedScheduleMeta && selectedScheduleMeta.isActive === false && (
                <div className="mt-4 px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium flex items-center space-x-3">
                  <svg className="w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Jadwal yang dipilih sedang tidak aktif. Pastikan data absensi tetap relevan.</span>
                </div>
              )}
            </div>

            {dailyRange && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow border border-gray-100/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Tren 7 Hari Terakhir</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(dailyRange.startDate)} - {formatDate(dailyRange.endDate)}
                    </p>
                  </div>
                  {isLoadingDailyStats && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h3z"
                        ></path>
                      </svg>
                      Memuat tren...
                    </div>
                  )}
                </div>
                {isDailyStatsError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                    Tidak dapat memuat data tren harian saat ini.
                  </div>
                )}
                {!isLoadingDailyStats && !isDailyStatsError && (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dailyStats && dailyStats.length > 0 ? (
                      dailyStats.map((stat) => (
                        <div
                          key={stat.date}
                          className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:shadow transition-shadow duration-200"
                        >
                          <p className="text-sm font-semibold text-gray-700">{formatDate(stat.date)}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="flex justify-between">
                              <span className="text-gray-500">Total</span>
                              <span className="font-medium text-gray-800">{stat.total}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Hadir</span>
                              <span className="font-medium text-green-600">{stat.present}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Tidak Hadir</span>
                              <span className="font-medium text-red-600">{stat.absent}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Terlambat</span>
                              <span className="font-medium text-yellow-600">{stat.late}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Izin</span>
                              <span className="font-medium text-blue-600">{stat.excused}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-sm text-gray-500 py-6">
                        Tidak ada data absensi dalam rentang tanggal ini.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Jadwal</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Tanggal</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Catatan</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendances.map((attendance, index) => (
                        <TableRow 
                          key={attendance.id} 
                          className={`transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                          } hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                        >
                          <TableCell className="font-medium text-gray-800">
                            {attendance.student?.name || `Siswa #${attendance.studentId}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {attendance.schedule?.subject?.name || attendance.schedule?.classRoom?.name || '-'}
                              </span>
                              <span className="text-xs text-gray-600">
                                {attendance.schedule
                                  ? `${attendance.schedule?.teacher?.name ?? '-'} • ${
                                      ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][
                                        attendance.schedule.dayOfWeek
                                      ] ?? '-'
                                    } ${attendance.schedule.startTime} - ${attendance.schedule.endTime}`
                                  : '-'}
                              </span>
                              {attendance.schedule?.isActive === false && (
                                <span className="mt-1 px-2 py-1 text-[10px] uppercase tracking-wide font-semibold bg-gray-200 text-gray-700 rounded-full inline-block w-max">
                                  Jadwal tidak aktif
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(attendance.date)}
                          </TableCell>
                          <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                          <TableCell>{attendance.notes || '-'}</TableCell>
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
                      {filteredAttendances.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
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
                      {scheduleOptions.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.label}
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

