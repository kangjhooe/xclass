'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { notificationChannelsApi, NotificationStatistics, NotificationLog } from '@/lib/api/notification-channels';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { BarChart3, TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function NotificationAnalyticsPage() {
  const tenantId = useTenantId();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-statistics', tenantId, dateRange],
    queryFn: () =>
      notificationChannelsApi.getStatistics(tenantId!, dateRange.startDate, dateRange.endDate),
    enabled: !!tenantId,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['notification-logs', tenantId, dateRange],
    queryFn: () =>
      notificationChannelsApi.getLogs(tenantId!, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 50,
      }),
    enabled: !!tenantId,
  });

  const stats: NotificationStatistics = statsData?.data || {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    byType: {},
    byStatus: {},
    totalCost: 0,
  };

  const logs: NotificationLog[] = logsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-purple-100 text-purple-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'push':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="notifications"
        title="Analytics Notifikasi"
        description="Dashboard monitoring dan analytics untuk notifikasi"
      >
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {statsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat statistik...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Notifikasi</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Berhasil Dikirim</p>
                      <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gagal</p>
                      <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-red-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="w-12 h-12 text-yellow-600 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Cost Card */}
              {stats.totalCost > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Biaya</p>
                      <p className="text-3xl font-bold text-purple-600">
                        Rp {stats.totalCost.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-purple-600 opacity-50" />
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Type */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Notifikasi per Tipe</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{type}</span>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getTypeColor(type)}`}
                            style={{
                              width: `${(count / stats.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Status */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Notifikasi per Status</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{status}</span>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{
                              width: `${(count / stats.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Log Notifikasi Terbaru</h3>
                {logsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Tidak ada log</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Tanggal</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Tipe</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Penerima</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Provider</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Biaya</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm">{formatDate(log.createdAt)}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 text-xs rounded ${getTypeColor(log.type)}`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {log.recipient ? log.recipient.substring(0, 20) + '...' : '-'}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">{log.provider || '-'}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {log.cost ? `Rp ${log.cost.toLocaleString('id-ID')}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ModulePageShell>
    </TenantLayout>
  );
}

