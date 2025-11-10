import apiClient from './client';

export interface GuestBook {
  id: number;
  name: string;
  identity_number?: string;
  phone?: string;
  email?: string;
  institution?: string;
  purpose: string;
  notes?: string;
  check_in?: string;
  check_out?: string;
  status?: 'checked_in' | 'checked_out';
  created_at?: string;
  created_by?: number;
  created_by_name?: string;
}

export interface GuestBookCreateData {
  name: string;
  identity_number?: string;
  phone?: string;
  email?: string;
  institution?: string;
  purpose: string;
  notes?: string;
  check_in?: string;
}

export const guestBookApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: GuestBook[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/guest-books`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<GuestBook> => {
    const response = await apiClient.get(`/tenants/${tenantId}/guest-books/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: GuestBookCreateData): Promise<GuestBook> => {
    const response = await apiClient.post(`/tenants/${tenantId}/guest-books`, data);
    return response.data;
  },

  checkOut: async (tenantId: number, id: number): Promise<GuestBook> => {
    const response = await apiClient.put(`/tenants/${tenantId}/guest-books/${id}/checkout`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/guest-books/${id}`);
  },
};

