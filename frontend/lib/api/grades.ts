import apiClient from './client';

export type AssessmentType = 'NH' | 'PTS' | 'PAS' | 'PROJECT' | 'OTHER';

export interface StudentGrade {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
    classId?: number;
    classRoom?: {
      id: number;
      name: string;
    };
  };
  subjectId: number;
  subject?: {
    id: number;
    name: string;
  };
  teacherId?: number | null;
  teacher?: {
    id: number;
    name: string;
  } | null;
  assessmentType: AssessmentType;
  customAssessmentLabel?: string | null;
  score: number;
  weight?: number | null;
  description?: string | null;
  date?: string | null;
  competencyId?: number | null;
  competency?: {
    id: number;
    description: string;
  } | null;
  learningOutcome?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentGradeCreateData {
  studentId: number;
  subjectId: number;
  teacherId?: number;
  score: number;
  assessmentType?: AssessmentType;
  customAssessmentLabel?: string;
  weight?: number | null;
  description?: string;
  date?: string;
  competencyId?: number | null;
  learningOutcome?: string;
}

export interface StudentGradeFilters {
  studentId?: number;
  subjectId?: number;
  classId?: number;
  assessmentType?: AssessmentType;
  competencyId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  updatedSince?: string;
  teacherId?: number;
}

export const gradesApi = {
  getAll: async (
    tenantId: number,
    params?: StudentGradeFilters
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

  update: async (
    tenantId: number,
    id: number,
    data: Partial<StudentGradeCreateData>
  ): Promise<StudentGrade> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/grades/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/grades/${id}`);
  },

  export: async (
    tenantId: number,
    format: 'excel' | 'pdf' | 'csv',
    params?: StudentGradeFilters
  ): Promise<Blob> => {
    const response = await apiClient.get(`/tenants/${tenantId}/grades/export`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },
};

