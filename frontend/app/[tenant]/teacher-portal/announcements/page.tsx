'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetType: 'all' | 'class' | 'subject';
  targetIds: number[];
  targetNames: string[];
  createdAt: string;
  createdBy: string;
  views: number;
}

export default function TeacherAnnouncementsPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [tenantId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/announcements`, {
        params: { createdBy: 'teacher' },
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      await apiClient.delete(`/tenants/${tenantId}/announcements/${id}`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      fetchAnnouncements();
    } catch (error: any) {
      alert('Gagal menghapus pengumuman: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || announcement.targetType === filterType;
    return matchesSearch && matchesFilter;
  });

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
              <Megaphone className="w-8 h-8 text-blue-600" />
              Pengumuman
            </h1>
            <p className="text-gray-600 mt-1">Buat dan kelola pengumuman untuk siswa</p>
          </div>
          <Link
            href={`/${tenantId}/teacher-portal/announcements/create`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Buat Pengumuman
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="all">Semua</option>
                <option value="class">Per Kelas</option>
                <option value="subject">Per Mata Pelajaran</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(announcement.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{announcement.views} dilihat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {announcement.targetType === 'all'
                            ? 'Semua Siswa'
                            : announcement.targetNames.join(', ')}
                        </span>
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
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                  {announcement.content}
                </p>

                {announcement.targetType !== 'all' && announcement.targetNames.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {announcement.targetNames.map((name, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {searchQuery || filterType !== 'all'
                ? 'Tidak ada pengumuman yang sesuai'
                : 'Belum ada pengumuman'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Link
                href={`/${tenantId}/teacher-portal/announcements/create`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                Buat Pengumuman Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
