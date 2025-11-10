import apiClient from './client';

export interface Alumni {
  id: number;
  studentId?: number;
  student?: {
    id: number;
    name: string;
  };
  name: string;
  graduationYear: number;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  company?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlumniCreateData {
  studentId?: number;
  name: string;
  graduationYear: number;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  company?: string;
  status?: string;
  notes?: string;
}

export const alumniApi = {
  getAll: async (
    tenantId: number,
    params?: { status?: string; graduationYear?: number; search?: string; page?: number; limit?: number }
  ): Promise<{ data: Alumni[]; total: number }> => {
    const response = await apiClient.get('/alumni', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Alumni> => {
    const response = await apiClient.get(`/alumni/${id}`);
    return response.data;
  },

  getStatistics: async (tenantId: number) => {
    const response = await apiClient.get('/alumni/statistics');
    return response.data;
  },

  create: async (tenantId: number, data: AlumniCreateData): Promise<Alumni> => {
    const response = await apiClient.post('/alumni', data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<AlumniCreateData>): Promise<Alumni> => {
    const response = await apiClient.patch(`/alumni/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/alumni/${id}`);
  },
};

