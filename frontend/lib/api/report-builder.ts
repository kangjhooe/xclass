import { apiClient } from './client';
import { ReportBuilderConfig } from '@/components/report-builder/types';

export interface ReportBuilderTemplate {
  id: number;
  instansiId: number;
  name: string;
  description?: string;
  category: string;
  config: ReportBuilderConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportBuilderTemplateCreateData {
  name: string;
  description?: string;
  category: string;
  config: ReportBuilderConfig;
}

export const reportBuilderApi = {
  getAllTemplates: async (tenantId?: number): Promise<ReportBuilderTemplate[]> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/templates` : '/report-builder/templates';
    const response = await apiClient.get(url);
    return response.data;
  },

  getTemplateById: async (id: number, tenantId?: number): Promise<ReportBuilderTemplate> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/templates/${id}` : `/report-builder/templates/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  createTemplate: async (data: ReportBuilderTemplateCreateData, tenantId?: number): Promise<ReportBuilderTemplate> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/templates` : '/report-builder/templates';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  updateTemplate: async (
    id: number,
    data: Partial<ReportBuilderTemplateCreateData>,
    tenantId?: number
  ): Promise<ReportBuilderTemplate> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/templates/${id}` : `/report-builder/templates/${id}`;
    const response = await apiClient.put(url, data);
    return response.data;
  },

  deleteTemplate: async (id: number, tenantId?: number): Promise<void> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/templates/${id}` : `/report-builder/templates/${id}`;
    await apiClient.delete(url);
  },

  generateReport: async (
    templateId: number,
    parameters?: Record<string, any>,
    tenantId?: number
  ): Promise<any> => {
    const url = tenantId
      ? `/tenants/${tenantId}/report-builder/generate/${templateId}`
      : `/report-builder/generate/${templateId}`;
    const response = await apiClient.post(url, { parameters });
    return response.data;
  },

  previewReport: async (
    config: ReportBuilderConfig,
    parameters?: Record<string, any>,
    tenantId?: number
  ): Promise<any> => {
    const url = tenantId ? `/tenants/${tenantId}/report-builder/preview` : '/report-builder/preview';
    const response = await apiClient.post(url, { config, parameters });
    return response.data;
  },
};

