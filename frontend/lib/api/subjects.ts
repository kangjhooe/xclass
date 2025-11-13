import apiClient from './client';

export type CurriculumType = 'K13' | 'Merdeka' | 'Mandiri' | 'Kurikulum 2013';

export interface SubjectTeacher {
  id: number;
  name: string;
  nip?: string;
}

export interface SubjectSyllabusSummary {
  id: number;
  title: string;
  totalMeetings?: number;
  totalHours?: number;
}

export interface SubjectScheduleSummary {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  className?: string;
  teacherName?: string;
  isActive: boolean;
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  level?: string;
  grade?: string;
  semester?: number;
  department?: string;
  category?: string;
  learningFocus?: string;
  curriculumType?: CurriculumType;
  hoursPerWeek?: number;
  order?: number;
  minimumPassingScore?: number;
  isMandatory?: boolean;
  isElective?: boolean;
  isActive?: boolean;
  color?: string;
  teachers?: SubjectTeacher[];
  syllabi?: SubjectSyllabusSummary[];
  schedules?: SubjectScheduleSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectCreateData {
  name: string;
  code?: string;
  description?: string;
  level?: string;
  grade?: string;
  semester?: number;
  department?: string;
  category?: string;
  learningFocus?: string;
  curriculumType?: CurriculumType;
  hoursPerWeek?: number;
  order?: number;
  minimumPassingScore?: number;
  isMandatory?: boolean;
  isElective?: boolean;
  isActive?: boolean;
  color?: string;
}

export interface SubjectFilterParams {
  search?: string;
  level?: string;
  grade?: string;
  curriculumType?: CurriculumType;
  isActive?: boolean;
  isMandatory?: boolean;
  isElective?: boolean;
  teacherId?: number;
}

export interface SubjectOverview {
  totalSubjects: number;
  activeSubjects: number;
  inactiveSubjects: number;
  mandatorySubjects: number;
  electiveSubjects: number;
  distribution: {
    byLevel: Array<{ level: string | null; total: number }>;
    byCurriculum: Array<{ curriculumType: CurriculumType; total: number }>;
  };
  highlights: {
    topSubjectsBySyllabi: Array<{ id: number; name: string; syllabusCount: number }>;
  };
}

export interface SubjectDashboard {
  subject: Subject;
  metrics: {
    totalSyllabi: number;
    totalTeachers: number;
    totalSchedules: number;
    activeSchedules: number;
    teachingDays: number[];
    classes: string[];
  };
}

export const subjectsApi = {
  getAll: async (
    tenantId: number,
    params?: SubjectFilterParams,
  ): Promise<{ data: Subject[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects`, {
      params,
    });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Subject> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: SubjectCreateData): Promise<Subject> => {
    const response = await apiClient.post(`/tenants/${tenantId}/subjects`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<SubjectCreateData>): Promise<Subject> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/subjects/${id}`, data);
    return response.data;
  },

  updateStatus: async (tenantId: number, id: number, data: { isActive?: boolean; isMandatory?: boolean; isElective?: boolean }) => {
    const response = await apiClient.patch(`/tenants/${tenantId}/subjects/${id}/status`, data);
    return response.data;
  },

  getOverview: async (tenantId: number): Promise<SubjectOverview> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects/overview`);
    return response.data;
  },

  getDashboard: async (tenantId: number, id: number): Promise<SubjectDashboard> => {
    const response = await apiClient.get(`/tenants/${tenantId}/subjects/${id}/dashboard`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/subjects/${id}`);
  },
};
