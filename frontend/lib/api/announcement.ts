import apiClient from './client';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  published_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  author_name?: string;
}

export interface AnnouncementCreateData {
  title: string;
  content: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  published_at?: string;
  expires_at?: string;
}

export const announcementApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: Announcement[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/announcements`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Announcement> => {
    const response = await apiClient.get(`/tenants/${tenantId}/announcements/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: AnnouncementCreateData): Promise<Announcement> => {
    const response = await apiClient.post(`/tenants/${tenantId}/announcements`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<AnnouncementCreateData>): Promise<Announcement> => {
    const response = await apiClient.put(`/tenants/${tenantId}/announcements/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/announcements/${id}`);
  },
};

