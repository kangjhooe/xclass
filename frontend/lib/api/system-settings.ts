import apiClient from './client';

export interface SystemSetting {
  id?: number;
  key: string;
  value: string;
  type?: string;
  description?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const systemSettingsApi = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await apiClient.get<SystemSetting[]>('/admin/system-settings', { params });
    return { data: response.data };
  },

  getCategories: async () => {
    const response = await apiClient.get<string[]>('/admin/system-settings/categories');
    return { data: response.data };
  },

  getByCategory: async (category: string) => {
    const response = await apiClient.get<SystemSetting[]>(
      `/admin/system-settings/category/${category}`,
    );
    return { data: response.data };
  },

  getOne: (key: string) => {
    return apiClient.get<SystemSetting>(`/admin/system-settings/${key}`);
  },

  getValue: (key: string, defaultValue?: string) => {
    const params = defaultValue ? { default: defaultValue } : {};
    return apiClient.get(`/admin/system-settings/${key}/value`, { params });
  },

  create: (data: Partial<SystemSetting>) => {
    return apiClient.post<SystemSetting>('/admin/system-settings', data);
  },

  update: (key: string, data: Partial<SystemSetting>) => {
    return apiClient.put<SystemSetting>(`/admin/system-settings/${key}`, data);
  },

  setValue: (key: string, value: any, type?: string) => {
    return apiClient.post(`/admin/system-settings/${key}/set`, { value, type });
  },

  delete: (key: string) => {
    return apiClient.delete(`/admin/system-settings/${key}`);
  },
};

