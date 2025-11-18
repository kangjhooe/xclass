'use client';

import { useState, useEffect } from 'react';
import { tenantAnnouncementApi, TenantAnnouncement } from '@/lib/api/tenant-announcement';
import { formatDate } from '@/lib/utils/date';
import { useToastStore } from '@/lib/store/toast';

interface AnnouncementWidgetProps {
  tenantId: number;
  userId: number;
  limit?: number;
}

export default function AnnouncementWidget({
  tenantId,
  userId,
  limit = 5,
}: AnnouncementWidgetProps) {
  const [announcements, setAnnouncements] = useState<TenantAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { error: showError } = useToastStore();

  useEffect(() => {
    if (tenantId && userId) {
      loadAnnouncements();
    }
  }, [tenantId, userId]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await tenantAnnouncementApi.getAll({
        limit,
        includeArchived: false,
      });
      setAnnouncements(response.data);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      showError(err?.response?.data?.message || 'Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await tenantAnnouncementApi.markAsRead(id);
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id ? { ...ann, isRead: true, readAt: new Date().toISOString() } : ann,
        ),
      );
    } catch (err: any) {
      console.error('Error marking as read:', err);
      showError(err?.response?.data?.message || 'Gagal menandai sebagai dibaca');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await tenantAnnouncementApi.markAsArchived(id);
      setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    } catch (err: any) {
      console.error('Error archiving:', err);
      showError(err?.response?.data?.message || 'Gagal mengarsipkan');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📢</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pengumuman</h2>
            <p className="text-xs text-gray-500">Pengumuman dari super admin</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📭</span>
          </div>
          <p className="text-sm text-gray-500">Tidak ada pengumuman</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📢</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pengumuman</h2>
            <p className="text-xs text-gray-500">Pengumuman dari super admin</p>
          </div>
        </div>
        {announcements.filter((a) => !a.isRead).length > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {announcements.filter((a) => !a.isRead).length}
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
              !announcement.isRead ? 'ring-2 ring-blue-200' : ''
            } ${getPriorityColor(announcement.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getPriorityIcon(announcement.priority)}</span>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {announcement.title}
                  </h3>
                  {!announcement.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {formatDate(announcement.createdAt)}
                </p>
              </div>
              <div className="flex gap-1">
                {!announcement.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(announcement.id)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Tandai sebagai dibaca"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => handleArchive(announcement.id)}
                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  title="Arsipkan"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              {expandedId === announcement.id ? (
                <div>
                  <div
                    className="whitespace-pre-wrap mb-3"
                    dangerouslySetInnerHTML={{
                      __html: announcement.content.replace(/\n/g, '<br />'),
                    }}
                  />
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Lampiran:</p>
                      {announcement.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <span>📎</span>
                          {att.originalName}
                        </a>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedId(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Sembunyikan
                  </button>
                </div>
              ) : (
                <div>
                  <p className="line-clamp-2">
                    {announcement.content.substring(0, 150)}
                    {announcement.content.length > 150 && '...'}
                  </p>
                  <button
                    onClick={() => setExpandedId(announcement.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Baca selengkapnya
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

