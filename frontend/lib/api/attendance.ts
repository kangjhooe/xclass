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
    params?: {
      studentId?: number;
      scheduleId?: number;
      date?: string;
      startDate?: string;
      endDate?: string;
    }
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

  getSummary: async (
    tenantId: number,
    params?: { scheduleId?: number; date?: string; startDate?: string; endDate?: string },
  ): Promise<{ total: number; present: number; absent: number; late: number; excused: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/attendance/stats/summary`, { params });
    return response.data;
  },

  getDailyStats: async (
    tenantId: number,
    params: { scheduleId?: number; startDate: string; endDate: string },
  ): Promise<
    Array<{ date: string; total: number; present: number; absent: number; late: number; excused: number }>
  > => {
    const response = await apiClient.get(`/tenants/${tenantId}/attendance/stats/daily`, { params });
    return response.data;
  },

  getScheduleStats: async (
    tenantId: number,
    params?: { startDate?: string; endDate?: string; status?: 'present' | 'absent' | 'late' | 'excused' },
  ): Promise<
    Array<{
      scheduleId: number;
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      schedule: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
        className: string | null;
        subjectName: string | null;
        teacherName: string | null;
      };
    }>
  > => {
    const response = await apiClient.get(`/tenants/${tenantId}/attendance/stats/by-schedule`, { params });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/attendance/${id}`);
  },
};

