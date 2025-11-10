import { apiClient } from './client';

export interface Tenant {
  id: number;
  npsn: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  settings?: Record<string, any> | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  instansiId?: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tenant?: Tenant;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalAdminTenants: number;
  activeAdminTenants: number;
  totalGlobalUsers: number;
  activeGlobalUsers: number;
}

export const adminApi = {
  getDashboard: () => {
    return apiClient.get<DashboardStats>('/admin/dashboard');
  },

  getRecentTenants: (limit?: number) => {
    return apiClient.get<Tenant[]>('/admin/dashboard/recent-tenants', {
      params: limit ? { limit } : {},
    });
  },

  getRecentAdminUsers: (limit?: number) => {
    return apiClient.get<User[]>('/admin/dashboard/recent-admin-users', {
      params: limit ? { limit } : {},
    });
  },

  getAllTenants: (params?: { page?: number; limit?: number }) => {
    return apiClient.get<TenantListResponse>('/admin/tenants', { params });
  },

  getTenantById: (id: number) => {
    return apiClient.get<Tenant>(`/admin/tenants/${id}`);
  },

  createTenant: (data: Partial<Tenant>) => {
    return apiClient.post<Tenant>('/admin/tenants', data);
  },

  updateTenant: (id: number, data: Partial<Tenant>) => {
    return apiClient.put<Tenant>(`/admin/tenants/${id}`, data);
  },

  activateTenant: (id: number) => {
    return apiClient.post(`/admin/tenants/${id}/activate`);
  },

  deactivateTenant: (id: number) => {
    return apiClient.post(`/admin/tenants/${id}/deactivate`);
  },

  deleteTenant: (id: number) => {
    return apiClient.delete(`/admin/tenants/${id}`);
  },

  getAllUsers: (params?: { page?: number; limit?: number; role?: string }) => {
    return apiClient.get<UserListResponse>('/admin/users', { params });
  },

  getUserById: (id: number) => {
    return apiClient.get<User>(`/admin/users/${id}`);
  },

  activateUser: (id: number) => {
    return apiClient.post(`/admin/users/${id}/activate`);
  },

  deactivateUser: (id: number) => {
    return apiClient.post(`/admin/users/${id}/deactivate`);
  },
};

