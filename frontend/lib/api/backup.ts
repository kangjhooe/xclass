import { apiClient } from './client';

export enum BackupType {
  FULL = 'full',
  DATABASE = 'database',
  FILES = 'files',
  TENANT = 'tenant',
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Backup {
  id: number;
  name: string;
  type: BackupType;
  status: BackupStatus;
  filePath?: string;
  fileSize?: number;
  tenantId?: number;
  description?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupListResponse {
  data: Backup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const backupApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: BackupType;
    status?: BackupStatus;
    tenantId?: number;
  }) => {
    return apiClient.get<BackupListResponse>('/admin/backups', { params });
  },

  getOne: (id: number) => {
    return apiClient.get<Backup>(`/admin/backups/${id}`);
  },

  create: (data: {
    type: BackupType;
    name: string;
    tenantId?: number;
    description?: string;
  }) => {
    return apiClient.post<Backup>('/admin/backups', data);
  },

  restore: (id: number) => {
    return apiClient.post(`/admin/backups/${id}/restore`);
  },

  download: (id: number) => {
    return apiClient.get(`/admin/backups/${id}/download`, {
      responseType: 'blob',
    });
  },

  delete: (id: number) => {
    return apiClient.delete(`/admin/backups/${id}`);
  },
};

