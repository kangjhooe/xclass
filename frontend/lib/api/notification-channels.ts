import apiClient from './client';

export enum ChannelType {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum ChannelProvider {
  TWILIO = 'twilio',
  RAJA_SMS = 'raja_sms',
  ZENZIVA = 'zenziva',
  WHATSAPP_BUSINESS = 'whatsapp_business',
  WHATSAPP_CLOUD_API = 'whatsapp_cloud_api',
  FIREBASE = 'firebase',
  SMTP = 'smtp',
}

export interface NotificationChannel {
  id: number;
  instansiId: number;
  name: string;
  type: ChannelType;
  provider: ChannelProvider;
  config: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannelCreateData {
  name: string;
  type: ChannelType;
  provider: ChannelProvider;
  config: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: number;
  description?: string;
}

export interface NotificationLog {
  id: number;
  notificationId: number;
  instansiId: number;
  channelId?: number;
  type: string;
  status: string;
  recipient?: string;
  message?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
  providerMessageId?: string;
  cost?: number;
  provider?: string;
  createdAt: string;
}

export interface NotificationStatistics {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalCost: number;
}

export const notificationChannelsApi = {
  // Get all channels
  getAll: async (tenantId: number): Promise<{ data: NotificationChannel[] }> => {
    const response = await apiClient.get(`/notifications/channels`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  // Get channel by type
  getByType: async (tenantId: number, type: ChannelType): Promise<NotificationChannel | null> => {
    const response = await apiClient.get(`/notifications/channels/${type}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  // Create channel
  create: async (tenantId: number, data: NotificationChannelCreateData): Promise<{ data: NotificationChannel }> => {
    const response = await apiClient.post(
      `/notifications/channels`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  // Update channel
  update: async (
    tenantId: number,
    id: number,
    data: Partial<NotificationChannelCreateData>,
  ): Promise<{ data: NotificationChannel }> => {
    const response = await apiClient.put(
      `/notifications/channels/${id}`,
      data,
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  // Delete channel
  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/notifications/channels/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },

  // Deactivate channel
  deactivate: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.post(
      `/notifications/channels/${id}/deactivate`,
      {},
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
  },

  // Get logs
  getLogs: async (
    tenantId: number,
    filters?: {
      type?: string;
      status?: string;
      channelId?: number;
      startDate?: string;
      endDate?: string;
      limit?: number;
    },
  ): Promise<{ data: NotificationLog[] }> => {
    const response = await apiClient.get(`/notifications/channels/logs`, {
      params: filters,
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async (
    tenantId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: NotificationStatistics }> => {
    const response = await apiClient.get(`/notifications/channels/logs/statistics`, {
      params: { startDate, endDate },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  // Get logs by notification
  getLogsByNotification: async (notificationId: number): Promise<{ data: NotificationLog[] }> => {
    const response = await apiClient.get(`/notifications/channels/logs/${notificationId}`);
    return response.data;
  },
};

