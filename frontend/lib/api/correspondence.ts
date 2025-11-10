import apiClient from './client';

export interface Correspondence {
  id: number;
  reference_number?: string;
  subject: string;
  type: 'incoming' | 'outgoing';
  category?: string;
  from?: string;
  to?: string;
  date?: string;
  description?: string;
  status?: 'draft' | 'sent' | 'received' | 'archived';
  file_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_name?: string;
}

export interface CorrespondenceCreateData {
  reference_number?: string;
  subject: string;
  type: 'incoming' | 'outgoing';
  category?: string;
  from?: string;
  to?: string;
  date?: string;
  description?: string;
  status?: 'draft' | 'sent' | 'received' | 'archived';
}

export const correspondenceApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Correspondence[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/correspondence`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Correspondence> => {
    const response = await apiClient.get(`/tenants/${tenantId}/correspondence/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: CorrespondenceCreateData): Promise<Correspondence> => {
    const response = await apiClient.post(`/tenants/${tenantId}/correspondence`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<CorrespondenceCreateData>): Promise<Correspondence> => {
    const response = await apiClient.put(`/tenants/${tenantId}/correspondence/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/correspondence/${id}`);
  },
};

