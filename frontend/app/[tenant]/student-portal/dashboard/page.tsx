'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentLayout from '@/components/layouts/StudentLayout';
import StatCard from '@/components/student/StatCard';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import apiClient from '@/lib/api/client';
import { examsApi } from '@/lib/api/exams';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Award, 
  Calendar, 
  BookOpen, 
  Megaphone,
  FileBarChart,
  ArrowRight,
  User
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface DashboardData {
  student: {
    id: number;
    name: string;
    studentNumber: string;
    class: string;
  };
  stats: {
    totalGrades: number;
    totalAttendance: number;
    attendanceRate: number;
    averageGrade: number;
  };
  todaySchedules: Array<{
    id: number;
    subject: string;
    teacher: string;
    time: string;
    room: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    content: string;
    created_at: string;
  }>;
  upcomingExams: Array<{
    id: number;
    examId: number;
    title: string;
    subject?: string;
    startTime: string;
    endTime: string;
    duration?: number;
  }>;
}

export default function StudentPortalDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data
        const dashboardResponse = await apiClient.get('/mobile/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        // Fetch upcoming exams separately
        let upcomingExams: any[] = [];
        try {
          const examsResponse = await examsApi.getSchedules({ status: 'available' });
          if (examsResponse?.data) {
            upcomingExams = (Array.isArray(examsResponse.data) ? examsResponse.data : []).slice(0, 5).map((schedule: any) => ({
              id: schedule.id,
              examId: schedule.examId,
              title: schedule.exam?.title || 'Ujian',
              subject: schedule.subject?.name,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              duration: schedule.duration,
            }));
          }
        } catch (examError) {
          console.warn('Failed to fetch upcoming exams:', examError);
          // Continue without exams data
        }

        if (dashboardResponse.data.success && dashboardResponse.data.data) {
          const apiData = dashboardResponse.data.data;

          setData({
            student: apiData.student,
            stats: apiData.stats,
            todaySchedules: apiData.todaySchedules || [],
            announcements: apiData.announcements || [],
            upcomingExams,
          });
        } else {
          setError('Gagal memuat data dashboard');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'Sudah dimulai';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} hari lagi`;
    if (hours > 0) return `${hours} jam lagi`;
    return `${minutes} menit lagi`;
  };

  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </StudentLayout>
    );
  }

  if (!data) {
    return (
      <StudentLayout>
        <EmptyState
          icon={User}
          title="Tidak ada data"
          description="Data dashboard tidak tersedia saat ini."
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Selamat datang, {data.student.name}!</p>
          </div>
          {/* Quick Actions */}
          <div className="hidden md:flex gap-2">
            <Link
              href={`/${tenantId}/student-portal/grades`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Lihat Nilai
            </Link>
            <Link
              href={`/${tenantId}/student-portal/exams`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Ujian Online
            </Link>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Informasi Siswa</p>
              <h2 className="text-2xl font-bold mb-4">{data.student.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-100">NIS</p>
                  <p className="font-semibold">{data.student.studentNumber}</p>
                </div>
                <div>
                  <p className="text-blue-100">Kelas</p>
                  <p className="font-semibold">{data.student.class || '-'}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Nilai"
            value={data.stats.totalGrades}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle="Nilai yang telah diinput"
          />
          <StatCard
            title="Total Kehadiran"
            value={data.stats.totalAttendance}
            icon={Activity}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="Catatan kehadiran"
          />
          <StatCard
            title="Tingkat Kehadiran"
            value={`${data.stats.attendanceRate}%`}
            icon={Clock}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="Persentase kehadiran"
            progress={{
              value: data.stats.attendanceRate,
              max: 100,
              variant: data.stats.attendanceRate >= 80 ? 'success' : data.stats.attendanceRate >= 60 ? 'warning' : 'danger',
            }}
          />
          <StatCard
            title="Rata-rata Nilai"
            value={typeof data.stats.averageGrade === 'number' ? data.stats.averageGrade.toFixed(1) : data.stats.averageGrade}
            icon={Award}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle="Nilai rata-rata"
            progress={{
              value: typeof data.stats.averageGrade === 'number' ? data.stats.averageGrade : 0,
              max: 100,
              variant: typeof data.stats.averageGrade === 'number' 
                ? (data.stats.averageGrade >= 85 ? 'success' : data.stats.averageGrade >= 70 ? 'default' : data.stats.averageGrade >= 60 ? 'warning' : 'danger')
                : 'default',
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Jadwal Hari Ini
              </h2>
              <Link
                href={`/${tenantId}/student-portal/schedules`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data.todaySchedules.length > 0 ? (
              <div className="space-y-3">
                {data.todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{schedule.subject}</p>
                      <p className="text-sm text-gray-600 mt-1">{schedule.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{schedule.time}</p>
                      <p className="text-xs text-gray-500">{schedule.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Tidak ada jadwal"
                description="Tidak ada jadwal pelajaran untuk hari ini."
              />
            )}
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Ujian Mendatang
              </h2>
              <Link
                href={`/${tenantId}/student-portal/exams`}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Lihat semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/${tenantId}/student-portal/exams`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        {exam.subject && (
                          <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{exam.startTime ? formatDate(exam.startTime) : '-'}</span>
                          {exam.duration && <span>{exam.duration} menit</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {getTimeUntil(exam.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileBarChart}
                title="Tidak ada ujian"
                description="Tidak ada ujian yang akan datang."
              />
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Pengumuman Terbaru
            </h2>
            <Link
              href={`/${tenantId}/student-portal/announcements`}
              className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Lihat semua
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data.announcements.length > 0 ? (
            <div className="space-y-3">
              {data.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{announcement.created_at}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Megaphone}
              title="Tidak ada pengumuman"
              description="Belum ada pengumuman untuk saat ini."
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

