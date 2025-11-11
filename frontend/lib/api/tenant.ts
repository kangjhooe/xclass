import apiClient from './client';

export interface Tenant {
  id: number;
  npsn: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  settings?: Record<string, any> | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TenantProfile {
  id: number;
  instansiId: number;
  description?: string;
  vision?: string;
  mission?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TenantUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  settings?: Record<string, any>;
}

export const tenantApi = {
  getById: async (id: number): Promise<Tenant> => {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },

  getByNpsn: async (npsn: string): Promise<Tenant> => {
    const response = await apiClient.get(`/tenants/npsn/${npsn}`);
    return response.data;
  },

  getByIdentifier: async (identifier: string): Promise<Tenant> => {
    const response = await apiClient.get(`/tenants/resolve/${identifier}`);
    return response.data;
  },

  update: async (id: number, data: TenantUpdateData): Promise<Tenant> => {
    const response = await apiClient.put(`/tenants/${id}`, data, {
      headers: {
        'x-tenant-id': id.toString(),
      },
    });
    return response.data;
  },

  getProfile: async (tenantId: number): Promise<TenantProfile> => {
    const response = await apiClient.get(`/public/profile`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },
};

