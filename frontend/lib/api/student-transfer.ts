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
  newStudentId?: number;
  transferredData?: {
    grades?: number;
    healthRecords?: number;
    counselingSessions?: number;
    disciplinaryActions?: number;
    extracurricularParticipants?: number;
    courseProgress?: number;
    courseEnrollments?: number;
  };
  rejection_reason?: string;
  notes?: string;
}

export interface StudentTransferCreateData {
  student_id: number;
  from_instansi_id: number;
  to_instansi_id: number;
  transfer_date?: string;
  reason?: string;
  documents?: string[];
}

export interface PullRequestCreateData {
  sourceTenantNpsn: string;
  studentNisn: string;
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
    // Transform snake_case to camelCase for backend
    const transformedData = {
      studentId: data.student_id,
      toTenantId: data.to_instansi_id,
      reason: data.reason,
      transferDate: data.transfer_date,
      documents: data.documents || [],
    };
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers`, transformedData);
    return response.data;
  },

  createPullRequest: async (tenantId: number, data: PullRequestCreateData): Promise<StudentTransfer> => {
    const transformedData = {
      sourceTenantNpsn: data.sourceTenantNpsn,
      studentNisn: data.studentNisn,
      reason: data.reason,
      transferDate: data.transfer_date,
      documents: data.documents || [],
    };
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers/pull-request`, transformedData);
    return response.data;
  },

  approve: async (tenantId: number, id: number): Promise<StudentTransfer> => {
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers/${id}/approve`, {});
    return response.data;
  },

  reject: async (tenantId: number, id: number, reason?: string): Promise<StudentTransfer> => {
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers/${id}/reject`, { rejectionReason: reason });
    return response.data;
  },

  complete: async (tenantId: number, id: number): Promise<StudentTransfer> => {
    const response = await apiClient.post(`/tenants/${tenantId}/student-transfers/${id}/complete`, {});
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/student-transfers/${id}`);
  },

  lookupStudent: async (
    tenantId: number,
    sourceTenantNpsn: string,
    studentNisn: string,
  ): Promise<{ sourceTenant: { id: number; npsn: string; name: string }; student: { id: number; name: string; nik: string; nisn?: string; nis: string; gender: string; birthDate: string; birthPlace: string; classId: number; email: string; phone: string } }> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/student-transfers/lookup`,
      {
        params: { sourceTenantNpsn, studentNisn },
      },
    );
    return response.data;
  },
};

