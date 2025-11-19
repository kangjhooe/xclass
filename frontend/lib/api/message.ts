import apiClient from './client';

export interface MessageAttachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

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
  attachments?: MessageAttachment[];
  created_at?: string;
  read_at?: string;
}

export interface MessageCreateData {
  subject: string;
  content: string;
  recipient_id?: number;
  recipient_type?: 'user' | 'class' | 'all';
  priority?: 'low' | 'medium' | 'high';
  attachments?: File[];
  conversationId?: number;
}

export const messageApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages`, { params });
    return response.data;
  },

  getByConversation: async (tenantId: number, conversationId: number): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages`, { 
      params: { conversationId } 
    });
    return response.data;
  },

  getInbox: async (tenantId: number, params?: any): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/inbox`, { params });
    return response.data;
  },

  getSent: async (tenantId: number, params?: any): Promise<{ data: Message[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/sent`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Message> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: MessageCreateData): Promise<Message> => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('subject', data.subject);
    formData.append('content', data.content);
    if (data.recipient_id) formData.append('recipient_id', data.recipient_id.toString());
    if (data.recipient_type) formData.append('recipient_type', data.recipient_type);
    if (data.priority) formData.append('priority', data.priority);
    if (data.conversationId) formData.append('conversationId', data.conversationId.toString());
    
    // Append files
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiClient.post(`/tenants/${tenantId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAttachmentUrl: (tenantId: number, filename: string): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${apiUrl}/tenants/${tenantId}/messages/attachments/${filename}`;
  },

  markAsRead: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.put(`/tenants/${tenantId}/messages/${id}/read`);
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/messages/${id}`);
  },

  getUnreadCount: async (tenantId: number): Promise<number> => {
    const response = await apiClient.get(`/tenants/${tenantId}/messages/unread/count`);
    return response.data;
  },
};

