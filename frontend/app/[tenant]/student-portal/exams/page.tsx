'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import { examsApi, Exam } from '@/lib/api/exams';
import { formatDate } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';
import { FileBarChart, Clock, BookOpen, CheckCircle, Search, Filter } from 'lucide-react';

export default function StudentExamsPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = useTenantId();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'available' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['exam-schedules', tenantId, filter],
    queryFn: () => examsApi.getSchedules({ status: filter === 'all' ? undefined : filter }),
    enabled: !!tenantId,
  });

  const schedules = schedulesData?.data || [];
  
  // Filter schedules based on search query
  const filteredSchedules = schedules.filter((schedule: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const exam = schedule.exam;
    return (
      exam?.title?.toLowerCase().includes(query) ||
      schedule.subject?.name?.toLowerCase().includes(query) ||
      schedule.classRoom?.name?.toLowerCase().includes(query)
    );
  });

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
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Ujian belum dimulai. Waktu mulai: ${formatDate(schedule.startTime)}`);
      }
      return;
    }

    if (now > endTime) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Ujian sudah berakhir. Waktu selesai: ${formatDate(schedule.endTime)}`);
      }
      return;
    }

    // Konfirmasi sebelum mulai
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Apakah Anda yakin ingin mulai mengerjakan ujian ini? Setelah mulai, timer akan berjalan dan tidak dapat dihentikan.');
      if (confirmed) {
        router.push(`/${params.tenant}/student-portal/exams/${schedule.examId}/take?scheduleId=${schedule.id}`);
      }
    }
  };

  const handleViewResults = (schedule: any) => {
    router.push(`/${params.tenant}/student-portal/exams/${schedule.examId}/results?scheduleId=${schedule.id}`);
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileBarChart className="w-8 h-8 text-purple-600" />
              Ujian Online
            </h1>
            <p className="text-gray-600 mt-1">Daftar ujian yang tersedia untuk Anda</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari ujian (judul, mata pelajaran, kelas)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Filter Status:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'available', 'ongoing', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' && 'Semua'}
                {f === 'available' && 'Tersedia'}
                {f === 'ongoing' && 'Berlangsung'}
                {f === 'completed' && 'Selesai'}
              </button>
            ))}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Menampilkan {filteredSchedules.length} dari {schedules.length} ujian
            </p>
          )}
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <EmptyState
                icon={FileBarChart}
                title={searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada ujian tersedia"}
                description={searchQuery 
                  ? `Tidak ada ujian yang sesuai dengan pencarian "${searchQuery}".`
                  : "Belum ada ujian yang tersedia untuk Anda saat ini."}
              />
            </div>
          ) : (
            filteredSchedules.map((schedule: any) => {
              const status = getStatusBadge(schedule);
              const canStart = canStartExam(schedule);
              const exam = schedule.exam;

              return (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{exam?.title || 'Ujian'}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${status.color}`}>
                            {status.text}
                          </span>
                        </div>

                        {exam?.description && (
                          <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Mata Pelajaran</p>
                              <p className="font-medium text-gray-900">{schedule.subject?.name || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Kelas</p>
                              <p className="font-medium text-gray-900">{schedule.classRoom?.name || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Waktu Mulai</p>
                              <p className="font-medium text-gray-900">{formatDate(schedule.startTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Durasi</p>
                              <p className="font-medium text-gray-900">{schedule.duration || 0} menit</p>
                            </div>
                          </div>
                        </div>

                        {schedule.instructions && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800">
                              <strong>Instruksi:</strong> {schedule.instructions}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{schedule.totalQuestions || 0} Soal</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.duration || 0} Menit</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Nilai Lulus: {schedule.passingScore || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileBarChart className="w-4 h-4" />
                            <span>Max: {schedule.maxAttempts || 1}x</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-4">
                        {canStart && (
                          <button
                            onClick={() => handleStartExam(schedule)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            Mulai Ujian
                          </button>
                        )}
                        {status.text === 'Selesai' && (
                          <button
                            onClick={() => handleViewResults(schedule)}
                            className="px-6 py-3 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all"
                          >
                            Lihat Hasil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
              );
            })
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

