import apiClient from './client';

export interface StudentTransfer {
  id: number;
  student_id: number;
  student_name?: string;
  student_nis?: string;
  from_instansi_id: number;
  from_instansi_name?: string;
  to_instansi_id: number;
  to_instansi_name?: string;
  transfer_date?: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  documents?: string[];
  created_at?: string;
  processed_at?: string;
  created_by?: number;
}

export interface StudentTransferCreateData {
  student_id: number;
  from_instansi_id: number;
  to_instansi_id: number;
  transfer_date?: string;
  reason?: string;
  documents?: string[];
}

export const studentTransferApi = {
  getAll: async (tenantId: number, params?: any): Promise<{ data: StudentTransfer[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/student-transfers`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<StudentTransfer> => {
    const response = await apiClient.get(`/tenants/${tenantId}/student-transfers/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: StudentTransferCreateData): Promise<StudentTransfer> => {
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers`, data);
    return response.data;
  },

  approve: async (tenantId: number, id: number): Promise<StudentTransfer> => {
    const response = await apiClient.put(`/tenants/${tenantId}/student-transfers/${id}/approve`);
    return response.data;
  },

  reject: async (tenantId: number, id: number, reason?: string): Promise<StudentTransfer> => {
    const response = await apiClient.put(`/tenants/${tenantId}/student-transfers/${id}/reject`, { reason });
    return response.data;
  },

  complete: async (tenantId: number, id: number): Promise<StudentTransfer> => {
    const response = await apiClient.put(`/tenants/${tenantId}/student-transfers/${id}/complete`);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/student-transfers/${id}`);
  },
};

