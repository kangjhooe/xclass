'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Users,
  BookOpen,
  Calendar,
  FileBarChart,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bell,
  GraduationCap,
  User,
} from 'lucide-react';

interface DashboardData {
  teacher: {
    id: number;
    name: string;
    nik: string;
    employeeNumber?: string;
    subjects?: Array<{ id: number; name: string }>;
  };
  stats: {
    totalClasses: number;
    totalStudents: number;
    todaySchedules: number;
    upcomingExams: number;
  };
  todaySchedules: Array<{
    id: number;
    subject: string;
    class: string;
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
    title: string;
    startDate: string;
    subject: string;
  }>;
}

export default function TeacherPortalDashboard() {
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
        
        // Use mobile API endpoint for teacher dashboard (or create new endpoint)
        // For now, we'll use a similar structure to student dashboard
        const response = await apiClient.get('/mobile/teacher/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        if (response.data.success && response.data.data) {
          const apiData = response.data.data;
          setData({
            teacher: apiData.teacher,
            stats: apiData.stats,
            todaySchedules: apiData.todaySchedules || [],
            announcements: apiData.announcements || [],
            upcomingExams: apiData.upcomingExams || [],
          });
        } else {
          // Fallback: create mock data structure
          setData({
            teacher: {
              id: 0,
              name: 'Guru',
              nik: '',
            },
            stats: {
              totalClasses: 0,
              totalStudents: 0,
              todaySchedules: 0,
              upcomingExams: 0,
            },
            todaySchedules: [],
            announcements: [],
            upcomingExams: [],
          });
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        // Don't show error, just use empty data
        setData({
          teacher: {
            id: 0,
            name: 'Guru',
            nik: '',
          },
          stats: {
            totalClasses: 0,
            totalStudents: 0,
            todaySchedules: 0,
            upcomingExams: 0,
          },
          todaySchedules: [],
          announcements: [],
          upcomingExams: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </TeacherLayout>
    );
  }

  if (!data) {
    return (
      <TeacherLayout>
        <div className="text-gray-500 p-4">Tidak ada data</div>
      </TeacherLayout>
    );
  }

  const quickActions = [
    {
      label: 'Input Nilai',
      icon: TrendingUp,
      href: `/${tenantId}/teacher-portal/grades`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Absensi',
      icon: Activity,
      href: `/${tenantId}/teacher-portal/attendance`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Jadwal',
      icon: Calendar,
      href: `/${tenantId}/teacher-portal/schedules`,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Ujian',
      icon: FileBarChart,
      href: `/${tenantId}/teacher-portal/exams`,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Selamat Datang, {data.teacher.name}!
              </h1>
              <p className="text-blue-100">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <p className="font-semibold">{action.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kelas</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data.stats.totalClasses}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
                <p className="text-3xl font-bold text-green-600">
                  {data.stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Jadwal Hari Ini</p>
                <p className="text-3xl font-bold text-purple-600">
                  {data.stats.todaySchedules}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ujian Mendatang</p>
                <p className="text-3xl font-bold text-orange-600">
                  {data.stats.upcomingExams}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Jadwal Mengajar Hari Ini
              </h2>
              <Link
                href={`/${tenantId}/teacher-portal/schedules`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data.todaySchedules.length > 0 ? (
              <div className="space-y-3">
                {data.todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{schedule.subject}</p>
                      <p className="text-sm text-gray-600 mt-1">{schedule.class}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">{schedule.time}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{schedule.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada jadwal mengajar hari ini</p>
              </div>
            )}
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-orange-600" />
                Ujian Mendatang
              </h2>
              <Link
                href={`/${tenantId}/teacher-portal/exams`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{exam.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-orange-700">
                          {new Date(exam.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileBarChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada ujian mendatang</p>
              </div>
            )}
          </div>
        </div>

        {/* Teacher Info & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informasi Guru
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="text-lg font-medium text-gray-900">{data.teacher.name}</p>
              </div>
              {data.teacher.nik && (
                <div>
                  <p className="text-sm text-gray-600">NIK</p>
                  <p className="text-lg font-medium text-gray-900">{data.teacher.nik}</p>
                </div>
              )}
              {data.teacher.employeeNumber && (
                <div>
                  <p className="text-sm text-gray-600">NIP</p>
                  <p className="text-lg font-medium text-gray-900">
                    {data.teacher.employeeNumber}
                  </p>
                </div>
              )}
              {data.teacher.subjects && data.teacher.subjects.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mata Pelajaran</p>
                  <div className="flex flex-wrap gap-2">
                    {data.teacher.subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Pengumuman Terbaru
              </h2>
              <Link
                href={`/${tenantId}/teacher-portal/announcements`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data.announcements.length > 0 ? (
              <div className="space-y-3">
                {data.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {announcement.created_at}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada pengumuman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>


