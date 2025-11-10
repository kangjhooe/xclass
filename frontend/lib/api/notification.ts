import apiClient from './client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  status?: 'unread' | 'read';
  link?: string;
  created_at?: string;
  read_at?: string;
}

export const notificationApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Notification[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/notifications`, { params });
    return response.data;
  },

  getUnread: async (tenantId: number): Promise<{ data: Notification[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/notifications/unread`);
    return response.data;
  },

  markAsRead: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.put(`/tenants/${tenantId}/notifications/${id}/read`);
  },

  markAllAsRead: async (tenantId: number): Promise<void> => {
    await apiClient.put(`/tenants/${tenantId}/notifications/read-all`);
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/notifications/${id}`);
  },
};

