'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import Pagination from '@/components/student/Pagination';
import apiClient from '@/lib/api/client';
import { announcementApi, Announcement } from '@/lib/api/announcement';
import { Megaphone, Calendar, Search, Filter, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Modal } from '@/components/ui/Modal';

export default function StudentAnnouncementsPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use announcementApi first, fallback to mobile API
        const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
        
        if (tenantIdNum) {
          try {
            const response = await announcementApi.getAll(tenantIdNum, {
              status: 'published',
              page: currentPage,
              limit: itemsPerPage,
            });
            setAnnouncements(Array.isArray(response.data) ? response.data : []);
          } catch (err) {
            // Fallback to mobile API
            const mobileResponse = await apiClient.get('/mobile/dashboard', {
              headers: {
                'X-Tenant-NPSN': tenantId,
              },
            });
            if (mobileResponse.data.success && mobileResponse.data.data) {
              const announcementsData = mobileResponse.data.data.announcements || [];
              setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
            }
          }
        } else {
          const response = await apiClient.get('/mobile/dashboard', {
            headers: {
              'X-Tenant-NPSN': tenantId,
            },
          });
          if (response.data.success && response.data.data) {
            const announcementsData = response.data.data.announcements || [];
            setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
          }
        }
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(err.response?.data?.message || 'Gagal memuat pengumuman');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [tenantId, currentPage]);

  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  // Filter and search announcements
  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(query) ||
        a.content?.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(a => {
        if (!a.created_at) return false;
        const createdDate = new Date(a.created_at);
        switch (filterDate) {
          case 'today':
            return createdDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return createdDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [announcements, searchQuery, filterPriority, filterDate]);

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPriority, filterDate]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'Mendesak';
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return 'Normal';
    }
  };

  const handleViewDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-orange-600" />
              Pengumuman
            </h1>
            <p className="text-gray-600 mt-1">Lihat semua pengumuman dari sekolah</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari pengumuman (judul, konten, kategori)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Prioritas
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      filterPriority === priority
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'Semua' : getPriorityLabel(priority)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Filter Tanggal
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'today', 'week', 'month'].map((date) => (
                  <button
                    key={date}
                    onClick={() => setFilterDate(date)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      filterDate === date
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {date === 'all' && 'Semua'}
                    {date === 'today' && 'Hari Ini'}
                    {date === 'week' && 'Minggu Ini'}
                    {date === 'month' && 'Bulan Ini'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-gray-600 mt-4">
              Menampilkan {filteredAnnouncements.length} dari {announcements.length} pengumuman
            </p>
          )}
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleViewDetail(announcement)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
                        {announcement.priority && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${getPriorityColor(announcement.priority)}`}>
                            {getPriorityLabel(announcement.priority)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{announcement.created_at ? formatDate(announcement.created_at) : '-'}</span>
                        </div>
                        {announcement.category && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{announcement.category}</span>
                        )}
                        {announcement.author_name && (
                          <span className="text-xs">Oleh: {announcement.author_name}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(announcement);
                      }}
                      className="ml-4 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Lihat detail"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <EmptyState
              icon={Megaphone}
              title={searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada pengumuman"}
              description={searchQuery
                ? `Tidak ada pengumuman yang sesuai dengan pencarian "${searchQuery}".`
                : "Belum ada pengumuman untuk saat ini."}
            />
          </div>
        )}

        {/* Detail Modal */}
        {selectedAnnouncement && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedAnnouncement(null);
            }}
            title={selectedAnnouncement.title}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedAnnouncement.priority && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${getPriorityColor(selectedAnnouncement.priority)}`}>
                    {getPriorityLabel(selectedAnnouncement.priority)}
                  </span>
                )}
                {selectedAnnouncement.category && (
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm">{selectedAnnouncement.category}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedAnnouncement.created_at ? formatDate(selectedAnnouncement.created_at) : '-'}</span>
                </div>
                {selectedAnnouncement.author_name && (
                  <span>Oleh: {selectedAnnouncement.author_name}</span>
                )}
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{selectedAnnouncement.content}</p>
              </div>

              {selectedAnnouncement.expires_at && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Berlaku hingga:</strong> {formatDate(selectedAnnouncement.expires_at)}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </StudentLayout>
  );
}

