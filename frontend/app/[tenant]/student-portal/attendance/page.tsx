'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import apiClient from '@/lib/api/client';
import { LineChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { Activity, Calendar, CheckCircle, XCircle, Clock, AlertCircle, BarChart3, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface Attendance {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
  schedule?: string;
}

export default function StudentAttendancePage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/mobile/attendance', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
          params: {
            startDate: `${selectedMonth}-01`,
            endDate: `${selectedMonth}-31`,
          },
        });

        if (response.data.success && response.data.data) {
          // Handle both direct array and nested data structure
          const attendanceData = response.data.data.attendances || response.data.data || [];
          setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
        } else {
          setError('Gagal memuat data absensi');
        }
      } catch (err: any) {
        console.error('Error fetching attendance:', err);
        setError(err.response?.data?.message || 'Gagal memuat data absensi');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [tenantId, selectedMonth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      case 'excused':
        return 'Izin';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'late':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'excused':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Calculate statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const excusedDays = attendance.filter(a => a.status === 'excused').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  // Prepare chart data
  const attendanceTrendData = useMemo(() => {
    // Group by date and calculate attendance rate per day
    const grouped = attendance.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = { present: 0, total: 0 };
      }
      acc[date].total++;
      if (record.status === 'present') {
        acc[date].present++;
      }
      return acc;
    }, {} as Record<string, { present: number; total: number }>);

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, data]) => ({
        name: date,
        'Tingkat Kehadiran': data.total > 0 ? Number(((data.present / data.total) * 100).toFixed(1)) : 0,
      }));
  }, [attendance]);

  const statusDistributionData = useMemo(() => {
    return [
      { name: 'Hadir', value: presentDays },
      { name: 'Tidak Hadir', value: absentDays },
      { name: 'Terlambat', value: lateDays },
      { name: 'Izin', value: excusedDays },
    ].filter(item => item.value > 0);
  }, [presentDays, absentDays, lateDays, excusedDays]);

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

  return (
    <StudentLayout>
      <div className="space-y-6 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              Absensi Siswa
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Lihat riwayat kehadiran Anda</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Tingkat Kehadiran</p>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Hadir</p>
                <p className="text-3xl font-bold">{presentDays}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Tidak Hadir</p>
                <p className="text-3xl font-bold">{absentDays}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Terlambat</p>
                <p className="text-3xl font-bold">{lateDays}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {attendance.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Attendance Trend */}
            {attendanceTrendData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trend Kehadiran</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Tingkat kehadiran per hari</p>
                <LineChartComponent
                  data={attendanceTrendData}
                  dataKey="Tingkat Kehadiran"
                  lines={[{ key: 'Tingkat Kehadiran', name: 'Tingkat Kehadiran (%)', color: '#10b981' }]}
                  height={250}
                />
              </div>
            )}

            {/* Pie Chart - Status Distribution */}
            {statusDistributionData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Distribusi Status</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Distribusi status kehadiran</p>
                <PieChartComponent
                  data={statusDistributionData}
                  dataKey="value"
                  height={250}
                />
              </div>
            )}
          </div>
        )}

        {/* Search and Month Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Absensi</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan tanggal atau status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Pilih Bulan
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600">
              Menampilkan hasil pencarian untuk "{searchQuery}"
            </p>
          )}
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Riwayat Absensi</h2>
          </div>

          {(() => {
            const filteredAttendance = searchQuery.trim()
              ? attendance.filter(a => 
                  a.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  getStatusLabel(a.status).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (a.subject && a.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                )
              : attendance;

            return filteredAttendance.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredAttendance.map((record) => (
                <div
                  key={record.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(record.date)}
                        </p>
                        {record.subject && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{record.subject}</p>
                        )}
                        {record.schedule && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.schedule}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="p-12">
                <EmptyState
                  icon={Calendar}
                  title={searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada data absensi"}
                  description={searchQuery 
                    ? `Tidak ada data absensi yang sesuai dengan pencarian "${searchQuery}".`
                    : `Tidak ada data absensi untuk bulan ${selectedMonth}.`}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </StudentLayout>
  );
}

