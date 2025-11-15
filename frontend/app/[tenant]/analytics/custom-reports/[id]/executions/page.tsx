'use client';

import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { customReportsApi, ReportExecution, ExecutionStatus } from '@/lib/api/custom-reports';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { History, Download, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';

export default function ReportExecutionsPage() {
  const params = useParams();
  const tenantId = useTenantId();
  const reportId = parseInt(params.id as string);

  const { data: reportData } = useQuery({
    queryKey: ['custom-report', tenantId, reportId],
    queryFn: () => customReportsApi.getReport(tenantId!, reportId),
    enabled: !!tenantId && !!reportId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['report-executions', tenantId, reportId],
    queryFn: () => customReportsApi.getExecutionHistory(tenantId!, reportId),
    enabled: !!tenantId && !!reportId,
  });

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ExecutionStatus.FAILED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case ExecutionStatus.RUNNING:
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case ExecutionStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: ExecutionStatus) => {
    const badges = {
      [ExecutionStatus.PENDING]: (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>
      ),
      [ExecutionStatus.RUNNING]: (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Running</span>
      ),
      [ExecutionStatus.COMPLETED]: (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Completed</span>
      ),
      [ExecutionStatus.FAILED]: (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Failed</span>
      ),
      [ExecutionStatus.CANCELLED]: (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Cancelled</span>
      ),
    };
    return badges[status] || null;
  };

  const executions = data?.data || [];
  const report = reportData?.data;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="analytics"
        title={`Execution History - ${report?.name || 'Report'}`}
        description="Riwayat eksekusi report"
        actions={
          <Link href={`/${params.tenant}/analytics/custom-reports`}>
            <Button variant="outline">Kembali</Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada eksekusi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(execution.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Execution #{execution.id}</h3>
                        {getStatusBadge(execution.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        {execution.startedAt && (
                          <div>
                            <p className="text-xs text-gray-600">Started</p>
                            <p className="text-sm font-medium">{formatDate(execution.startedAt)}</p>
                          </div>
                        )}
                        {execution.completedAt && (
                          <div>
                            <p className="text-xs text-gray-600">Completed</p>
                            <p className="text-sm font-medium">{formatDate(execution.completedAt)}</p>
                          </div>
                        )}
                        {execution.recordCount !== null && (
                          <div>
                            <p className="text-xs text-gray-600">Records</p>
                            <p className="text-sm font-medium">{execution.recordCount}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-600">Created</p>
                          <p className="text-sm font-medium">{formatDate(execution.createdAt)}</p>
                        </div>
                      </div>

                      {execution.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <p className="text-sm font-medium text-red-900 mb-1">Error:</p>
                          <p className="text-sm text-red-800">{execution.errorMessage}</p>
                        </div>
                      )}

                      {execution.parameters && Object.keys(execution.parameters).length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">Parameters:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(execution.parameters, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {execution.status === ExecutionStatus.COMPLETED && execution.filePath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Download file
                        window.open(execution.filePath, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

