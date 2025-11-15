'use client';

import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { customReportsApi, CustomReport, ReportSchedule } from '@/lib/api/custom-reports';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { Calendar, Clock, Mail, Power, PowerOff, Play, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ScheduledReportsPage() {
  const params = useParams();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['custom-reports', tenantId],
    queryFn: () => customReportsApi.getReports(tenantId!),
    enabled: !!tenantId,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.updateReport(tenantId, id, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
    },
  });

  const executeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.executeReport(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
      alert('Report sedang diproses.');
    },
  });

  const reports = data?.data || [];
  const scheduledReports = reports.filter((r) => r.schedule !== ReportSchedule.MANUAL);

  const getScheduleDescription = (report: CustomReport) => {
    const scheduleLabels: Record<ReportSchedule, string> = {
      [ReportSchedule.DAILY]: 'Setiap hari',
      [ReportSchedule.WEEKLY]: 'Setiap minggu',
      [ReportSchedule.MONTHLY]: 'Setiap bulan',
      [ReportSchedule.QUARTERLY]: 'Setiap kuartal',
      [ReportSchedule.YEARLY]: 'Setiap tahun',
      [ReportSchedule.MANUAL]: 'Manual',
    };

    let desc = scheduleLabels[report.schedule] || report.schedule;
    if (report.scheduleTime) {
      desc += ` pada pukul ${report.scheduleTime}`;
    }
    if (report.scheduleDay) {
      if (report.schedule === ReportSchedule.WEEKLY) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        desc += ` (${days[report.scheduleDay - 1] || `Hari ${report.scheduleDay}`})`;
      } else {
        desc += ` (Tanggal ${report.scheduleDay})`;
      }
    }
    return desc;
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="analytics"
        title="Scheduled Reports"
        description="Kelola report yang dijadwalkan otomatis"
        actions={
          <Link href={`/${params.tenant}/analytics/custom-reports`}>
            <Button variant="outline">Kembali ke Reports</Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : scheduledReports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada scheduled reports</p>
            <Link href={`/${params.tenant}/analytics/custom-reports`}>
              <Button className="mt-4">Buat Scheduled Report</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white border rounded-lg p-6 ${
                  report.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.name}</h3>
                      {report.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                          <Power className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded flex items-center gap-1">
                          <PowerOff className="w-3 h-3" />
                          Nonaktif
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded uppercase">
                        {report.format}
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Schedule</p>
                          <p className="text-sm text-gray-900">{getScheduleDescription(report)}</p>
                        </div>
                      </div>

                      {report.emailRecipients && (
                        <div className="flex items-start gap-2">
                          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email Recipients</p>
                            <p className="text-sm text-gray-900">{report.emailRecipients}</p>
                          </div>
                        </div>
                      )}

                      {report.lastRunAt && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Run</p>
                            <p className="text-sm text-gray-900">{formatDate(report.lastRunAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeMutation.mutate(report.id)}
                      className="flex items-center gap-2"
                      title="Execute Now"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={report.isActive ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => {
                        toggleActiveMutation.mutate({ id: report.id, isActive: !report.isActive });
                      }}
                      className="flex items-center gap-2"
                      title={report.isActive ? 'Disable' : 'Enable'}
                    >
                      {report.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                    <Link href={`/${params.tenant}/analytics/custom-reports`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

