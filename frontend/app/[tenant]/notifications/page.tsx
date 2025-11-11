'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { notificationApi, Notification } from '@/lib/api/notification';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function NotificationsPage() {
  const tenantId = useTenantId();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', tenantId],
    queryFn: () => notificationApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return notificationApi.markAsRead(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', tenantId] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return notificationApi.markAllAsRead(tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return notificationApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', tenantId] });
    },
  });

  const filteredData = data?.data?.filter((notification) => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterStatus !== 'all' && notification.status !== filterStatus) return false;
    return true;
  }) || [];

  const totalNotifications = data?.data?.length || 0;
  const unreadCount = data?.data?.filter((n) => n.status === 'unread').length || 0;
  const readCount = data?.data?.filter((n) => n.status === 'read').length || 0;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Notifikasi
              </h1>
              <p className="text-gray-600">Kelola notifikasi dan pemberitahuan</p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={() => {
                  if (!tenantId) {
                    alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                    return;
                  }
                  markAllAsReadMutation.mutate();
                }}
                variant="outline"
                className="hover:bg-blue-50 transition-colors"
                loading={markAllAsReadMutation.isPending}
              >
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Notifikasi</p>
                <p className="text-3xl font-bold text-blue-600">{totalNotifications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Belum Dibaca</p>
                <p className="text-3xl font-bold text-yellow-600">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sudah Dibaca</p>
                <p className="text-3xl font-bold text-green-600">{readCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tipe</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="info">Info</option>
                <option value="success">Sukses</option>
                <option value="warning">Peringatan</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  notification.status === 'unread' 
                    ? 'border-blue-300 bg-blue-50/50' 
                    : 'border-gray-200'
                } ${getTypeColor(notification.type)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{notification.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                        </div>
                        {notification.status === 'unread' && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-700 mt-3">{notification.message}</p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
                        >
                          Lihat Detail →
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {notification.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!tenantId) {
                              alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                              return;
                            }
                            markAsReadMutation.mutate(notification.id);
                          }}
                          className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          loading={markAsReadMutation.isPending}
                        >
                          Tandai Dibaca
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
                            if (!tenantId) {
                              alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                              return;
                            }
                            deleteMutation.mutate(notification.id);
                          }
                        }}
                        className="hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}
