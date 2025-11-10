import apiClient from './client';

export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  query?: string;
  fields?: string[];
  filters?: any;
  format?: 'pdf' | 'excel' | 'csv';
  created_at?: string;
}

export interface ReportTemplateCreateData {
  name: string;
  description?: string;
  query?: string;
  fields?: string[];
  filters?: any;
  format?: 'pdf' | 'excel' | 'csv';
}

export interface GeneratedReport {
  id: number;
  template_id: number;
  template_name?: string;
  data: any;
  file_url?: string;
  generated_at?: string;
}

export const reportGeneratorApi = {
  getAllTemplates: async (tenantId: number): Promise<{ data: ReportTemplate[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/report-generator/templates`);
    return response.data;
  },

  getTemplateById: async (tenantId: number, id: number): Promise<ReportTemplate> => {
    const response = await apiClient.get(`/tenants/${tenantId}/report-generator/templates/${id}`);
    return response.data;
  },

  createTemplate: async (tenantId: number, data: ReportTemplateCreateData): Promise<ReportTemplate> => {
    const response = await apiClient.post(`/tenants/${tenantId}/report-generator/templates`, data);
    return response.data;
  },

  updateTemplate: async (tenantId: number, id: number, data: Partial<ReportTemplateCreateData>): Promise<ReportTemplate> => {
    const response = await apiClient.put(`/tenants/${tenantId}/report-generator/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/report-generator/templates/${id}`);
  },

  generate: async (tenantId: number, templateId: number, filters?: any): Promise<GeneratedReport> => {
    const response = await apiClient.post(`/tenants/${tenantId}/report-generator/generate/${templateId}`, { filters });
    return response.data;
  },
};

