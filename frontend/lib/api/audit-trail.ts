import { apiClient } from './client';
import { AuditTrailEntry } from '@/components/audit-trail/AuditTrailViewer';

export interface AuditTrailFilters {
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditTrailResponse {
  data: AuditTrailEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditTrailApi = {
  getAll: async (filters: AuditTrailFilters, tenantId?: number): Promise<AuditTrailResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail?${params.toString()}`
      : `/audit-trail?${params.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: number, tenantId?: number): Promise<AuditTrailEntry> => {
    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail/${id}`
      : `/audit-trail/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getStatistics: async (tenantId?: number, startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail/statistics?${params.toString()}`
      : `/audit-trail/statistics?${params.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getEntityHistory: async (
    entityType: string,
    entityId: number,
    tenantId?: number,
    limit?: number
  ): Promise<AuditTrailEntry[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail/entity/${entityType}/${entityId}?${params.toString()}`
      : `/audit-trail/entity/${entityType}/${entityId}?${params.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getRestoreData: async (
    entityType: string,
    entityId: number,
    tenantId?: number
  ): Promise<{ data: Record<string, any> | null }> => {
    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail/restore/${entityType}/${entityId}`
      : `/audit-trail/restore/${entityType}/${entityId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  export: async (filters: AuditTrailFilters, tenantId?: number): Promise<AuditTrailEntry[]> => {
    const url = tenantId
      ? `/tenants/${tenantId}/audit-trail/export`
      : '/audit-trail/export';
    const response = await apiClient.post(url, filters);
    return response.data;
  },
};

