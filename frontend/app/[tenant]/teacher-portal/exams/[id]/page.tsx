'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  FileBarChart,
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  TrendingUp,
  BookOpen,
  BarChart3,
} from 'lucide-react';

interface Exam {
  id: number;
  title: string;
  subject: string;
  class: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalQuestions: number;
  description?: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
}

interface ExamResult {
  studentId: number;
  studentName: string;
  studentNumber?: string;
  score: number;
  totalScore: number;
  percentage: number;
  submittedAt?: string;
  timeSpent?: number;
  answers?: Array<{
    questionId: number;
    answer: string;
    isCorrect: boolean;
  }>;
}

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const examId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'analytics'>('overview');

  useEffect(() => {
    fetchExam();
    fetchResults();
  }, [tenantId, examId]);

  const fetchExam = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/exams/${examId}`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setExam(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/exams/${examId}/results`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setResults(response.data.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/exams/${examId}/export/${format}`,
        {
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
      link.download = `hasil-ujian-${exam?.title}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  if (!exam) {
    return (
      <TeacherLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Ujian tidak ditemukan
        </div>
      </TeacherLayout>
    );
  }

  const stats = {
    totalParticipants: results.length,
    averageScore: results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0,
    highestScore: results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0,
    lowestScore: results.length > 0 ? Math.min(...results.map((r) => r.percentage)) : 0,
    passed: results.filter((r) => r.percentage >= 75).length,
    failed: results.filter((r) => r.percentage < 75).length,
  };

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileBarChart className="w-8 h-8 text-orange-600" />
              {exam.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {exam.subject} - {exam.class}
            </p>
          </div>
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
        </div>

        {/* Exam Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tanggal Mulai</p>
              <p className="font-semibold text-gray-900">
                {new Date(exam.startDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tanggal Selesai</p>
              <p className="font-semibold text-gray-900">
                {new Date(exam.endDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Durasi</p>
              <p className="font-semibold text-gray-900">{exam.duration} menit</p>
            </div>
          </div>
          {exam.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
              <p className="text-gray-900">{exam.description}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'results'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hasil Ujian ({results.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analitik
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Peserta</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalParticipants}</p>
                </div>
                <Users className="w-12 h-12 text-blue-100" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.averageScore.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-100" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lulus</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.passed}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-purple-100" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tidak Lulus</p>
                  <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-100" />
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Hasil Ujian</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
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
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Persentase
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.length > 0 ? (
                    results
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((result, index) => (
                        <tr key={result.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {result.studentNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                            {result.score} / {result.totalScore}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-sm font-semibold ${
                                result.percentage >= 75
                                  ? 'text-green-600'
                                  : result.percentage >= 60
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {result.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {result.percentage >= 75 ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Lulus
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                Tidak Lulus
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                            {result.timeSpent
                              ? `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}`
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Belum ada hasil ujian
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Distribusi Nilai
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">90-100 (Sangat Baik)</span>
                    <span className="font-semibold">
                      {results.filter((r) => r.percentage >= 90).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (results.filter((r) => r.percentage >= 90).length / results.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">75-89 (Baik)</span>
                    <span className="font-semibold">
                      {results.filter((r) => r.percentage >= 75 && r.percentage < 90).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (results.filter((r) => r.percentage >= 75 && r.percentage < 90).length /
                            results.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">60-74 (Cukup)</span>
                    <span className="font-semibold">
                      {results.filter((r) => r.percentage >= 60 && r.percentage < 75).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (results.filter((r) => r.percentage >= 60 && r.percentage < 75).length /
                            results.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">&lt; 60 (Kurang)</span>
                    <span className="font-semibold">
                      {results.filter((r) => r.percentage < 60).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (results.filter((r) => r.percentage < 60).length / results.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Statistik
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nilai Tertinggi</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.highestScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nilai Terendah</span>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.lowestScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rata-rata</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.averageScore.toFixed(1)}%
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tingkat Kelulusan</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.totalParticipants > 0
                        ? ((stats.passed / stats.totalParticipants) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

