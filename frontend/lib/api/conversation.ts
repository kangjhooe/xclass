import apiClient from './client';

export interface ConversationMember {
  id: number;
  userId: number;
  userName: string;
  role: 'admin' | 'member';
  isMuted: boolean;
  lastReadAt?: string;
}

export interface Conversation {
  id: number;
  name: string;
  description?: string;
  type: 'direct' | 'group';
  createdBy: number;
  members: ConversationMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationCreateData {
  name: string;
  memberIds: number[];
  description?: string;
}

export const conversationApi = {
  getAll: async (tenantId: number): Promise<Conversation[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/conversations`);
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Conversation> => {
    const response = await apiClient.get(`/tenants/${tenantId}/conversations/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: ConversationCreateData): Promise<Conversation> => {
    const response = await apiClient.post(`/tenants/${tenantId}/conversations`, data);
    return response.data;
  },

  update: async (
    tenantId: number,
    id: number,
    data: { name?: string; description?: string },
  ): Promise<Conversation> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/conversations/${id}`, data);
    return response.data;
  },

  addMembers: async (
    tenantId: number,
    id: number,
    memberIds: number[],
  ): Promise<Conversation> => {
    const response = await apiClient.post(`/tenants/${tenantId}/conversations/${id}/members`, {
      memberIds,
    });
    return response.data;
  },

  removeMember: async (
    tenantId: number,
    id: number,
    memberUserId: number,
  ): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/conversations/${id}/members/${memberUserId}`);
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/conversations/${id}`);
  },
};

