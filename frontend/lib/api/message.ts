import apiClient from './client';

export interface Message {
  id: number;
  subject: string;
  content: string;
  sender_id: number;
  sender_name?: string;
  recipient_id?: number;
  recipient_name?: string;
  recipient_type?: 'user' | 'class' | 'all';
  status?: 'unread' | 'read' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
  read_at?: string;
}

export interface MessageCreateData {
  subject: string;
  content: string;
  recipient_id?: number;
  recipient_type?: 'user' | 'class' | 'all';
  priority?: 'low' | 'medium' | 'high';
}

export const messageApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages`, { params });
    return response.data;
  },

  getInbox: async (tenantId: number): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/inbox`);
    return response.data;
  },

  getSent: async (tenantId: number): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/sent`);
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Message> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: MessageCreateData): Promise<Message> => {
    const response = await apiClient.post(`/tenants/${tenantId}/messages`, data);
    return response.data;
  },

  markAsRead: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.put(`/tenants/${tenantId}/messages/${id}/read`);
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/messages/${id}`);
  },
};

