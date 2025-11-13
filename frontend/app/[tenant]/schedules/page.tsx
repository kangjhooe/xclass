'use client';

import { useMemo, useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  schedulesApi,
  Schedule,
  ScheduleCreateData,
  ScheduleConflictResponse,
} from '@/lib/api/schedules';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { teachersApi } from '@/lib/api/teachers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Minggu' },
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

const DEFAULT_FORM: ScheduleCreateData = {
  classId: 0,
  subjectId: 0,
  teacherId: 0,
  dayOfWeek: 1,
  startTime: '',
  endTime: '',
  room: '',
  isActive: true,
};

export default function SchedulesPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [filterClassId, setFilterClassId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<ScheduleCreateData>({ ...DEFAULT_FORM });
  const [conflictResult, setConflictResult] = useState<ScheduleConflictResponse | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', resolvedTenantId, filterClassId],
    queryFn: () => schedulesApi.getAll(resolvedTenantId!, { classId: filterClassId }),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', resolvedTenantId],
    queryFn: () => classesApi.getAll(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', resolvedTenantId],
    queryFn: () => subjectsApi.getAll(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', resolvedTenantId],
    queryFn: () => teachersApi.getAll(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: (payload: ScheduleCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return schedulesApi.create(resolvedTenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ScheduleCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return schedulesApi.update(resolvedTenantId, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', resolvedTenantId] });
      setIsModalOpen(false);
      setSelectedSchedule(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return schedulesApi.delete(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', resolvedTenantId] });
    },
  });

  const totalSchedules = data?.data?.length || 0;
  const activeSchedules = data?.data?.filter((schedule) => schedule.isActive).length || 0;
  const inactiveSchedules = totalSchedules - activeSchedules;

  const toShortTime = (time?: string | null) => {
    if (!time) {
      return '';
    }
    return time.substring(0, 5);
  };

  const stats = useMemo(
    () => [
      {
        label: 'Total Jadwal',
        value: totalSchedules,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: 'Jadwal Aktif',
        value: activeSchedules,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Jadwal Tidak Aktif',
        value: inactiveSchedules < 0 ? 0 : inactiveSchedules,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        ),
      },
    ],
    [totalSchedules, activeSchedules, inactiveSchedules],
  );

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    setSelectedSchedule(null);
    setConflictResult(null);
    setConflictError(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      teacherId: schedule.teacherId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: toShortTime(schedule.startTime),
      endTime: toShortTime(schedule.endTime),
      room: schedule.room || '',
      isActive: schedule.isActive ?? true,
    });
    setConflictResult(null);
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const checkConflictsBeforeSubmit = async (): Promise<boolean> => {
    if (!resolvedTenantId) {
      setConflictError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return true;
    }

    const payload = {
      classId: formData.classId,
      subjectId: formData.subjectId,
      teacherId: formData.teacherId,
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room ? formData.room : undefined,
      scheduleId: selectedSchedule?.id,
    };

    try {
      setIsCheckingConflict(true);
      setConflictError(null);
      const result = await schedulesApi.checkConflict(resolvedTenantId, payload);
      if (result.hasConflict) {
        setConflictResult(result);
        return true;
      }
      setConflictResult(null);
      return false;
    } catch (error) {
      console.error(error);
      setConflictError('Gagal memeriksa konflik jadwal. Silakan coba lagi.');
      return true;
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    const hasConflict = await checkConflictsBeforeSubmit();
    if (hasConflict) {
      return;
    }

    if (selectedSchedule) {
      updateMutation.mutate({
        id: selectedSchedule.id,
        payload: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="schedules"
        title="Jadwal Pelajaran"
        description="Kelola jadwal pelajaran di instansi Anda"
        stats={stats}
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
            Tambah Jadwal
          </Button>
        )}
      >
        {({ themeConfig }) => (
          <>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                  <select
                    value={filterClassId || ''}
                    onChange={(event) =>
                      setFilterClassId(event.target.value ? parseInt(event.target.value) : undefined)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Kelas</option>
                    {classesData?.data?.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => setFilterClassId(undefined)}
                    className="w-full px-4 py-3 rounded-2xl border-2 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {conflictError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-4">
                {conflictError}
              </div>
            )}

            {conflictResult?.hasConflict && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl px-4 py-4 mb-6">
                <h3 className="font-semibold mb-2">Konflik Jadwal Terdeteksi</h3>
                <p className="mb-3 text-sm text-yellow-700">
                  Periksa jadwal yang bentrok berikut ini sebelum menyimpan perubahan.
                </p>
                <div className="space-y-3">
                  {conflictResult.conflicts.map((conflict) => (
                    <div key={conflict.type} className="bg-white border border-yellow-100 rounded-xl p-3">
                      <p className="font-semibold capitalize mb-2">
                        {conflict.type === 'class'
                          ? 'Bentrok Kelas'
                          : conflict.type === 'teacher'
                            ? 'Bentrok Guru'
                            : 'Bentrok Ruangan'}
                      </p>
                      <ul className="text-sm space-y-2">
                        {conflict.schedules.map((schedule) => (
                          <li key={schedule.id} className="flex flex-col">
                            <span className="font-medium">
                              {schedule.classRoom?.name || '-'} — {schedule.subject?.name || '-'}
                            </span>
                            <span className="text-gray-600">
                              {DAYS_OF_WEEK.find((day) => day.value === schedule.dayOfWeek)?.label ?? 'Hari tidak diketahui'}{' '}
                              ({toShortTime(schedule.startTime)} - {toShortTime(schedule.endTime)}) — Guru:{' '}
                              {schedule.teacher?.name || 'Tidak diketahui'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
                      <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50">
                        <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-gray-700">Guru</TableHead>
                        <TableHead className="font-semibold text-gray-700">Hari</TableHead>
                        <TableHead className="font-semibold text-gray-700">Waktu</TableHead>
                        <TableHead className="font-semibold text-gray-700">Ruangan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((schedule) => (
                        <TableRow key={schedule.id} className="hover:bg-teal-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">
                            {schedule.classRoom?.name || '-'}
                          </TableCell>
                          <TableCell>{schedule.subject?.name || '-'}</TableCell>
                          <TableCell>{schedule.teacher?.name || '-'}</TableCell>
                          <TableCell>
                            {DAYS_OF_WEEK.find((day) => day.value === schedule.dayOfWeek)?.label || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {toShortTime(schedule.startTime)} - {toShortTime(schedule.endTime)}
                            </span>
                          </TableCell>
                          <TableCell>{schedule.room || '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${
                                schedule.isActive
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}
                            >
                              {schedule.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(schedule)}
                                className="hover:bg-teal-50 hover:border-teal-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(schedule.id)}
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
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Tidak ada data jadwal</p>
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
              title={selectedSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.classId}
                      onChange={(event) => setFormData({ ...formData, classId: parseInt(event.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0">Pilih Kelas</option>
                      {classesData?.data?.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(event) => setFormData({ ...formData, subjectId: parseInt(event.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0">Pilih Mata Pelajaran</option>
                      {subjectsData?.data?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guru <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(event) => setFormData({ ...formData, teacherId: parseInt(event.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0">Pilih Guru</option>
                      {teachersData?.data?.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(event) => setFormData({ ...formData, dayOfWeek: parseInt(event.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(event) => setFormData({ ...formData, startTime: event.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(event) => setFormData({ ...formData, room: event.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(event) =>
                        setFormData({ ...formData, isActive: event.target.value === 'true' })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Aktif</option>
                      <option value="false">Tidak Aktif</option>
                    </select>
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
                    loading={
                      createMutation.isPending ||
                      updateMutation.isPending ||
                      isCheckingConflict
                    }
                    className={themeConfig.primaryButton}
                  >
                    {selectedSchedule ? 'Update' : 'Simpan'}
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

