'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { LazyLineChart, LazyBarChart, LazyPieChart } from './lazy';
import { SkeletonStats, SkeletonChart, SkeletonCard } from '@/components/ui/Skeleton';
import { studentsApi } from '@/lib/api/students';
import { teachersApi } from '@/lib/api/teachers';
import { classesApi } from '@/lib/api/classes';
import { attendanceApi } from '@/lib/api/attendance';
import { gradesApi } from '@/lib/api/grades';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils/date';
import { useTenantIdState, useTenantNpsn } from '@/lib/hooks/useTenant';

export default function TenantDashboard() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const { tenantId, loading: tenantLoading, error: tenantError } = useTenantIdState(); // Numeric ID for API calls

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId && !tenantLoading,
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers', tenantId],
    queryFn: () => teachersApi.getAll(tenantId!),
    enabled: !!tenantId && !tenantLoading,
  });

  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', tenantId],
    queryFn: () => classesApi.getAll(tenantId!),
    enabled: !!tenantId && !tenantLoading,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', tenantId],
    queryFn: () => attendanceApi.getAll(tenantId!),
    enabled: !!tenantId && !tenantLoading,
  });

  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', tenantId],
    queryFn: () => gradesApi.getAll(tenantId!),
    enabled: !!tenantId && !tenantLoading,
  });

  // Calculate statistics
  const totalStudents = studentsData?.data?.length || 0;
  const totalTeachers = teachersData?.data?.length || 0;
  const totalClasses = classesData?.data?.length || 0;
  const totalAttendance = attendanceData?.data?.length || 0;

  // Calculate attendance statistics
  const todayAttendance = attendanceData?.data?.filter((att: any) => {
    const today = new Date().toISOString().split('T')[0];
    return att.date?.split('T')[0] === today;
  }) || [];
  
  const presentToday = todayAttendance.filter((att: any) => att.status === 'present').length;
  const absentToday = todayAttendance.filter((att: any) => att.status === 'absent').length;
  const lateToday = todayAttendance.filter((att: any) => att.status === 'late').length;
  const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;

  // Calculate average grade
  const averageGrade = gradesData?.data && gradesData.data.length > 0
    ? (gradesData.data.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / gradesData.data.length).toFixed(1)
    : 0;

  // Prepare chart data
  const attendanceChartData = attendanceData?.data?.reduce((acc: any[], attendance: any) => {
    const date = attendance.date?.split('T')[0];
    if (!date) return acc;
    const existing = acc.find((item) => item.name === date);
    if (existing) {
      existing[attendance.status] = (existing[attendance.status] || 0) + 1;
    } else {
      acc.push({
        name: date,
        present: attendance.status === 'present' ? 1 : 0,
        absent: attendance.status === 'absent' ? 1 : 0,
        late: attendance.status === 'late' ? 1 : 0,
      });
    }
    return acc;
  }, []) || [];

  // Get last 7 days for better visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const attendanceChartDataLast7Days = last7Days.map((date) => {
    const existing = attendanceChartData.find((item) => item.name === date);
    return existing || {
      name: date.split('-').reverse().join('/'),
      present: 0,
      absent: 0,
      late: 0,
    };
  });

  const gradeDistribution = gradesData?.data?.reduce((acc: any[], grade: any) => {
    const score = grade.score || 0;
    const range = score >= 85 ? '85-100' : score >= 70 ? '70-84' : score >= 60 ? '60-69' : '0-59';
    const existing = acc.find((item) => item.name === range);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: range, value: 1 });
    }
    return acc;
  }, []) || [];

  const genderDistribution = studentsData?.data?.reduce((acc: any[], student: any) => {
    const gender = student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : 'Lainnya';
    const existing = acc.find((item) => item.name === gender);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: gender, value: 1 });
    }
    return acc;
  }, []) || [];

  // Get recent students
  const recentStudents = studentsData?.data?.slice(0, 5) || [];

  const isLoading = tenantLoading || studentsLoading || teachersLoading || classesLoading || attendanceLoading || gradesLoading;

  return (
    <TenantLayout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 via-indigo-50/30 to-purple-50/40">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative p-6 lg:p-8">
          {/* Show error if tenant resolution failed */}
          {tenantError && !tenantLoading ? (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-red-200/50 p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Gagal Memuat Data Tenant</h2>
                <p className="text-gray-600 mb-6">{tenantError.message || 'Terjadi kesalahan saat memuat data tenant'}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    Coba Lagi
                  </button>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
                  >
                    Kembali ke Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
                      Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">Selamat datang kembali! Berikut ringkasan data instansi Anda.</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Sistem Aktif</span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {/* Statistics Cards Skeleton */}
                  <SkeletonStats count={4} />
                  
                  {/* Secondary Stats Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  
                  {/* Charts Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonChart height={300} />
                    <SkeletonChart height={300} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Siswa Card */}
                    <Link href={`/${tenantNpsn}/students`} className="group relative">
                  <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-blue-400/20">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                    <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-200"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                          <h2 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Total Siswa</h2>
                        </div>
                        <p className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{totalStudents}</p>
                        <p className="text-xs text-white/70 font-medium">Siswa terdaftar</p>
                      </div>
                      <div className="ml-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Total Guru Card */}
                <Link href={`/${tenantNpsn}/teachers`} className="group relative">
                  <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-emerald-400/20">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                    <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-200"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                          <h2 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Total Guru</h2>
                        </div>
                        <p className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{totalTeachers}</p>
                        <p className="text-xs text-white/70 font-medium">Guru terdaftar</p>
                      </div>
                      <div className="ml-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Total Kelas Card */}
                <Link href={`/${tenantNpsn}/classes`} className="group relative">
                  <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-purple-400/20">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                    <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-200"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                          <h2 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Total Kelas</h2>
                        </div>
                        <p className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{totalClasses}</p>
                        <p className="text-xs text-white/70 font-medium">Kelas aktif</p>
                      </div>
                      <div className="ml-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Absensi Hari Ini Card */}
                <Link href={`/${tenantNpsn}/attendance`} className="group relative">
                  <div className="relative bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-orange-400/20">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                    <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-200"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                          <h2 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Kehadiran Hari Ini</h2>
                        </div>
                        <p className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{attendanceRate}%</p>
                        <div className="flex gap-3 text-xs mt-2">
                          <span className="text-white/90 font-medium">Hadir: <span className="font-bold">{presentToday}</span></span>
                          <span className="text-white/90 font-medium">Tidak: <span className="font-bold">{absentToday}</span></span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-indigo-100/50 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Rata-rata Nilai</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{averageGrade}</p>
                      <p className="text-xs text-gray-400 mt-1">Dari semua nilai</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-cyan-100/50 hover:shadow-2xl hover:border-cyan-200 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Absensi</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{totalAttendance}</p>
                      <p className="text-xs text-gray-400 mt-1">Record absensi</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-amber-100/50 hover:shadow-2xl hover:border-amber-200 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Terlambat Hari Ini</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{lateToday}</p>
                      <p className="text-xs text-gray-400 mt-1">Siswa terlambat</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Attendance Chart */}
                {attendanceChartDataLast7Days.length > 0 && (
                  <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Grafik Absensi 7 Hari Terakhir</h2>
                          <p className="text-xs text-gray-500 mt-0.5">Trend kehadiran siswa</p>
                        </div>
                      </div>
                      <Suspense fallback={<SkeletonChart height={300} />}>
                        <LazyLineChart
                          data={attendanceChartDataLast7Days}
                          dataKey="present"
                          lines={[
                            { key: 'present', name: 'Hadir', color: '#10b981' },
                            { key: 'absent', name: 'Tidak Hadir', color: '#ef4444' },
                            { key: 'late', name: 'Terlambat', color: '#f59e0b' },
                          ]}
                          height={300}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}

                {/* Grade Distribution */}
                {gradeDistribution.length > 0 && (
                  <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Distribusi Nilai</h2>
                          <p className="text-xs text-gray-500 mt-0.5">Pembagian nilai siswa</p>
                        </div>
                      </div>
                      <Suspense fallback={<SkeletonChart height={300} />}>
                        <LazyBarChart
                          data={gradeDistribution}
                          dataKey="value"
                          bars={[{ key: 'value', name: 'Jumlah Siswa', color: '#8b5cf6' }]}
                          height={300}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}

                {/* Gender Distribution */}
                {genderDistribution.length > 0 && (
                  <div className="group relative bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Distribusi Jenis Kelamin</h2>
                          <p className="text-xs text-gray-500 mt-0.5">Komposisi gender siswa</p>
                        </div>
                      </div>
                      <Suspense fallback={<SkeletonChart height={300} />}>
                        <LazyPieChart
                          data={genderDistribution}
                          dataKey="value"
                          height={300}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions & Recent Students */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b border-white/20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Quick Actions
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <Link
                      href={`/${tenantNpsn}/students`}
                      className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Tambah Siswa</span>
                      <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <Link
                      href={`/${tenantNpsn}/attendance`}
                      className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-500 group-hover:to-green-600 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">Input Absensi</span>
                      <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <Link
                      href={`/${tenantNpsn}/grades`}
                      className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">Input Nilai</span>
                      <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <Link
                      href={`/${tenantNpsn}/classes`}
                      className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Kelola Kelas</span>
                      <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Recent Students */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-b border-white/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Siswa Terbaru</h2>
                        <p className="text-xs text-white/80 mt-0.5">5 siswa terakhir terdaftar</p>
                      </div>
                    </div>
                    <Link
                      href={`/${tenantNpsn}/students`}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold text-sm flex items-center gap-2 hover:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Lihat Semua
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <div className="p-6">
                    {recentStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Belum ada siswa yang terdaftar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentStudents.map((student: any, index: number) => (
                          <div
                            key={student.id}
                            className="group flex items-center justify-between p-5 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                  {student.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                  {student.name || 'Nama tidak tersedia'}
                                </div>
                                <div className="text-sm text-gray-600 mt-1.5 flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-500">NIS:</span>
                                    <span className="text-gray-700">{student.nis || '-'}</span>
                                  </span>
                                  <span className="text-gray-300">|</span>
                                  <span className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-500">Kelas:</span>
                                    <span className="text-gray-700">{student.class?.name || '-'}</span>
                                  </span>
                                </div>
                                {student.createdAt && (
                                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Terdaftar: {formatDate(student.createdAt)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md group-hover:shadow-lg transition-all">
                                Aktif
                              </span>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
