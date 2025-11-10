import { apiClient } from './client';

export interface TenantFeature {
  id: number;
  tenantId: number;
  featureKey: string;
  featureName: string;
  isEnabled: boolean;
  settings?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantModule {
  id: number;
  tenantId: number;
  moduleKey: string;
  moduleName: string;
  isEnabled: boolean;
  permissions?: string[];
  settings?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const tenantFeaturesApi = {
  // Features
  getTenantFeatures: (tenantId: number) => {
    return apiClient.get<TenantFeature[]>(
      `/admin/tenant-features/tenants/${tenantId}/features`,
    );
  },

  getTenantFeature: (tenantId: number, featureKey: string) => {
    return apiClient.get<TenantFeature>(
      `/admin/tenant-features/tenants/${tenantId}/features/${featureKey}`,
    );
  },

  createTenantFeature: (tenantId: number, data: Partial<TenantFeature>) => {
    return apiClient.post<TenantFeature>(
      `/admin/tenant-features/tenants/${tenantId}/features`,
      data,
    );
  },

  updateTenantFeature: (
    tenantId: number,
    featureKey: string,
    data: Partial<TenantFeature>,
  ) => {
    return apiClient.put<TenantFeature>(
      `/admin/tenant-features/tenants/${tenantId}/features/${featureKey}`,
      data,
    );
  },

  toggleTenantFeature: (tenantId: number, featureKey: string) => {
    return apiClient.post(
      `/admin/tenant-features/tenants/${tenantId}/features/${featureKey}/toggle`,
    );
  },

  enableFeaturesForTenant: (tenantId: number, featureKeys: string[]) => {
    return apiClient.post(
      `/admin/tenant-features/tenants/${tenantId}/features/bulk-enable`,
      { featureKeys },
    );
  },

  deleteTenantFeature: (tenantId: number, featureKey: string) => {
    return apiClient.delete(
      `/admin/tenant-features/tenants/${tenantId}/features/${featureKey}`,
    );
  },

  // Modules
  getTenantModules: (tenantId: number) => {
    return apiClient.get<TenantModule[]>(
      `/admin/tenant-features/tenants/${tenantId}/modules`,
    );
  },

  getTenantModule: (tenantId: number, moduleKey: string) => {
    return apiClient.get<TenantModule>(
      `/admin/tenant-features/tenants/${tenantId}/modules/${moduleKey}`,
    );
  },

  createTenantModule: (tenantId: number, data: Partial<TenantModule>) => {
    return apiClient.post<TenantModule>(
      `/admin/tenant-features/tenants/${tenantId}/modules`,
      data,
    );
  },

  updateTenantModule: (
    tenantId: number,
    moduleKey: string,
    data: Partial<TenantModule>,
  ) => {
    return apiClient.put<TenantModule>(
      `/admin/tenant-features/tenants/${tenantId}/modules/${moduleKey}`,
      data,
    );
  },

  toggleTenantModule: (tenantId: number, moduleKey: string) => {
    return apiClient.post(
      `/admin/tenant-features/tenants/${tenantId}/modules/${moduleKey}/toggle`,
    );
  },

  enableModulesForTenant: (tenantId: number, moduleKeys: string[]) => {
    return apiClient.post(
      `/admin/tenant-features/tenants/${tenantId}/modules/bulk-enable`,
      { moduleKeys },
    );
  },

  deleteTenantModule: (tenantId: number, moduleKey: string) => {
    return apiClient.delete(
      `/admin/tenant-features/tenants/${tenantId}/modules/${moduleKey}`,
    );
  },
};

