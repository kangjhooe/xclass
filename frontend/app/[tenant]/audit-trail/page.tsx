'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { AuditTrailViewer } from '@/components/audit-trail/AuditTrailViewer';
import { AdvancedFilter } from '@/components/ui/AdvancedFilter';
import { auditTrailApi, AuditTrailFilters } from '@/lib/api/audit-trail';
import { useToastStore } from '@/lib/store/toast';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useQuery } from '@tanstack/react-query';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AuditTrailPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const { success, error } = useToastStore();
  const [filters, setFilters] = useState<AuditTrailFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-trail', resolvedTenantId, filters],
    queryFn: () => auditTrailApi.getAll(filters, resolvedTenantId),
    enabled: resolvedTenantId !== undefined,
  });

  const handleExport = async () => {
    try {
      const exportData = await auditTrailApi.export(filters, resolvedTenantId);
      // TODO: Implement actual export (CSV/Excel)
      success(`Exported ${exportData.length} audit trail entries`);
    } catch (err: any) {
      error(err.message || 'Gagal mengekspor audit trail');
    }
  };

  const handleViewDetails = (entry: any) => {
    // TODO: Open modal with full details
    console.log('View details:', entry);
  };

  const handleRestore = async (entry: any) => {
    try {
      const restoreData = await auditTrailApi.getRestoreData(
        entry.entityType,
        entry.entityId!,
        resolvedTenantId
      );
      // TODO: Implement restore functionality
      success('Restore data retrieved. Restore functionality will be implemented.');
      console.log('Restore data:', restoreData);
    } catch (err: any) {
      error(err.message || 'Gagal mendapatkan data restore');
    }
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Trail</h1>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entity Type</label>
              <Input
                value={filters.entityType || ''}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value || undefined })}
                placeholder="Student, Teacher, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <Select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
                placeholder="All Actions"
                options={[
                  { value: 'create', label: 'Create' },
                  { value: 'update', label: 'Update' },
                  { value: 'delete', label: 'Delete' },
                  { value: 'restore', label: 'Restore' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                placeholder="All Status"
                options={[
                  { value: 'success', label: 'Success' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                placeholder="Search..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => refetch()}>Apply Filters</Button>
            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 20 })}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Audit Trail Viewer */}
        <AuditTrailViewer
          data={data?.data || []}
          isLoading={isLoading}
          onExport={handleExport}
          onViewDetails={handleViewDetails}
          onRestore={handleRestore}
          showRestore={true}
        />

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={data.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={data.page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </TenantLayout>
  );
}

