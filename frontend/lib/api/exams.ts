import apiClient from './client';

export interface Exam {
  id: number;
  title: string;
  description?: string;
  subjectId?: number;
  subject?: {
    id: number;
    name: string;
  };
  classId?: number;
  classRoom?: {
    id: number;
    name: string;
  };
  startDate: string;
  endDate: string;
  duration?: number; // in minutes
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExamCreateData {
  title: string;
  description?: string;
  subjectId?: number;
  classId?: number;
  startDate: string;
  endDate: string;
  duration?: number;
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
}

export const examsApi = {
  getAll: async (
    tenantId: number,
    params?: { classId?: number; subjectId?: number }
  ): Promise<{ data: Exam[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/exams`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Exam> => {
    const response = await apiClient.get(`/tenants/${tenantId}/exams/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: ExamCreateData): Promise<Exam> => {
    const response = await apiClient.post(`/tenants/${tenantId}/exams`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<ExamCreateData>): Promise<Exam> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/exams/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/exams/${id}`);
  },
};

