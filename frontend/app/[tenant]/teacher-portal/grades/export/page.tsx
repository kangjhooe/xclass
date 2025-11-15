'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Download,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Users,
  Filter,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function ExportGradesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    gradeType: 'all' as 'all' | 'daily' | 'midterm' | 'final',
    semester: '1',
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [tenantId]);

  const fetchClasses = async () => {
    try {
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

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/subjects`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!formData.classId || !formData.subjectId) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/grades/export/${format}`,
        {
          params: {
            classId: formData.classId,
            subjectId: formData.subjectId,
            type: formData.gradeType,
            semester: formData.semester,
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
      const subjectName = subjects.find((s) => s.id === parseInt(formData.subjectId))?.name || 'mata-pelajaran';
      link.download = `nilai-${className}-${subjectName}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Gagal mengekspor: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${tenantId}/teacher-portal/grades`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-600" />
              Ekspor Nilai
            </h1>
            <p className="text-gray-600 mt-1">Ekspor data nilai ke Excel atau PDF</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <BookOpen className="w-4 h-4 inline mr-1" />
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Jenis Nilai
              </label>
              <select
                value={formData.gradeType}
                onChange={(e) =>
                  setFormData({ ...formData, gradeType: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Nilai</option>
                <option value="daily">Nilai Harian</option>
                <option value="midterm">UTS</option>
                <option value="final">UAS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => handleExport('excel')}
                disabled={!formData.classId || !formData.subjectId}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Ekspor ke Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!formData.classId || !formData.subjectId}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Ekspor ke PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

