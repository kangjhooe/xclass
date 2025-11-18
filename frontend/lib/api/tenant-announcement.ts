import apiClient from './client';
import { SuperAdminAnnouncement, Attachment } from './super-admin-announcement';

export interface TenantAnnouncement extends SuperAdminAnnouncement {
  isRead: boolean;
  isArchived: boolean;
  readAt?: string | null;
  archivedAt?: string | null;
}

export interface TenantAnnouncementListResponse {
  data: TenantAnnouncement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const tenantAnnouncementApi = {
  getAll: async (params?: {
    status?: string;
    priority?: string;
    includeArchived?: boolean;
    page?: number;
    limit?: number;
  }): Promise<TenantAnnouncementListResponse> => {
    const response = await apiClient.get('/announcements', { params });
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/announcements/${id}/read`);
  },

  markAsArchived: async (id: number): Promise<void> => {
    await apiClient.post(`/announcements/${id}/archive`);
  },

  unarchive: async (id: number): Promise<void> => {
    await apiClient.post(`/announcements/${id}/unarchive`);
  },
};

