import apiClient from './client';

export interface Attachment {
  filename: string;
  originalName: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface SuperAdminAnnouncement {
  id: number;
  authorId: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  targetTenantIds?: number[];
  targetJenjang?: string[];
  targetJenis?: string[];
  attachments?: Attachment[];
  publishAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuperAdminAnnouncementData {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  targetTenantIds?: number[];
  targetJenjang?: string[];
  targetJenis?: string[];
  attachments?: Attachment[];
  publishAt?: string;
  expiresAt?: string;
}

export interface SuperAdminAnnouncementListResponse {
  data: SuperAdminAnnouncement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const superAdminAnnouncementApi = {
  getAll: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SuperAdminAnnouncementListResponse> => {
    const response = await apiClient.get('/admin/announcements', { params });
    return response.data;
  },

  getById: async (id: number): Promise<SuperAdminAnnouncement> => {
    const response = await apiClient.get(`/admin/announcements/${id}`);
    return response.data;
  },

  create: async (
    data: CreateSuperAdminAnnouncementData,
    attachments?: File[],
  ): Promise<SuperAdminAnnouncement> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof CreateSuperAdminAnnouncementData];
      if (value !== undefined && key !== 'attachments') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add attachments
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await apiClient.post('/admin/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateSuperAdminAnnouncementData>,
    attachments?: File[],
  ): Promise<SuperAdminAnnouncement> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof CreateSuperAdminAnnouncementData];
      if (value !== undefined && key !== 'attachments') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add attachments
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await apiClient.patch(
      `/admin/announcements/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/announcements/${id}`);
  },
};

