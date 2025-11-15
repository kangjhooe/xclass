'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Upload,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileDown,
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

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export default function ImportGradesPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    gradeType: 'daily' as 'daily' | 'midterm' | 'final',
    semester: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [tenantId]);

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

  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/grades/import/template`,
        {
          responseType: 'blob',
          headers: { 'X-Tenant-NPSN': tenantId },
        }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template-import-nilai.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Gagal mengunduh template: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        alert('File harus berformat Excel (.xlsx atau .xls)');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.classId) {
      newErrors.classId = 'Kelas wajib dipilih';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Mata pelajaran wajib dipilih';
    }

    if (!selectedFile) {
      newErrors.file = 'File Excel wajib diunggah';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImport = async () => {
    if (!validate()) {
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile!);
      uploadFormData.append('classId', formData.classId);
      uploadFormData.append('subjectId', formData.subjectId);
      uploadFormData.append('type', formData.gradeType);
      uploadFormData.append('semester', formData.semester);

      const response = await apiClient.post(
        `/tenants/${tenantId}/grades/import`,
        uploadFormData,
        {
          headers: {
            'X-Tenant-NPSN': tenantId,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImportResult(response.data.data || response.data);
      
      if (response.data.data?.success > 0) {
        setTimeout(() => {
          router.push(`/${tenantId}/teacher-portal/grades`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error importing grades:', error);
      alert('Gagal mengimpor nilai: ' + (error.response?.data?.message || error.message));
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
            href={`/${tenantId}/teacher-portal/grades`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Upload className="w-8 h-8 text-blue-600" />
              Import Nilai dari Excel
            </h1>
            <p className="text-gray-600 mt-1">Unggah file Excel untuk input nilai secara massal</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Petunjuk Import
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Download template Excel terlebih dahulu</li>
            <li>Isi template dengan data nilai siswa (NIS, Nama, Nilai)</li>
            <li>Pastikan format sesuai dengan template</li>
            <li>Upload file Excel yang sudah diisi</li>
            <li>Review hasil import sebelum menyimpan</li>
          </ol>
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
                <Filter className="w-4 h-4 inline mr-1" />
                Jenis Nilai
              </label>
              <select
                value={formData.gradeType}
                onChange={(e) => setFormData({ ...formData, gradeType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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

          {/* Download Template */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={downloadTemplate}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" />
              Download Template Excel
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              File Excel <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Pilih file Excel</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".xlsx,.xls"
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">XLSX, XLS (Max. 5MB)</p>
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

          {/* Import Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleImport}
              disabled={uploading || !selectedFile}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mengimpor...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import Nilai
                </>
              )}
            </button>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div
            className={`rounded-xl p-6 ${
              importResult.failed === 0
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {importResult.failed === 0 ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    importResult.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                  }`}
                >
                  Hasil Import
                </h3>
                <div className="space-y-2 text-sm">
                  <p className={importResult.failed === 0 ? 'text-green-800' : 'text-yellow-800'}>
                    <span className="font-semibold">{importResult.success}</span> data berhasil
                    diimpor
                  </p>
                  {importResult.failed > 0 && (
                    <>
                      <p className="text-yellow-800">
                        <span className="font-semibold">{importResult.failed}</span> data gagal
                        diimpor
                      </p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold text-yellow-900 mb-2">Error Details:</p>
                          <ul className="list-disc list-inside space-y-1 text-yellow-800">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>
                                Baris {error.row}: {error.message}
                              </li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li className="text-yellow-700">
                                ... dan {importResult.errors.length - 5} error lainnya
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

