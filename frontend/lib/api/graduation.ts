import apiClient from './client';

export interface Graduation {
  id: number;
  academic_year_id: number;
  academic_year_name?: string;
  student_id: number;
  student_name?: string;
  student_nis?: string;
  class_id?: number;
  class_name?: string;
  graduation_date?: string;
  certificate_number?: string;
  status?: 'pending' | 'approved' | 'graduated';
  notes?: string;
  created_at?: string;
  approved_at?: string;
}

export interface GraduationCreateData {
  academic_year_id: number;
  student_id: number;
  class_id?: number;
  graduation_date?: string;
  certificate_number?: string;
  notes?: string;
}

export interface GraduationBatch {
  academic_year_id: number;
  class_id?: number;
  student_ids: number[];
  graduation_date?: string;
  notes?: string;
}

export const graduationApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Graduation[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/graduations`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Graduation> => {
    const response = await apiClient.get(`/tenants/${tenantId}/graduations/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: GraduationCreateData): Promise<Graduation> => {
    const response = await apiClient.post(`/tenants/${tenantId}/graduations`, data);
    return response.data;
  },

  createBatch: async (tenantId: number, data: GraduationBatch): Promise<{ success: number; failed: number }> => {
    const response = await apiClient.post(`/tenants/${tenantId}/graduations/batch`, data);
    return response.data;
  },

  approve: async (tenantId: number, id: number): Promise<Graduation> => {
    const response = await apiClient.put(`/tenants/${tenantId}/graduations/${id}/approve`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/graduations/${id}`);
  },
};

