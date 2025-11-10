import apiClient from './client';

export interface PpdbApplication {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  previousSchool?: string;
  desiredClass?: string;
  status: 'pending' | 'approved' | 'rejected' | 'registered';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PpdbApplicationCreateData {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  previousSchool?: string;
  desiredClass?: string;
  notes?: string;
}

export const ppdbApi = {
  getAll: async (
    tenantId: number,
    params?: { status?: string; search?: string; page?: number; limit?: number }
  ): Promise<{ data: PpdbApplication[]; total: number }> => {
    const response = await apiClient.get('/ppdb/registrations', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<PpdbApplication> => {
    const response = await apiClient.get(`/ppdb/registrations/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: PpdbApplicationCreateData): Promise<PpdbApplication> => {
    const response = await apiClient.post('/ppdb/registrations', data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<PpdbApplicationCreateData>): Promise<PpdbApplication> => {
    const response = await apiClient.patch(`/ppdb/registrations/${id}`, data);
    return response.data;
  },

  approve: async (tenantId: number, id: number): Promise<PpdbApplication> => {
    const response = await apiClient.post(`/ppdb/registrations/${id}/approve`);
    return response.data;
  },

  reject: async (tenantId: number, id: number, reason?: string): Promise<PpdbApplication> => {
    const response = await apiClient.post(`/ppdb/registrations/${id}/reject`, { reason });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/ppdb/registrations/${id}`);
  },
};

