'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import Pagination from '@/components/student/Pagination';
import apiClient from '@/lib/api/client';
import { announcementApi, Announcement } from '@/lib/api/announcement';
import { Megaphone, Calendar, Search, Filter, X, Eye } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-orange-600" />
              Pengumuman
            </h1>
            <p className="text-gray-600 mt-1">Lihat semua pengumuman dari sekolah</p>
          </div>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h2>
                <p className="text-gray-600 mb-4 whitespace-pre-line">{announcement.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{announcement.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <EmptyState
              icon={Megaphone}
              title="Tidak ada pengumuman"
              description="Belum ada pengumuman untuk saat ini."
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

