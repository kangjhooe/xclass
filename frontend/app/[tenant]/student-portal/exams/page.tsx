'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { examsApi, Exam } from '@/lib/api/exams';
import { formatDate } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';

export default function StudentExamsPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = useTenantId();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'available' | 'ongoing' | 'completed'>('all');

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['exam-schedules', tenantId, filter],
    queryFn: () => examsApi.getSchedules({ status: filter === 'all' ? undefined : filter }),
    enabled: !!tenantId,
  });

  const schedules = schedulesData?.data || [];

  const getStatusBadge = (schedule: any) => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);

    if (now < startTime) {
      return { text: 'Belum Dimulai', color: 'bg-gray-500' };
    } else if (now >= startTime && now <= endTime) {
      return { text: 'Sedang Berlangsung', color: 'bg-green-500' };
    } else {
      return { text: 'Selesai', color: 'bg-blue-500' };
    }
  };

  const canStartExam = (schedule: any) => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);
    return now >= startTime && now <= endTime;
  };

  const handleStartExam = (schedule: any) => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);

    // Validasi waktu
    if (now < startTime) {
      alert(`Ujian belum dimulai. Waktu mulai: ${formatDate(schedule.startTime)}`);
      return;
    }

    if (now > endTime) {
      alert(`Ujian sudah berakhir. Waktu selesai: ${formatDate(schedule.endTime)}`);
      return;
    }

    // Konfirmasi sebelum mulai
    if (confirm('Apakah Anda yakin ingin mulai mengerjakan ujian ini? Setelah mulai, timer akan berjalan dan tidak dapat dihentikan.')) {
      router.push(`/${params.tenant}/student-portal/exams/${schedule.examId}/take?scheduleId=${schedule.id}`);
    }
  };

  const handleViewResults = (schedule: any) => {
    router.push(`/${params.tenant}/student-portal/exams/${schedule.examId}/results?scheduleId=${schedule.id}`);
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data ujian...</div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Ujian Online</h1>
          <p className="text-gray-600 mb-6">Daftar ujian yang tersedia untuk Anda</p>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            {(['all', 'available', 'ongoing', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium transition-colors ${
                  filter === f
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {f === 'all' && 'Semua'}
                {f === 'available' && 'Tersedia'}
                {f === 'ongoing' && 'Berlangsung'}
                {f === 'completed' && 'Selesai'}
              </button>
            ))}
          </div>

          {/* Exams List */}
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Tidak ada ujian tersedia</p>
              </div>
            ) : (
              schedules.map((schedule: any) => {
                const status = getStatusBadge(schedule);
                const canStart = canStartExam(schedule);
                const exam = schedule.exam;

                return (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{exam?.title || 'Ujian'}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${status.color}`}>
                            {status.text}
                          </span>
                        </div>

                        {exam?.description && (
                          <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Mata Pelajaran:</span>
                            <p className="font-medium text-gray-800">{schedule.subject?.name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Kelas:</span>
                            <p className="font-medium text-gray-800">{schedule.classRoom?.name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Waktu Mulai:</span>
                            <p className="font-medium text-gray-800">{formatDate(schedule.startTime)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Durasi:</span>
                            <p className="font-medium text-gray-800">{schedule.duration || 0} menit</p>
                          </div>
                        </div>

                        {schedule.instructions && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Instruksi:</strong> {schedule.instructions}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{schedule.totalQuestions || 0} Soal</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{schedule.duration || 0} Menit</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Nilai Lulus: {schedule.passingScore || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Max: {schedule.maxAttempts || 1}x</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {canStart && (
                          <Button
                            onClick={() => handleStartExam(schedule)}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          >
                            Mulai Ujian
                          </Button>
                        )}
                        {status.text === 'Selesai' && (
                          <Button
                            variant="outline"
                            onClick={() => handleViewResults(schedule)}
                            className="border-violet-300 text-violet-600 hover:bg-violet-50"
                          >
                            Lihat Hasil
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}

