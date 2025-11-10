import apiClient from './client';

export interface StudentGrade {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  subjectId: number;
  subject?: {
    id: number;
    name: string;
  };
  teacherId?: number;
  teacher?: {
    id: number;
    name: string;
  };
  score: number;
  assignmentType?: string; // 'quiz', 'assignment', 'midterm', 'final', etc.
  description?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentGradeCreateData {
  studentId: number;
  subjectId: number;
  teacherId?: number;
  score: number;
  assignmentType?: string;
  description?: string;
  date?: string;
}

export const gradesApi = {
  getAll: async (
    tenantId: number,
    params?: { studentId?: number; subjectId?: number }
  ): Promise<{ data: StudentGrade[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/grades`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<StudentGrade> => {
    const response = await apiClient.get(`/tenants/${tenantId}/grades/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: StudentGradeCreateData): Promise<StudentGrade> => {
    const response = await apiClient.post(`/tenants/${tenantId}/grades`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<StudentGradeCreateData>): Promise<StudentGrade> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/grades/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/grades/${id}`);
  },
};

