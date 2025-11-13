import apiClient from './client';

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicYearCreateData {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  description?: string;
}

export const academicYearsApi = {
  getAll: async (tenantId: number): Promise<{ data: AcademicYear[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/academic-years`);
    return response.data;
  },

  getActive: async (tenantId: number): Promise<AcademicYear | null> => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/academic-years/active`);
      return response.data ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getById: async (tenantId: number, id: number): Promise<AcademicYear> => {
    const response = await apiClient.get(`/tenants/${tenantId}/academic-years/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: AcademicYearCreateData): Promise<AcademicYear> => {
    const response = await apiClient.post(`/tenants/${tenantId}/academic-years`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<AcademicYearCreateData>): Promise<AcademicYear> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/academic-years/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/academic-years/${id}`);
  },
};

