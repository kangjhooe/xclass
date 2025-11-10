import apiClient from './client';

export interface Teacher {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  nip?: string;
  nik?: string;
  nuptk?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  education?: string;
  specialization?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherCreateData {
  name: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  nip?: string;
  nik?: string;
  nuptk?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  education?: string;
  specialization?: string;
  isActive?: boolean;
}

export const teachersApi = {
  getAll: async (tenantId: number, params?: { search?: string }): Promise<{ data: Teacher[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/teachers`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Teacher> => {
    const response = await apiClient.get(`/tenants/${tenantId}/teachers/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: TeacherCreateData): Promise<Teacher> => {
    const response = await apiClient.post(`/tenants/${tenantId}/teachers`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<TeacherCreateData>): Promise<Teacher> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/teachers/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/teachers/${id}`);
  },
};
