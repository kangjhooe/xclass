'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import apiClient from '@/lib/api/client';

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
    title: string;
    startDate: string;
  }>;
}

export default function StudentPortalDashboard() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use mobile API endpoint for student dashboard
        const response = await apiClient.get('/mobile/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        if (response.data.success && response.data.data) {
          const apiData = response.data.data;
          setData({
            student: apiData.student,
            stats: apiData.stats,
            todaySchedules: apiData.todaySchedules || [],
            announcements: apiData.announcements || [],
            upcomingExams: [], // API doesn't return this yet
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

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      </TenantLayout>
    );
  }

  if (error) {
    return (
      <TenantLayout>
        <div className="text-red-500 p-4">{error}</div>
      </TenantLayout>
    );
  }

  if (!data) {
    return (
      <TenantLayout>
        <div className="text-gray-500 p-4">Tidak ada data</div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Siswa</h1>

        {/* Student Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informasi Siswa</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="text-lg font-medium">{data.student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIS</p>
              <p className="text-lg font-medium">{data.student.studentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kelas</p>
              <p className="text-lg font-medium">{data.student.class}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Total Nilai</h3>
            <p className="text-3xl font-bold text-blue-600">
              {data.stats.totalGrades}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Total Kehadiran</h3>
            <p className="text-3xl font-bold text-green-600">
              {data.stats.totalAttendance}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Tingkat Kehadiran</h3>
            <p className="text-3xl font-bold text-purple-600">
              {data.stats.attendanceRate}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Rata-rata Nilai</h3>
            <p className="text-3xl font-bold text-orange-600">
              {data.stats.averageGrade}
            </p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Jadwal Hari Ini</h2>
          {data.todaySchedules.length > 0 ? (
            <div className="space-y-2">
              {data.todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{schedule.subject}</p>
                    <p className="text-sm text-gray-600">{schedule.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{schedule.time}</p>
                    <p className="text-xs text-gray-500">{schedule.room}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada jadwal hari ini</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pengumuman Terbaru</h2>
          {data.announcements.length > 0 ? (
            <div className="space-y-3">
              {data.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded"
                >
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {announcement.created_at}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada pengumuman</p>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}

