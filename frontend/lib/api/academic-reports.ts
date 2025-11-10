import apiClient from './client';

export interface AcademicReport {
  id: number;
  report_type: string;
  title: string;
  academic_year_id?: number;
  academic_year_name?: string;
  class_id?: number;
  class_name?: string;
  student_id?: number;
  student_name?: string;
  period?: string;
  file_url?: string;
  generated_at?: string;
  created_at?: string;
}

export interface AcademicReportGenerateData {
  report_type: string;
  title: string;
  academic_year_id?: number;
  class_id?: number;
  student_id?: number;
  period?: string;
}

export const academicReportsApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: AcademicReport[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/academic-reports`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<AcademicReport> => {
    const response = await apiClient.get(`/tenants/${tenantId}/academic-reports/${id}`);
    return response.data;
  },

  generate: async (tenantId: number, data: AcademicReportGenerateData): Promise<AcademicReport> => {
    const response = await apiClient.post(`/tenants/${tenantId}/academic-reports/generate`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/academic-reports/${id}`);
  },
};

