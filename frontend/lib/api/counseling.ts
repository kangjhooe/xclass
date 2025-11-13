import apiClient from './client';

export interface CounselingSession {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
    studentNumber?: string;
  };
  counselorId?: number;
  counselor?: {
    id: number;
    name: string;
  };
  sessionDate: string;
  issue: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  followUp?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CounselingSessionCreateData {
  studentId: number;
  counselorId?: number;
  sessionDate: string;
  issue: string;
  notes?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  followUp?: string;
  followUpDate?: string;
}

export interface CounselingSessionFilters {
  studentId?: number;
  counselorId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const counselingApi = {
  getAll: async (
    tenantId: number,
    filters?: CounselingSessionFilters,
  ): Promise<{ data: CounselingSession[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/counseling/sessions', {
      params: {
        ...filters,
      },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<CounselingSession> => {
    const response = await apiClient.get(`/counseling/sessions/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  create: async (
    tenantId: number,
    data: CounselingSessionCreateData,
  ): Promise<CounselingSession> => {
    const response = await apiClient.post('/counseling/sessions', data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  update: async (
    tenantId: number,
    id: number,
    data: Partial<CounselingSessionCreateData>,
  ): Promise<CounselingSession> => {
    const response = await apiClient.patch(`/counseling/sessions/${id}`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  updateStatus: async (
    tenantId: number,
    id: number,
    status: string,
  ): Promise<CounselingSession> => {
    const response = await apiClient.patch(
      `/counseling/sessions/${id}/status`,
      { status },
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/counseling/sessions/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },
};

