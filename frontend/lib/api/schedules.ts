import apiClient from './client';

export interface Schedule {
  id: number;
  classId: number;
  classRoom?: {
    id: number;
    name: string;
  };
  subjectId: number;
  subject?: {
    id: number;
    name: string;
  };
  teacherId: number;
  teacher?: {
    id: number;
    name: string;
  };
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  room?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleCreateData {
  classId: number;
  subjectId: number;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  isActive?: boolean;
}

export const schedulesApi = {
  getAll: async (
    tenantId: number,
    params?: { classId?: number; teacherId?: number; dayOfWeek?: number }
  ): Promise<{ data: Schedule[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/schedules`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Schedule> => {
    const response = await apiClient.get(`/tenants/${tenantId}/schedules/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: ScheduleCreateData): Promise<Schedule> => {
    const response = await apiClient.post(`/tenants/${tenantId}/schedules`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<ScheduleCreateData>): Promise<Schedule> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/schedules/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/schedules/${id}`);
  },
};

