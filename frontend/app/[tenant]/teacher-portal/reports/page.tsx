'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  BarChart3,
  Search,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface ReportData {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passed: number;
  failed: number;
}

export default function TeacherReportsPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [tenantId]);

  useEffect(() => {
    if (selectedClass || selectedSubject) {
      fetchReports();
    }
  }, [selectedClass, selectedSubject, tenantId]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/classes`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/subjects`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/academic-reports`, {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
        },
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/academic-reports/export/${format}`,
        {
          params: {
            classId: selectedClass,
            subjectId: selectedSubject,
          },
          responseType: 'blob',
          headers: { 'X-Tenant-NPSN': tenantId },
        }
      );

      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-akademik-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Gagal mengekspor laporan: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading && !reports.length) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileBarChart className="w-8 h-8 text-green-600" />
              Laporan Akademik
            </h1>
            <p className="text-gray-600 mt-1">Lihat dan ekspor laporan akademik kelas yang Anda ampu</p>
          </div>
          {(selectedClass || selectedSubject) && reports.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
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
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Mata Pelajaran
              </label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Semua Mata Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Cari
              </label>
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Reports */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {report.className}
                  </h3>
                  <p className="text-sm text-gray-600">{report.subjectName}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Siswa</span>
                    <span className="font-semibold text-gray-900">{report.totalStudents}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rata-rata</span>
                    <span className="font-semibold text-green-600">
                      {report.averageScore.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tertinggi</span>
                    <span className="font-semibold text-blue-600">{report.highestScore}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Terendah</span>
                    <span className="font-semibold text-red-600">{report.lowestScore}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Lulus</p>
                      <p className="text-lg font-bold text-green-600">{report.passed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Tidak Lulus</p>
                      <p className="text-lg font-bold text-red-600">{report.failed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileBarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {selectedClass || selectedSubject
                ? 'Tidak ada data laporan untuk filter yang dipilih'
                : 'Pilih kelas atau mata pelajaran untuk melihat laporan'}
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
