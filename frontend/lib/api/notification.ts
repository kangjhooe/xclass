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

export interface NotificationTemplate {
  id: number;
  instansiId: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateCreateData {
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  subject: string;
  content: string;
  variables: string[];
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

  // Templates
  getTemplates: async (tenantId: number, isActive?: boolean): Promise<{ data: NotificationTemplate[] }> => {
    const response = await apiClient.get(`/notifications/templates`, {
      params: { isActive },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  createTemplate: async (
    tenantId: number,
    data: NotificationTemplateCreateData,
  ): Promise<{ data: NotificationTemplate }> => {
    const response = await apiClient.post(
      `/notifications/templates`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  // Send notifications
  sendEmail: async (
    tenantId: number,
    data: { recipient: string; subject: string; content: string; templateId?: number },
  ) => {
    const response = await apiClient.post(
      `/notifications/send-email`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  sendSMS: async (
    tenantId: number,
    data: { recipient: string; content: string; templateId?: number; channelId?: number },
  ) => {
    const response = await apiClient.post(
      `/notifications/send-sms`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  sendWhatsApp: async (
    tenantId: number,
    data: {
      recipient: string;
      message: string;
      templateId?: number;
      channelId?: number;
      templateName?: string;
      templateParams?: Record<string, string>;
    },
  ) => {
    const response = await apiClient.post(
      `/notifications/send-whatsapp`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },
};

