import apiClient from './client';

export interface ClassRoom {
  id: number;
  name: string;
  level?: string;
  roomNumber?: string;
  roomId?: number;
  room?: {
    id: number;
    name: string;
    building?: {
      id: number;
      name: string;
    };
  };
  capacity?: number;
  homeroomTeacherId?: number;
  homeroomTeacher?: {
    id: number;
    name: string;
  };
  academicYear?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassRoomCreateData {
  name: string;
  level?: string;
  roomNumber?: string;
  roomId?: number;
  capacity?: number;
  homeroomTeacherId?: number;
  academicYear?: string;
  isActive?: boolean;
}

export const classesApi = {
  getAll: async (
    tenantId: number,
    params?: { search?: string; academicYear?: string },
  ): Promise<{ data: ClassRoom[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/classes`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<ClassRoom> => {
    const response = await apiClient.get(`/tenants/${tenantId}/classes/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: ClassRoomCreateData): Promise<ClassRoom> => {
    const response = await apiClient.post(`/tenants/${tenantId}/classes`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<ClassRoomCreateData>): Promise<ClassRoom> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/classes/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/classes/${id}`);
  },
};
