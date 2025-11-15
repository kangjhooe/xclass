'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Activity,
  ArrowLeft,
  Download,
  Calendar,
  BookOpen,
  Users,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface AttendanceReport {
  studentId: number;
  studentName: string;
  studentNumber?: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export default function AttendanceReportPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [formData, setFormData] = useState({
    classId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchClasses();
  }, [tenantId]);

  useEffect(() => {
    if (formData.classId) {
      fetchReport();
    }
  }, [formData, tenantId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/classes`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!formData.classId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/attendance/report`, {
        params: {
          classId: formData.classId,
          month: formData.month,
          year: formData.year,
        },
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!formData.classId) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/attendance/export/${format}`,
        {
          params: {
            classId: formData.classId,
            month: formData.month,
            year: formData.year,
          },
          responseType: 'blob',
          headers: { 'X-Tenant-NPSN': tenantId },
        }
      );

      const blob = new Blob([response.data], {
        type:
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const className = classes.find((c) => c.id === parseInt(formData.classId))?.name || 'kelas';
      link.download = `rekap-absensi-${className}-${formData.month}-${formData.year}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Gagal mengekspor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClassName = classes.find((c) => c.id === parseInt(formData.classId))?.name || '';
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const stats = {
    totalStudents: reports.length,
    averageAttendance: reports.length > 0
      ? reports.reduce((sum, r) => sum + r.attendanceRate, 0) / reports.length
      : 0,
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${tenantId}/teacher-portal/attendance`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-600" />
                Rekap Absensi
              </h1>
              <p className="text-gray-600 mt-1">Lihat rekap absensi siswa per bulan</p>
            </div>
          </div>
          {formData.classId && reports.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Kelas
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Bulan
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tahun
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="2020"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {formData.classId && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                </div>
                <Users className="w-12 h-12 text-blue-100" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rata-rata Kehadiran</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.averageAttendance.toFixed(1)}%
                  </p>
                </div>
                <Activity className="w-12 h-12 text-green-100" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Periode</p>
                  <p className="text-lg font-bold text-purple-600">
                    {monthNames[formData.month - 1]} {formData.year}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-purple-100" />
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {formData.classId ? (
          loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
              <div className="p-4 border-b border-gray-200 bg-gray-50 print:bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Rekap Absensi - {selectedClassName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {monthNames[formData.month - 1]} {formData.year}
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 print:bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        NIS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Siswa
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Hadir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Tidak Hadir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Terlambat
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Izin
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Total Hari
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report, index) => (
                      <tr key={report.studentId} className="hover:bg-gray-50 print:hover:bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.studentNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                          {report.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-red-600">
                          {report.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-yellow-600">
                          {report.late}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-blue-600">
                          {report.excused}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {report.totalDays}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`text-sm font-semibold ${
                              report.attendanceRate >= 90
                                ? 'text-green-600'
                                : report.attendanceRate >= 75
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {report.attendanceRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Tidak ada data absensi untuk periode ini</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Pilih kelas untuk melihat rekap absensi</p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </TeacherLayout>
  );
}

