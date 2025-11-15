'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Filter,
  CheckCheck,
  Trash2,
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function TeacherNotificationsPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [tenantId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/notifications`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.patch(
        `/tenants/${tenantId}/notifications/${id}/read`,
        {},
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(
        `/tenants/${tenantId}/notifications/read-all`,
        {},
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiClient.delete(`/tenants/${tenantId}/notifications/${id}`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error: any) {
      alert('Gagal menghapus notifikasi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
              <Bell className="w-8 h-8 text-blue-600" />
              Notifikasi
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Lihat dan kelola notifikasi Anda</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sudah Dibaca ({notifications.length - unreadCount})
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                  notification.isRead ? 'border-gray-300' : 'border-blue-500'
                } ${getTypeColor(notification.type)} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className={`text-lg font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Baru
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Tandai sebagai dibaca"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {filter === 'unread'
                ? 'Tidak ada notifikasi yang belum dibaca'
                : filter === 'read'
                ? 'Tidak ada notifikasi yang sudah dibaca'
                : 'Belum ada notifikasi'}
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
