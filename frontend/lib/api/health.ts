import apiClient from './client';

export interface HealthRecord {
  id: number;
  instansiId: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
    studentNumber?: string;
  };
  checkupDate: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'chronic';
  height?: number;
  weight?: number;
  temperature?: number;
  bloodPressure?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthRecordCreateData {
  studentId: number;
  checkupDate: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'chronic';
  height?: number;
  weight?: number;
  temperature?: number;
  bloodPressure?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface HealthRecordFilters {
  studentId?: number;
  healthStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const healthApi = {
  getAll: async (
    tenantId: number,
    filters?: HealthRecordFilters,
  ): Promise<{ data: HealthRecord[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/health/records', {
      params: {
        ...filters,
      },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<HealthRecord> => {
    const response = await apiClient.get(`/health/records/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getStatistics: async (
    tenantId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    monthlyTrends: Array<{ month: string; count: number }>;
    dailyTrends: Array<{ date: string; count: number }>;
    bmiStats: { avg: number; min: number; max: number } | null;
  }> => {
    const response = await apiClient.get('/health/statistics', {
      params: {
        startDate,
        endDate,
      },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  create: async (
    tenantId: number,
    data: HealthRecordCreateData,
  ): Promise<HealthRecord> => {
    const response = await apiClient.post('/health/records', data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  update: async (
    tenantId: number,
    id: number,
    data: Partial<HealthRecordCreateData>,
  ): Promise<HealthRecord> => {
    const response = await apiClient.patch(`/health/records/${id}`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/health/records/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },
};

