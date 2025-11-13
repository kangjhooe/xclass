import apiClient from './client';

export interface Competency {
  id: number;
  description: string;
  type: string;
  syllabusId: number;
}

export const competenciesApi = {
  getAll: async (
    tenantId: number,
    params?: { syllabusId?: number; type?: string }
  ): Promise<{ data: Competency[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/curriculum/competencies`, { params });
    const payload = response.data;
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return payload;
  },
};


