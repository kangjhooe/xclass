import apiClient from './client';

export type TenantAccessStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired' | 'cancelled';

export interface TenantSummary {
  id: number;
  npsn?: string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserSummary {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface TenantAccessRecord {
  id: number;
  tenantId: number;
  superAdminId: number;
  status: TenantAccessStatus;
  requestedAt: string;
  approvedAt?: string | null;
  approvedBy?: number | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revokedBy?: number | null;
  reason?: string | null;
  responseNote?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: TenantSummary | null;
  superAdmin?: UserSummary | null;
  approvedByUser?: UserSummary | null;
}

export interface CreateAccessRequestPayload {
  tenantId: number;
  reason?: string;
  expiresAt?: string;
}

export interface ApproveAccessRequestPayload {
  expiresAt?: string;
  note?: string;
}

export interface RejectAccessRequestPayload {
  reason: string;
}

export interface RevokeAccessPayload {
  reason?: string;
}

export const tenantAccessApi = {
  getSuperAdminRequests: async (): Promise<TenantAccessRecord[]> => {
    const response = await apiClient.get('/admin/tenant-access/requests');
    return response.data;
  },
  getSuperAdminGrants: async (): Promise<TenantAccessRecord[]> => {
    const response = await apiClient.get('/admin/tenant-access/grants');
    return response.data;
  },
  createAccessRequest: async (payload: CreateAccessRequestPayload): Promise<TenantAccessRecord> => {
    const response = await apiClient.post('/admin/tenant-access/requests', payload);
    return response.data;
  },
  cancelAccessRequest: async (requestId: number): Promise<TenantAccessRecord> => {
    const response = await apiClient.post(`/admin/tenant-access/requests/${requestId}/cancel`);
    return response.data;
  },
  getTenantRequests: async (): Promise<TenantAccessRecord[]> => {
    const response = await apiClient.get('/tenants/access-requests');
    return response.data;
  },
  approveAccessRequest: async (requestId: number, payload: ApproveAccessRequestPayload): Promise<TenantAccessRecord> => {
    const response = await apiClient.post(`/tenants/access-requests/${requestId}/approve`, payload);
    return response.data;
  },
  rejectAccessRequest: async (requestId: number, payload: RejectAccessRequestPayload): Promise<TenantAccessRecord> => {
    const response = await apiClient.post(`/tenants/access-requests/${requestId}/reject`, payload);
    return response.data;
  },
  revokeAccessGrant: async (requestId: number, payload: RevokeAccessPayload): Promise<TenantAccessRecord> => {
    const response = await apiClient.post(`/tenants/access-grants/${requestId}/revoke`, payload);
    return response.data;
  },
};

