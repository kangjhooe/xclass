import apiClient from './client';

export enum ReportType {
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  ATTENDANCE = 'attendance',
  GRADES = 'grades',
  FINANCIAL = 'financial',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum ReportSchedule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  MANUAL = 'manual',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface CustomReport {
  id: number;
  instansiId: number;
  name: string;
  description?: string;
  type: ReportType;
  config: {
    filters?: Record<string, any>;
    columns?: string[];
    aggregations?: Array<{
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>;
    grouping?: string[];
    sorting?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
  };
  format: ReportFormat;
  schedule: ReportSchedule;
  scheduleTime?: string;
  scheduleDay?: number;
  emailRecipients?: string;
  isActive: boolean;
  createdBy?: number;
  lastRunAt?: string;
  lastRunResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: number;
  instansiId: number;
  reportId: number;
  status: ExecutionStatus;
  filePath?: string;
  errorMessage?: string;
  parameters?: Record<string, any>;
  recordCount?: number;
  startedAt?: string;
  completedAt?: string;
  executedBy?: number;
  createdAt: string;
  report?: CustomReport;
}

export const customReportsApi = {
  createReport: async (
    tenantId: number,
    data: {
      name: string;
      description?: string;
      type: ReportType;
      config: any;
      format: ReportFormat;
      schedule?: ReportSchedule;
      scheduleTime?: string;
      scheduleDay?: number;
      emailRecipients?: string;
    },
  ): Promise<{ data: CustomReport }> => {
    const response = await apiClient.post(`/analytics/custom-reports`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getReports: async (
    tenantId: number,
    isActive?: boolean,
  ): Promise<{ data: CustomReport[] }> => {
    const response = await apiClient.get(`/analytics/custom-reports`, {
      params: { isActive },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getReport: async (tenantId: number, id: number): Promise<{ data: CustomReport }> => {
    const response = await apiClient.get(`/analytics/custom-reports/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  updateReport: async (
    tenantId: number,
    id: number,
    data: Partial<CustomReport>,
  ): Promise<{ data: CustomReport }> => {
    const response = await apiClient.put(`/analytics/custom-reports/${id}`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  deleteReport: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/analytics/custom-reports/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },

  executeReport: async (
    tenantId: number,
    id: number,
    parameters?: Record<string, any>,
  ): Promise<{ data: ReportExecution }> => {
    const response = await apiClient.post(
      `/analytics/custom-reports/${id}/execute`,
      { parameters },
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  getExecutionHistory: async (
    tenantId: number,
    reportId: number,
  ): Promise<{ data: ReportExecution[] }> => {
    const response = await apiClient.get(`/analytics/custom-reports/${reportId}/executions`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },
};

