'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  customReportsApi,
  CustomReport,
  ReportType,
  ReportFormat,
  ReportSchedule,
  ReportExecution,
} from '@/lib/api/custom-reports';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { FileText, Plus, Play, History, Download, Trash2, Edit, Calendar, Clock, Mail, Power, PowerOff } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CustomReportsPage() {
  const params = useParams();
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ReportType.STUDENTS,
    format: ReportFormat.PDF,
    schedule: ReportSchedule.MANUAL,
    scheduleTime: '',
    scheduleDay: '',
    emailRecipients: '',
    config: {
      filters: {},
      columns: [],
      aggregations: [],
      grouping: [],
      sorting: [],
    },
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['custom-reports', tenantId],
    queryFn: () => customReportsApi.getReports(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.createReport(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const executeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.executeReport(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
      setIsExecutionModalOpen(false);
      alert('Report sedang diproses. Silakan cek history untuk hasilnya.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.deleteReport(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomReport> }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return customReportsApi.updateReport(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports', tenantId] });
      setIsScheduleModalOpen(false);
      setSelectedReport(null);
    },
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: ReportType.STUDENTS,
      format: ReportFormat.PDF,
      schedule: ReportSchedule.MANUAL,
      scheduleTime: '',
      scheduleDay: '',
      emailRecipients: '',
      config: {
        filters: {},
        columns: [],
        aggregations: [],
        grouping: [],
        sorting: [],
      },
    });
    setSelectedReport(null);
  };

  const handleEdit = (report: CustomReport) => {
    setSelectedReport(report);
    setFormData({
      name: report.name,
      description: report.description || '',
      type: report.type,
      format: report.format,
      schedule: report.schedule,
      scheduleTime: report.scheduleTime || '',
      scheduleDay: report.scheduleDay?.toString() || '',
      emailRecipients: report.emailRecipients || '',
      config: {
        filters: report.config?.filters || {},
        columns: report.config?.columns || [],
        aggregations: report.config?.aggregations || [],
        grouping: report.config?.grouping || [],
        sorting: report.config?.sorting || [],
      },
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama report harus diisi');
      return;
    }
    createMutation.mutate({
      ...formData,
      scheduleTime: formData.scheduleTime || undefined,
      scheduleDay: formData.scheduleDay ? parseInt(formData.scheduleDay) : undefined,
    });
  };

  const reports = data?.data || [];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="analytics"
        title="Custom Reports"
        description="Buat dan kelola custom reports"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${params.tenant}/analytics/custom-reports/scheduled`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled
              </Button>
            </Link>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Buat Report
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada custom report</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
              Buat Report Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{report.name}</h3>
                    {report.description && (
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                        {report.type}
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded uppercase">
                        {report.format}
                      </span>
                      {report.schedule !== ReportSchedule.MANUAL && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded capitalize flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.schedule}
                        </span>
                      )}
                      {report.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                          <Power className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded flex items-center gap-1">
                          <PowerOff className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {report.lastRunAt && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last run: {formatDate(report.lastRunAt)}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      setIsExecutionModalOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Execute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(report)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {report.schedule !== ReportSchedule.MANUAL && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsScheduleModalOpen(true);
                      }}
                      className="flex items-center gap-2"
                      title="Manage Schedule"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  )}
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Hapus report ini?')) {
                        deleteMutation.mutate(report.id);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Report Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedReport ? 'Edit Report' : 'Buat Custom Report'} 
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Report *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Textarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipe Report *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportType })}
                options={[
                  { value: ReportType.STUDENTS, label: 'Students' },
                  { value: ReportType.TEACHERS, label: 'Teachers' },
                  { value: ReportType.ATTENDANCE, label: 'Attendance' },
                  { value: ReportType.GRADES, label: 'Grades' },
                  { value: ReportType.FINANCIAL, label: 'Financial' },
                  { value: ReportType.CUSTOM, label: 'Custom' },
                ]}
              />

              <Select
                label="Format *"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as ReportFormat })}
                options={[
                  { value: ReportFormat.PDF, label: 'PDF' },
                  { value: ReportFormat.EXCEL, label: 'Excel' },
                  { value: ReportFormat.CSV, label: 'CSV' },
                  { value: ReportFormat.JSON, label: 'JSON' },
                ]}
              />
            </div>

            <Select
              label="Schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value as ReportSchedule })}
              options={[
                { value: ReportSchedule.MANUAL, label: 'Manual' },
                { value: ReportSchedule.DAILY, label: 'Daily' },
                { value: ReportSchedule.WEEKLY, label: 'Weekly' },
                { value: ReportSchedule.MONTHLY, label: 'Monthly' },
                { value: ReportSchedule.QUARTERLY, label: 'Quarterly' },
                { value: ReportSchedule.YEARLY, label: 'Yearly' },
              ]}
            />

            {formData.schedule !== ReportSchedule.MANUAL && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Schedule Time"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
                <Input
                  label="Schedule Day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.scheduleDay}
                  onChange={(e) => setFormData({ ...formData, scheduleDay: e.target.value })}
                  placeholder="Day of month/week"
                />
              </div>
            )}

            <Input
              label="Email Recipients (comma-separated)"
              value={formData.emailRecipients}
              onChange={(e) => setFormData({ ...formData, emailRecipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {selectedReport ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Execution Modal */}
        <Modal
          isOpen={isExecutionModalOpen}
          onClose={() => {
            setIsExecutionModalOpen(false);
            setSelectedReport(null);
          }}
          title="Execute Report"
        >
          {selectedReport && (
            <div className="space-y-4">
              <p>Apakah Anda yakin ingin mengeksekusi report ini?</p>
              <p className="text-sm text-gray-600">
                <strong>{selectedReport.name}</strong> akan di-generate dalam format{' '}
                <strong>{selectedReport.format.toUpperCase()}</strong>
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsExecutionModalOpen(false);
                    setSelectedReport(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => executeMutation.mutate(selectedReport.id)}
                  loading={executeMutation.isPending}
                >
                  Execute
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Schedule Management Modal */}
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedReport(null);
          }}
          title="Manage Schedule"
          size="xl"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedReport.name}</h3>
                <p className="text-sm text-blue-800">
                  Kelola pengaturan schedule untuk report ini. Report akan otomatis di-generate sesuai jadwal yang
                  ditentukan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                  <Select
                    value={selectedReport.schedule}
                    onChange={(e) => {
                      setSelectedReport({
                        ...selectedReport,
                        schedule: e.target.value as ReportSchedule,
                      });
                    }}
                    options={[
                      { value: ReportSchedule.DAILY, label: 'Daily' },
                      { value: ReportSchedule.WEEKLY, label: 'Weekly' },
                      { value: ReportSchedule.MONTHLY, label: 'Monthly' },
                      { value: ReportSchedule.QUARTERLY, label: 'Quarterly' },
                      { value: ReportSchedule.YEARLY, label: 'Yearly' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
                  <Input
                    type="time"
                    value={selectedReport.scheduleTime || ''}
                    onChange={(e) => {
                      setSelectedReport({
                        ...selectedReport,
                        scheduleTime: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              {(selectedReport.schedule === ReportSchedule.WEEKLY ||
                selectedReport.schedule === ReportSchedule.MONTHLY) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedReport.schedule === ReportSchedule.WEEKLY
                      ? 'Day of Week (1=Monday, 7=Sunday)'
                      : 'Day of Month (1-31)'}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedReport.schedule === ReportSchedule.WEEKLY ? '7' : '31'}
                    value={selectedReport.scheduleDay?.toString() || ''}
                    onChange={(e) => {
                      setSelectedReport({
                        ...selectedReport,
                        scheduleDay: e.target.value ? parseInt(e.target.value) : undefined,
                      });
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Recipients (comma-separated)
                </label>
                <Input
                  value={selectedReport.emailRecipients || ''}
                  onChange={(e) => {
                    setSelectedReport({
                      ...selectedReport,
                      emailRecipients: e.target.value,
                    });
                  }}
                  placeholder="email1@example.com, email2@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email akan dikirim otomatis saat report selesai di-generate
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedReport.isActive}
                  onChange={(e) => {
                    setSelectedReport({
                      ...selectedReport,
                      isActive: e.target.checked,
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aktifkan scheduled report
                </label>
              </div>

              {selectedReport.lastRunAt && (
                <div className="bg-gray-50 border rounded p-3">
                  <p className="text-sm text-gray-600">
                    <strong>Last Run:</strong> {formatDate(selectedReport.lastRunAt)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setSelectedReport(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    updateScheduleMutation.mutate({
                      id: selectedReport.id,
                      data: {
                        schedule: selectedReport.schedule,
                        scheduleTime: selectedReport.scheduleTime,
                        scheduleDay: selectedReport.scheduleDay,
                        emailRecipients: selectedReport.emailRecipients,
                        isActive: selectedReport.isActive,
                      },
                    });
                  }}
                  loading={updateScheduleMutation.isPending}
                >
                  Simpan Schedule
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

