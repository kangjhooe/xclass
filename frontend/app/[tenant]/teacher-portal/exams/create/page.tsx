'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  FileBarChart,
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Hash,
  AlertCircle,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function CreateExamPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    startDate: '',
    endDate: '',
    duration: 60,
    totalQuestions: 20,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul ujian wajib diisi';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Mata pelajaran wajib dipilih';
    }

    if (!formData.classId) {
      newErrors.classId = 'Kelas wajib dipilih';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai wajib diisi';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Tanggal selesai wajib diisi';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
      }
    }

    if (formData.duration < 1) {
      newErrors.duration = 'Durasi minimal 1 menit';
    }

    if (formData.totalQuestions < 1) {
      newErrors.totalQuestions = 'Jumlah soal minimal 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(
        `/tenants/${tenantId}/exams`,
        {
          ...formData,
          subjectId: parseInt(formData.subjectId),
          classId: parseInt(formData.classId),
          duration: parseInt(formData.duration.toString()),
          totalQuestions: parseInt(formData.totalQuestions.toString()),
        },
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );
      
      router.push(`/${tenantId}/teacher-portal/exams`);
    } catch (error: any) {
      console.error('Error creating exam:', error);
      alert('Gagal membuat ujian: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
            href={`/${tenantId}/teacher-portal/exams`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileBarChart className="w-8 h-8 text-orange-600" />
              Buat Ujian Baru
            </h1>
            <p className="text-gray-600 mt-1">Buat ujian online untuk kelas yang Anda ampu</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Ujian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: UTS Matematika Kelas X"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.subjectId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.subjectId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.classId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.classId}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal & Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal & Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Duration & Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Durasi (menit) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.duration}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Jumlah Soal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.totalQuestions ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.totalQuestions && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.totalQuestions}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tambahkan deskripsi atau instruksi untuk ujian ini..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href={`/${tenantId}/teacher-portal/exams`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Ujian
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
}

