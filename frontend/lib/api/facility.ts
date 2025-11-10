import apiClient from './client';

export interface Facility {
  id: number;
  instansiId: number;
  name: string;
  type: 'building' | 'room' | 'land' | 'equipment';
  description?: string;
  location?: string;
  capacity?: number;
  metadata?: any; // Data spesifik berdasarkan tipe
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityCreateData {
  name: string;
  type: 'building' | 'room' | 'land' | 'equipment';
  description?: string;
  location?: string;
  capacity?: number;
  metadata?: any; // Data spesifik berdasarkan tipe
  isActive?: boolean;
}

export const facilityApi = {
  getAll: async (tenantId: number, params?: { type?: string }): Promise<Facility[]> => {
    const response = await apiClient.get(`/facilities`, { 
      params,
      headers: { 'x-tenant-id': tenantId.toString() }
    });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Facility> => {
    const response = await apiClient.get(`/facilities/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() }
    });
    return response.data;
  },

  create: async (tenantId: number, data: FacilityCreateData): Promise<Facility> => {
    const response = await apiClient.post(`/facilities`, data, {
      headers: { 'x-tenant-id': tenantId.toString() }
    });
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<FacilityCreateData>): Promise<Facility> => {
    const response = await apiClient.patch(`/facilities/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() }
    });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/facilities/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() }
    });
  },
};

