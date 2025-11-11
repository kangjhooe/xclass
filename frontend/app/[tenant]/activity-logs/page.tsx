'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  ModuleCard,
  ModuleEmptyState,
  ModuleHeader,
  ModuleLoadingState,
  ModulePage,
  ModuleSection,
  ModuleStatCard,
  ModuleStatsGrid,
} from '@/components/ui/module';
import { activityLogsApi, ActivityLog } from '@/lib/api/activity-logs';
import { formatDate } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ActivityLogsPage() {
  const tenantId = useTenantId();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    modelType: '',
    action: '',
    startDate: '',
    endDate: '',
    searchQuery: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', tenantId, currentPage, filters],
    queryFn: () =>
      activityLogsApi.getAll(tenantId!, {
        page: currentPage,
        limit: itemsPerPage,
        modelType: filters.modelType || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
    enabled: !!tenantId,
  });

  const { data: statistics } = useQuery({
    queryKey: ['activity-logs-statistics', tenantId, filters.startDate, filters.endDate],
    queryFn: () =>
      activityLogsApi.getStatistics(
        tenantId!,
        filters.startDate || undefined,
        filters.endDate || undefined,
      ),
    enabled: !!tenantId,
  });

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    try {
      const logs = await activityLogsApi.export(tenantId, {
        modelType: filters.modelType || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      console.log(`Exporting ${logs.length} logs to ${format}...`);
      // TODO: Implement actual export functionality
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; className: string }> = {
      create: { label: 'Buat', className: 'bg-green-100 text-green-800' },
      update: { label: 'Update', className: 'bg-blue-100 text-blue-800' },
      delete: { label: 'Hapus', className: 'bg-red-100 text-red-800' },
      login: { label: 'Login', className: 'bg-purple-100 text-purple-800' },
      logout: { label: 'Logout', className: 'bg-gray-100 text-gray-800' },
      view: { label: 'Lihat', className: 'bg-yellow-100 text-yellow-800' },
    };
    const actionInfo = actionMap[action] || { label: action, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${actionInfo.className}`}>
        {actionInfo.label}
      </span>
    );
  };

  const totalPages = data ? Math.ceil((data.total || 0) / itemsPerPage) : 1;

  return (
    <TenantLayout>
      <ModulePage variant="indigo">
        <ModuleHeader
          title="Log Aktivitas"
          description="Pantau semua aktivitas sistem di instansi Anda secara real-time."
          variant="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          actions={<ExportButton onExport={handleExport} filename="activity-logs" />}
        />

        {statistics && (
          <ModuleStatsGrid columns={4}>
            <ModuleStatCard
              label="Total Aktivitas"
              value={statistics.totalActivities}
              accent="primary"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              }
            />
            <ModuleStatCard
              label="Aksi Create"
              value={statistics.activitiesByAction.find((a) => a.action === 'create')?.count || 0}
              accent="success"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            />
            <ModuleStatCard
              label="Aksi Update"
              value={statistics.activitiesByAction.find((a) => a.action === 'update')?.count || 0}
              accent="info"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            />
            <ModuleStatCard
              label="Aksi Delete"
              value={statistics.activitiesByAction.find((a) => a.action === 'delete')?.count || 0}
              accent="danger"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            />
          </ModuleStatsGrid>
        )}

        <ModuleSection
          title="Filter Aktivitas"
          description="Persempit pencarian log aktivitas berdasarkan kriteria tertentu."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tipe Model</label>
              <select
                value={filters.modelType}
                onChange={(e) => setFilters({ ...filters, modelType: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Tipe</option>
                <option value="Student">Siswa</option>
                <option value="Teacher">Guru</option>
                <option value="Class">Kelas</option>
                <option value="Subject">Mata Pelajaran</option>
                <option value="Announcement">Pengumuman</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Aksi</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Aksi</option>
                <option value="create">Buat</option>
                <option value="update">Update</option>
                <option value="delete">Hapus</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="view">Lihat</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Mulai</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Akhir</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() =>
                  setFilters({
                    modelType: '',
                    action: '',
                    startDate: '',
                    endDate: '',
                    searchQuery: '',
                  })
                }
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </ModuleSection>

        {isLoading ? (
          <ModuleLoadingState description="Mengambil data log aktivitas terbaru." />
        ) : (
          <>
            <ModuleCard padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/60">
                      <TableHead className="font-semibold text-slate-700">Waktu</TableHead>
                      <TableHead className="font-semibold text-slate-700">User</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tipe Model</TableHead>
                      <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
                      <TableHead className="font-semibold text-slate-700">Deskripsi</TableHead>
                      <TableHead className="font-semibold text-slate-700">IP Address</TableHead>
                      <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.map((log) => (
                      <TableRow key={log.id} className="hover:bg-indigo-50/40 transition-colors">
                        <TableCell className="text-slate-800">{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {log.userName || `User #${log.userId}`}
                        </TableCell>
                        <TableCell>{log.modelType || '-'}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.description || '-'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{log.ipAddress || '-'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(log)}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.data || data.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12">
                          <ModuleEmptyState
                            title="Tidak ada data log aktivitas"
                            description="Belum ada aktivitas yang tercatat untuk periode dan filter yang dipilih."
                            icon={
                              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ModuleCard>

            {data && data.total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLog(null);
          }}
          title="Detail Log Aktivitas"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                  <p className="text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-gray-900">{selectedLog.userName || `User #${selectedLog.userId}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aksi</label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Model</label>
                  <p className="text-gray-900">{selectedLog.modelType || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model ID</label>
                  <p className="text-gray-900">{selectedLog.modelId || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <p className="text-gray-900">{selectedLog.ipAddress || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                  <p className="text-gray-900 text-sm break-words">{selectedLog.userAgent || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <p className="text-gray-900">{selectedLog.description || '-'}</p>
              </div>
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perubahan</label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal>
      </ModulePage>
    </TenantLayout>
  );
}
