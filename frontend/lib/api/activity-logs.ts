import apiClient from './client';

export interface ActivityLog {
  id: number;
  userId: number;
  tenantId: number;
  modelType: string;
  modelId?: number;
  action: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  createdAt: string;
  userName?: string;
}

export interface ActivityLogFilters {
  userId?: number;
  modelType?: string;
  modelId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogStatistics {
  totalActivities: number;
  activitiesByAction: Array<{ action: string; count: number }>;
  activitiesByModel: Array<{ modelType: string; count: number }>;
  topUsers: Array<{ userId: number; count: number }>;
  dailyActivities: Array<{ date: string; count: number }>;
}

export interface ActivityLogTrend {
  date: string;
  action: string;
  count: number;
}

export const activityLogsApi = {
  getAll: async (
    tenantId: number,
    filters?: ActivityLogFilters,
  ): Promise<{ data: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/activity-logs`, { params: filters });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<ActivityLog> => {
    const response = await apiClient.get(`/tenants/${tenantId}/activity-logs/${id}`);
    return response.data;
  },

  getStatistics: async (
    tenantId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ActivityLogStatistics> => {
    const response = await apiClient.get(`/tenants/${tenantId}/activity-logs/statistics`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTrends: async (tenantId: number, days: number = 30): Promise<ActivityLogTrend[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/activity-logs/trends`, {
      params: { days },
    });
    return response.data;
  },

  export: async (tenantId: number, filters?: ActivityLogFilters): Promise<ActivityLog[]> => {
    const response = await apiClient.post(`/tenants/${tenantId}/activity-logs/export`, filters);
    return response.data;
  },
};

