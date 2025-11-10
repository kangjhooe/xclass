import apiClient from './client';

export interface Student {
  id: number;
  nisn?: string;
  nis?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  class_id?: number;
  class_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentCreateData {
  nisn?: string;
  nis?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  class_id?: number;
  status?: string;
}

export const studentsApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Student[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/students`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Student> => {
    const response = await apiClient.get(`/tenants/${tenantId}/students/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: StudentCreateData): Promise<Student> => {
    const response = await apiClient.post(`/tenants/${tenantId}/students`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<StudentCreateData>): Promise<Student> => {
    const response = await apiClient.put(`/tenants/${tenantId}/students/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/students/${id}`);
  },
};

