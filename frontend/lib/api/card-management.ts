import apiClient from './client';

export interface Card {
  id: number;
  card_number: string;
  card_type?: 'student' | 'teacher' | 'staff';
  student_id?: number;
  student_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  qr_code?: string;
  nfc_id?: string;
  status?: 'active' | 'inactive' | 'lost' | 'blocked';
  issued_date?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardCreateData {
  card_number: string;
  card_type?: 'student' | 'teacher' | 'staff';
  student_id?: number;
  teacher_id?: number;
  qr_code?: string;
  nfc_id?: string;
  status?: 'active' | 'inactive' | 'lost' | 'blocked';
  issued_date?: string;
  expiry_date?: string;
}

export const cardManagementApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Card[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cards`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Card> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cards/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: CardCreateData): Promise<Card> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cards`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<CardCreateData>): Promise<Card> => {
    const response = await apiClient.put(`/tenants/${tenantId}/cards/${id}`, data);
    return response.data;
  },

  block: async (tenantId: number, id: number): Promise<Card> => {
    const response = await apiClient.put(`/tenants/${tenantId}/cards/${id}/block`);
    return response.data;
  },

  unblock: async (tenantId: number, id: number): Promise<Card> => {
    const response = await apiClient.put(`/tenants/${tenantId}/cards/${id}/unblock`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cards/${id}`);
  },
};

