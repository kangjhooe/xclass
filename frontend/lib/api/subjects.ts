import apiClient from './client';

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  level?: string;
  hoursPerWeek?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectCreateData {
  name: string;
  code?: string;
  description?: string;
  level?: string;
  hoursPerWeek?: number;
  isActive?: boolean;
}

export const subjectsApi = {
  getAll: async (tenantId: number, params?: { search?: string }): Promise<{ data: Subject[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Subject> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: SubjectCreateData): Promise<Subject> => {
    const response = await apiClient.post(`/tenants/${tenantId}/subjects`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<SubjectCreateData>): Promise<Subject> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/subjects/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/subjects/${id}`);
  },
};
