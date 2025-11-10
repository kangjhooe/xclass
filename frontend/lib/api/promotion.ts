import apiClient from './client';

export interface Promotion {
  id: number;
  academic_year_id: number;
  academic_year_name?: string;
  from_class_id: number;
  from_class_name?: string;
  to_class_id: number;
  to_class_name?: string;
  student_id: number;
  student_name?: string;
  student_nis?: string;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at?: string;
  processed_at?: string;
}

export interface PromotionCreateData {
  academic_year_id: number;
  from_class_id: number;
  to_class_id: number;
  student_id: number;
  notes?: string;
}

export interface PromotionBatch {
  academic_year_id: number;
  from_class_id: number;
  to_class_id: number;
  student_ids: number[];
  notes?: string;
}

export const promotionApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Promotion[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/promotions`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Promotion> => {
    const response = await apiClient.get(`/tenants/${tenantId}/promotions/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: PromotionCreateData): Promise<Promotion> => {
    const response = await apiClient.post(`/tenants/${tenantId}/promotions`, data);
    return response.data;
  },

  createBatch: async (tenantId: number, data: PromotionBatch): Promise<{ success: number; failed: number }> => {
    const response = await apiClient.post(`/tenants/${tenantId}/promotions/batch`, data);
    return response.data;
  },

  approve: async (tenantId: number, id: number): Promise<Promotion> => {
    const response = await apiClient.put(`/tenants/${tenantId}/promotions/${id}/approve`);
    return response.data;
  },

  reject: async (tenantId: number, id: number, reason?: string): Promise<Promotion> => {
    const response = await apiClient.put(`/tenants/${tenantId}/promotions/${id}/reject`, { reason });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/promotions/${id}`);
  },
};

