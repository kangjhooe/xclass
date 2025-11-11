import apiClient from './client';

export interface GradeWeight {
  id: number;
  instansiId: number;
  assignmentType: string;
  assignmentLabel: string;
  weightPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradeWeightCreateData {
  assignmentType: string;
  assignmentLabel: string;
  weightPercentage: number;
  isActive?: boolean;
}

export const gradeWeightApi = {
  getAll: async (tenantId: number): Promise<GradeWeight[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/grade-weights`);
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<GradeWeight> => {
    const response = await apiClient.get(`/tenants/${tenantId}/grade-weights/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: GradeWeightCreateData): Promise<GradeWeight> => {
    const response = await apiClient.post(`/tenants/${tenantId}/grade-weights`, data);
    return response.data;
  },

  toggleActive: async (tenantId: number, id: number): Promise<GradeWeight> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/grade-weights/${id}/toggle-active`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/grade-weights/${id}`);
  },
};

