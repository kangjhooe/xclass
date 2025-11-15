'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import apiClient from '@/lib/api/client';

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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Guru</h1>

        {/* Teacher Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informasi Guru</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="text-lg font-medium">{data.teacher.name}</p>
            </div>
            {data.teacher.nik && (
              <div>
                <p className="text-sm text-gray-600">NIK</p>
                <p className="text-lg font-medium">{data.teacher.nik}</p>
              </div>
            )}
            {data.teacher.employeeNumber && (
              <div>
                <p className="text-sm text-gray-600">NIP</p>
                <p className="text-lg font-medium">{data.teacher.employeeNumber}</p>
              </div>
            )}
            {data.teacher.subjects && data.teacher.subjects.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Mata Pelajaran</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.teacher.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Total Kelas</h3>
            <p className="text-3xl font-bold text-blue-600">
              {data.stats.totalClasses}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Total Siswa</h3>
            <p className="text-3xl font-bold text-green-600">
              {data.stats.totalStudents}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Jadwal Hari Ini</h3>
            <p className="text-3xl font-bold text-purple-600">
              {data.stats.todaySchedules}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Ujian Mendatang</h3>
            <p className="text-3xl font-bold text-orange-600">
              {data.stats.upcomingExams}
            </p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Jadwal Mengajar Hari Ini</h2>
          {data.todaySchedules.length > 0 ? (
            <div className="space-y-2">
              {data.todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{schedule.subject}</p>
                    <p className="text-sm text-gray-600">{schedule.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{schedule.time}</p>
                    <p className="text-xs text-gray-500">{schedule.room}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada jadwal mengajar hari ini</p>
          )}
        </div>

        {/* Upcoming Exams */}
        {data.upcomingExams.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Ujian Mendatang</h2>
            <div className="space-y-2">
              {data.upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex justify-between items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-500"
                >
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-sm text-gray-600">{exam.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-700">
                      {new Date(exam.startDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

