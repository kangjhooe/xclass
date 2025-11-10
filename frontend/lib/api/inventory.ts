import apiClient from './client';

export interface Inventory {
  id: number;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  quantity: number;
  unit?: string;
  min_stock?: number;
  max_stock?: number;
  price?: number;
  location?: string;
  status?: 'available' | 'low_stock' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}

export interface InventoryCreateData {
  name: string;
  code?: string;
  category?: string;
  description?: string;
  quantity: number;
  unit?: string;
  min_stock?: number;
  max_stock?: number;
  price?: number;
  location?: string;
}

export const inventoryApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Inventory[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/inventory`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Inventory> => {
    const response = await apiClient.get(`/tenants/${tenantId}/inventory/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: InventoryCreateData): Promise<Inventory> => {
    const response = await apiClient.post(`/tenants/${tenantId}/inventory`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<InventoryCreateData>): Promise<Inventory> => {
    const response = await apiClient.put(`/tenants/${tenantId}/inventory/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/inventory/${id}`);
  },
};

