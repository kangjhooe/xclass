'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Video,
  Image,
  File,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  type: 'document' | 'video' | 'image' | 'other';
  subject: string;
  class: string;
  uploadedAt: string;
  fileUrl?: string;
  description?: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: 'active' | 'completed';
}

export default function TeacherELearningPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchAssignments();
  }, [tenantId]);

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/elearning/materials`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setMaterials(response.data.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/elearning/assignments`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  const getTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Material['type']) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-700';
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              E-Learning
            </h1>
            <p className="text-gray-600 mt-1">Kelola materi pembelajaran dan tugas online</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'materials' ? (
              <Link
                href={`/${tenantId}/teacher-portal/elearning/materials/create`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Materi
              </Link>
            ) : (
              <Link
                href={`/${tenantId}/teacher-portal/elearning/assignments/create`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Buat Tugas
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'materials'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Materi Pembelajaran
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'assignments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tugas Online
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Cari ${activeTab === 'materials' ? 'materi' : 'tugas'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <>
            {filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${getTypeColor(material.type)} rounded-lg flex items-center justify-center`}>
                          {getTypeIcon(material.type)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}>
                          {material.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {material.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <span>{material.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{material.class}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(material.uploadedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {material.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {material.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        {material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                        <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  {searchQuery ? 'Tidak ada materi yang sesuai' : 'Belum ada materi pembelajaran'}
                </p>
                {!searchQuery && (
                  <Link
                    href={`/${tenantId}/teacher-portal/elearning/materials/create`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Materi Pertama
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            {filteredAssignments.length > 0 ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {assignment.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                assignment.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {assignment.status === 'active' ? 'Aktif' : 'Selesai'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{assignment.subject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{assignment.class}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>
                                {assignment.submitted} dari {assignment.total} siswa sudah mengumpulkan
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(assignment.submitted / assignment.total) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  {searchQuery ? 'Tidak ada tugas yang sesuai' : 'Belum ada tugas online'}
                </p>
                {!searchQuery && (
                  <Link
                    href={`/${tenantId}/teacher-portal/elearning/assignments/create`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Tugas Pertama
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
