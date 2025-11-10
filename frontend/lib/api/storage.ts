import apiClient from './client';

export interface StorageFile {
  id: number;
  filename: string;
  original_name: string;
  path: string;
  url: string;
  size: number;
  mime_type: string;
  category?: string;
  folder?: string;
  description?: string;
  created_at?: string;
  created_by?: number;
  created_by_name?: string;
}

export interface StorageFileCreateData {
  category?: string;
  folder?: string;
  description?: string;
}

export interface UploadResponse {
  success: boolean;
  data: StorageFile;
}

export const storageApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: StorageFile[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/storage`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<StorageFile> => {
    const response = await apiClient.get(`/tenants/${tenantId}/storage/${id}`);
    return response.data;
  },

  upload: async (
    tenantId: number,
    file: File,
    data?: StorageFileCreateData
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.category) formData.append('category', data.category);
    if (data?.folder) formData.append('folder', data.folder);
    if (data?.description) formData.append('description', data.description);

    const response = await apiClient.post<UploadResponse>(
      `/tenants/${tenantId}/storage/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<StorageFileCreateData>): Promise<StorageFile> => {
    const response = await apiClient.put(`/tenants/${tenantId}/storage/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/storage/${id}`);
  },

  getFileUrl: (path: string): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${apiUrl}/storage/${path}`;
  },
};
