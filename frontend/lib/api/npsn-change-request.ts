import { apiClient } from './client';

export enum NpsnChangeRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface NpsnChangeRequest {
  id: number;
  tenantId: number;
  currentNpsn: string;
  requestedNpsn: string;
  reason: string;
  status: NpsnChangeRequestStatus;
  requestedById?: number;
  reviewedById?: number;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: number;
    npsn: string;
    name: string;
  };
  requestedBy?: {
    id: number;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateNpsnChangeRequestDto {
  requestedNpsn: string;
  reason: string;
}

export interface UpdateNpsnChangeRequestDto {
  status: NpsnChangeRequestStatus;
  reviewNote?: string;
}

export const npsnChangeRequestApi = {
  create: (data: CreateNpsnChangeRequestDto) => {
    return apiClient.post<NpsnChangeRequest>('/npsn-change-requests', data);
  },

  getAll: () => {
    return apiClient.get<NpsnChangeRequest[]>('/npsn-change-requests');
  },

  getPending: () => {
    return apiClient.get<NpsnChangeRequest[]>('/npsn-change-requests/pending');
  },

  getById: (id: number) => {
    return apiClient.get<NpsnChangeRequest>(`/npsn-change-requests/${id}`);
  },

  approve: (id: number, data: UpdateNpsnChangeRequestDto) => {
    return apiClient.patch<NpsnChangeRequest>(
      `/npsn-change-requests/${id}/approve`,
      data,
    );
  },

  reject: (id: number, data: UpdateNpsnChangeRequestDto) => {
    return apiClient.patch<NpsnChangeRequest>(
      `/npsn-change-requests/${id}/reject`,
      data,
    );
  },

  cancel: (id: number) => {
    return apiClient.delete(`/npsn-change-requests/${id}`);
  },
};

