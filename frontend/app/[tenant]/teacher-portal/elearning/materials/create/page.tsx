'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  GraduationCap,
  ArrowLeft,
  Upload,
  Save,
  BookOpen,
  Users,
  FileText,
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

export default function CreateMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    type: 'document' as 'document' | 'video' | 'image' | 'other',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect type based on file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext || '')) {
        setFormData({ ...formData, type: 'document' });
      } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) {
        setFormData({ ...formData, type: 'video' });
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        setFormData({ ...formData, type: 'image' });
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul materi wajib diisi';
    }

    if (!selectedFile) {
      newErrors.file = 'File wajib diunggah';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Mata pelajaran wajib dipilih';
    }

    if (!formData.classId) {
      newErrors.classId = 'Kelas wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile!);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('subjectId', formData.subjectId);
      uploadFormData.append('classId', formData.classId);
      uploadFormData.append('type', formData.type);

      await apiClient.post(`/tenants/${tenantId}/elearning/materials`, uploadFormData, {
        headers: {
          'X-Tenant-NPSN': tenantId,
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push(`/${tenantId}/teacher-portal/elearning`);
    } catch (error: any) {
      console.error('Error uploading material:', error);
      alert('Gagal mengunggah materi: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
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
            href={`/${tenantId}/teacher-portal/elearning`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              Upload Materi Pembelajaran
            </h1>
            <p className="text-gray-600 mt-1">Unggah materi pembelajaran untuk siswa</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Materi Matematika - Aljabar"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tambahkan deskripsi materi..."
            />
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              File Materi <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Pilih file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, PPT, MP4, JPG, PNG (Max. 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Materi
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="document">Dokumen</option>
              <option value="video">Video</option>
              <option value="image">Gambar</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href={`/${tenantId}/teacher-portal/elearning`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Unggah Materi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
}

