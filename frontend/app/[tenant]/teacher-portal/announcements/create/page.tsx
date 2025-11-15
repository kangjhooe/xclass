'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Megaphone,
  ArrowLeft,
  Save,
  Users,
  BookOpen,
  AlertCircle,
  X,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function CreateAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all' as 'all' | 'class' | 'subject',
    targetIds: [] as number[],
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
      newErrors.title = 'Judul pengumuman wajib diisi';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Isi pengumuman wajib diisi';
    }

    if (formData.targetType !== 'all' && formData.targetIds.length === 0) {
      newErrors.targetIds = 'Pilih minimal satu target';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTargetToggle = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      targetIds: prev.targetIds.includes(id)
        ? prev.targetIds.filter((targetId) => targetId !== id)
        : [...prev.targetIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(
        `/tenants/${tenantId}/announcements`,
        {
          ...formData,
          targetIds: formData.targetType === 'all' ? [] : formData.targetIds,
        },
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );

      router.push(`/${tenantId}/teacher-portal/announcements`);
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      alert('Gagal membuat pengumuman: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
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
            href={`/${tenantId}/teacher-portal/announcements`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-blue-600" />
              Buat Pengumuman
            </h1>
            <p className="text-gray-600 mt-1">Buat pengumuman untuk siswa</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Pengumuman <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Pengumuman UTS Semester Genap"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi Pengumuman <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tulis isi pengumuman di sini..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Pengumuman <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, targetType: 'all', targetIds: [] });
                }}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.targetType === 'all'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">Semua Siswa</p>
                <p className="text-sm text-gray-600">Dikirim ke semua siswa</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, targetType: 'class', targetIds: [] });
                }}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.targetType === 'class'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">Per Kelas</p>
                <p className="text-sm text-gray-600">Pilih kelas tertentu</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, targetType: 'subject', targetIds: [] });
                }}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.targetType === 'subject'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <BookOpen className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">Per Mata Pelajaran</p>
                <p className="text-sm text-gray-600">Pilih mata pelajaran</p>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          {formData.targetType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih {formData.targetType === 'class' ? 'Kelas' : 'Mata Pelajaran'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {formData.targetType === 'class' ? (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <label
                        key={cls.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetIds.includes(cls.id)}
                          onChange={() => handleTargetToggle(cls.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetIds.includes(subject.id)}
                          onChange={() => handleTargetToggle(subject.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.targetIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(formData.targetType === 'class' ? classes : subjects)
                    .filter((item) => formData.targetIds.includes(item.id))
                    .map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {item.name}
                        <button
                          type="button"
                          onClick={() => handleTargetToggle(item.id)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
              {errors.targetIds && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.targetIds}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href={`/${tenantId}/teacher-portal/announcements`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publikasikan Pengumuman
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
}

