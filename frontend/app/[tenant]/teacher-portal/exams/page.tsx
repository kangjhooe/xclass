'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  FileBarChart,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Exam {
  id: number;
  title: string;
  subject: string;
  subjectId: number;
  class: string;
  classId: number;
  startDate: string;
  endDate: string;
  duration: number; // in minutes
  totalQuestions: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  participants?: number;
}

export default function TeacherExamsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchExams();
  }, [tenantId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/exams`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Exam['status']) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: Edit },
      published: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Published', icon: CheckCircle2 },
      ongoing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Berlangsung', icon: Clock },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Selesai', icon: CheckCircle2 },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingExams = filteredExams.filter((exam) => {
    const startDate = new Date(exam.startDate);
    const now = new Date();
    return startDate >= now && exam.status !== 'completed';
  });

  const handleDelete = async (examId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ujian ini?')) return;
    
    try {
      await apiClient.delete(`/tenants/${tenantId}/exams/${examId}`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      fetchExams();
    } catch (error: any) {
      alert('Gagal menghapus ujian: ' + (error.response?.data?.message || error.message));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileBarChart className="w-8 h-8 text-orange-600" />
              Ujian Online
            </h1>
            <p className="text-gray-600 mt-1">Kelola ujian online untuk kelas yang Anda ampu</p>
          </div>
          <Link
            href={`/${tenantId}/teacher-portal/exams/create`}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Buat Ujian Baru
          </Link>
        </div>

        {/* Upcoming Exams Alert */}
        {upcomingExams.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  {upcomingExams.length} Ujian Mendatang
                </p>
                <p className="text-sm text-orange-700">
                  Ada {upcomingExams.length} ujian yang akan segera dimulai
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ujian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{exam.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{exam.class}</span>
                      </div>
                    </div>
                    {getStatusBadge(exam.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(exam.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration} menit</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{exam.totalQuestions}</span> soal
                    </div>
                    {exam.participants !== undefined && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{exam.participants}</span> peserta
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/${tenantId}/teacher-portal/exams/${exam.id}`}
                      className="flex-1 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </Link>
                    {exam.status === 'draft' && (
                      <>
                        <Link
                          href={`/${tenantId}/teacher-portal/exams/${exam.id}/edit`}
                          className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileBarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada ujian yang sesuai dengan filter'
                : 'Belum ada ujian yang dibuat'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href={`/${tenantId}/teacher-portal/exams/create`}
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                Buat Ujian Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
