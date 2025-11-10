import apiClient from './client';

export interface Attendance {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  scheduleId: number;
  schedule?: {
    id: number;
    subject?: {
      name: string;
    };
  };
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  teacherId?: number;
  teacher?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceCreateData {
  studentId: number;
  scheduleId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  teacherId?: number;
}

export const attendanceApi = {
  getAll: async (
    tenantId: number,
    params?: { studentId?: number; scheduleId?: number; date?: string }
  ): Promise<{ data: Attendance[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/attendance`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Attendance> => {
    const response = await apiClient.get(`/tenants/${tenantId}/attendance/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: AttendanceCreateData): Promise<Attendance> => {
    const response = await apiClient.post(`/tenants/${tenantId}/attendance`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<AttendanceCreateData>): Promise<Attendance> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/attendance/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/attendance/${id}`);
  },
};

