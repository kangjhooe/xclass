import apiClient from './client';

export type RegistrationStatus = 'pending' | 'registered' | 'selection' | 'announced' | 'accepted' | 'rejected' | 'cancelled';
export type RegistrationPath = 'zonasi' | 'affirmative' | 'transfer' | 'achievement' | 'academic';

export interface PpdbApplication {
  id: number;
  registrationNumber: string;
  studentName: string;
  studentNisn: string;
  studentNik: string;
  birthPlace: string;
  birthDate: string;
  gender: 'male' | 'female';
  religion: string;
  address: string;
  phone?: string;
  email?: string;
  parentName: string;
  parentPhone: string;
  parentOccupation: string;
  parentIncome: number;
  previousSchool: string;
  previousSchoolAddress: string;
  registrationPath: RegistrationPath;
  status: RegistrationStatus;
  selectionScore?: number;
  interviewScore?: number;
  documentScore?: number;
  totalScore?: number;
  notes?: string;
  rejectedReason?: string;
  documents?: Record<string, any>;
  paymentStatus: boolean;
  paymentDate?: string;
  paymentAmount?: number;
  paymentReceipt?: string;
  registrationDate: string;
  selectionDate?: string;
  announcementDate?: string;
  acceptedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PpdbApplicationCreateData {
  studentName: string;
  studentNisn: string;
  studentNik: string;
  birthPlace: string;
  birthDate: string;
  gender: 'male' | 'female';
  religion: string;
  address: string;
  phone?: string;
  email?: string;
  parentName: string;
  parentPhone: string;
  parentOccupation: string;
  parentIncome: number;
  previousSchool: string;
  previousSchoolAddress: string;
  registrationPath: RegistrationPath;
  status?: RegistrationStatus;
  selectionScore?: number;
  interviewScore?: number;
  documentScore?: number;
  notes?: string;
  documents?: Record<string, any>;
}

export interface PpdbStatistics {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
  byPath: Record<RegistrationPath, number>;
}

export const ppdbApi = {
  getAll: async (
    tenantId: number,
    params?: { 
      status?: RegistrationStatus; 
      registrationPath?: RegistrationPath;
      search?: string; 
      page?: number; 
      limit?: number;
    }
  ): Promise<{ data: PpdbApplication[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/ppdb/registrations', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<PpdbApplication> => {
    const response = await apiClient.get(`/ppdb/registrations/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: PpdbApplicationCreateData): Promise<PpdbApplication> => {
    const response = await apiClient.post('/ppdb/registrations', data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<PpdbApplicationCreateData>): Promise<PpdbApplication> => {
    const response = await apiClient.patch(`/ppdb/registrations/${id}`, data);
    return response.data;
  },

  updateStatus: async (
    tenantId: number, 
    id: number, 
    status: RegistrationStatus, 
    notes?: string
  ): Promise<PpdbApplication> => {
    const response = await apiClient.patch(`/ppdb/registrations/${id}/status`, { status, notes });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/ppdb/registrations/${id}`);
  },

  getStatistics: async (tenantId: number): Promise<PpdbStatistics> => {
    const response = await apiClient.get('/ppdb/statistics');
    return response.data;
  },

  // Endpoint untuk pendaftar
  getMyRegistration: async (tenantId: number): Promise<PpdbApplication | null> => {
    const response = await apiClient.get('/ppdb/my-registration');
    return response.data;
  },

  createMyRegistration: async (tenantId: number, data: PpdbApplicationCreateData): Promise<PpdbApplication> => {
    const response = await apiClient.post('/ppdb/my-registration', data);
    return response.data;
  },

  updateMyRegistration: async (tenantId: number, data: Partial<PpdbApplicationCreateData>): Promise<PpdbApplication> => {
    const response = await apiClient.patch('/ppdb/my-registration', data);
    return response.data;
  },

  uploadDocument: async (tenantId: number, file: File, documentType: string): Promise<PpdbApplication> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await apiClient.post('/ppdb/my-registration/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadCertificate: async (tenantId: number): Promise<Blob> => {
    const response = await apiClient.get('/ppdb/my-registration/certificate', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadCertificateById: async (tenantId: number, id: number): Promise<Blob> => {
    const response = await apiClient.get(`/ppdb/registrations/${id}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  },

  verifyDocument: async (
    tenantId: number,
    id: number,
    documentType: string,
    status: 'pending' | 'verified' | 'rejected',
    rejectionReason?: string
  ): Promise<PpdbApplication> => {
    const response = await apiClient.post(`/ppdb/registrations/${id}/verify-document`, {
      documentType,
      status,
      rejectionReason,
    });
    return response.data;
  },

  sendDocumentReminder: async (tenantId: number, id: number): Promise<{ message: string }> => {
    const response = await apiClient.post(`/ppdb/registrations/${id}/send-document-reminder`);
    return response.data;
  },

  uploadPayment: async (
    tenantId: number,
    file: File,
    paymentAmount: number,
    paymentMethod?: string,
    paymentReference?: string,
    notes?: string
  ): Promise<PpdbApplication> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('paymentAmount', paymentAmount.toString());
    if (paymentMethod) formData.append('paymentMethod', paymentMethod);
    if (paymentReference) formData.append('paymentReference', paymentReference);
    if (notes) formData.append('notes', notes);
    
    const response = await apiClient.post('/ppdb/my-registration/upload-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyPayment: async (
    tenantId: number,
    id: number,
    status: 'verified' | 'rejected',
    rejectionReason?: string
  ): Promise<PpdbApplication> => {
    const response = await apiClient.post(`/ppdb/registrations/${id}/verify-payment`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  checkAnnouncement: async (
    tenantId: number | null,
    params: { registrationNumber?: string; nisn?: string }
  ): Promise<PpdbApplication | null> => {
    const url = tenantId 
      ? `/tenants/${tenantId}/ppdb/announcement/check`
      : '/ppdb/announcement/check';
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  getAnnouncementStatistics: async (
    tenantId: number | null
  ): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    byPath: Record<string, number>;
  }> => {
    const url = tenantId
      ? `/tenants/${tenantId}/ppdb/announcement/statistics`
      : '/ppdb/announcement/statistics';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Interview Schedule APIs
  createInterviewSchedule: async (
    tenantId: number,
    data: {
      scheduleDate: string;
      startTime: string;
      endTime: string;
      maxParticipants?: number;
      location?: string;
      notes?: string;
    }
  ): Promise<any> => {
    const response = await apiClient.post('/ppdb/interview-schedules', data);
    return response.data;
  },

  getInterviewSchedules: async (
    tenantId: number,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      status?: string;
    }
  ): Promise<any[]> => {
    const response = await apiClient.get('/ppdb/interview-schedules', { params: filters });
    return response.data;
  },

  getAvailableSchedules: async (tenantId: number): Promise<any[]> => {
    const response = await apiClient.get('/ppdb/interview-schedules/available');
    return response.data;
  },

  bookInterviewSchedule: async (
    tenantId: number,
    scheduleId: number
  ): Promise<any> => {
    const response = await apiClient.post('/ppdb/my-registration/book-interview', {
      scheduleId,
    });
    return response.data;
  },

  getMyInterviewSchedule: async (tenantId: number): Promise<any | null> => {
    const response = await apiClient.get('/ppdb/my-registration/interview-schedule');
    return response.data;
  },

  cancelInterviewSchedule: async (
    tenantId: number,
    scheduleId: number
  ): Promise<any> => {
    const response = await apiClient.delete(`/ppdb/interview-schedules/${scheduleId}`);
    return response.data;
  },

  getAnalytics: async (
    tenantId: number,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{
    daily: Array<{ date: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
    byPath: Record<string, number>;
    byStatus: Record<string, number>;
    paymentStats: {
      total: number;
      verified: number;
      pending: number;
      unpaid: number;
    };
    documentStats: {
      total: number;
      verified: number;
      pending: number;
      rejected: number;
    };
  }> => {
    const response = await apiClient.get('/ppdb/analytics', { params: filters });
    return response.data;
  },

  // Bulk Operations APIs
  bulkUpdateStatus: async (
    tenantId: number,
    registrationIds: number[],
    status: string,
    notes?: string
  ): Promise<{ updated: number; failed: number }> => {
    const response = await apiClient.post('/ppdb/bulk/update-status', {
      registrationIds,
      status,
      notes,
    });
    return response.data;
  },

  bulkExport: async (
    tenantId: number,
    options: {
      registrationIds?: number[];
      status?: string;
      format?: 'excel' | 'pdf';
    }
  ): Promise<Blob> => {
    const response = await apiClient.post('/ppdb/bulk/export', options, {
      responseType: 'blob',
    });
    return response.data;
  },

  bulkImportScores: async (
    tenantId: number,
    scores: Array<{
      registrationId: number;
      selectionScore?: number;
      interviewScore?: number;
      documentScore?: number;
    }>
  ): Promise<{ updated: number; failed: number; errors: string[] }> => {
    const response = await apiClient.post('/ppdb/bulk/import-scores', { scores });
    return response.data;
  },

  bulkSendNotification: async (
    tenantId: number,
    registrationIds: number[],
    subject: string,
    message: string
  ): Promise<{ sent: number; failed: number }> => {
    const response = await apiClient.post('/ppdb/bulk/send-notification', {
      registrationIds,
      subject,
      message,
    });
    return response.data;
  },

  // Student Transfer APIs
  searchStudentFromOtherTenant: async (
    tenantId: number,
    nisn: string,
    sourceTenantNpsn: string
  ): Promise<{
    student: any;
    sourceTenant: any;
    isEligible: boolean;
    eligibilityReason: string;
  }> => {
    const response = await apiClient.get('/ppdb/search-student', {
      params: { nisn, sourceTenantNpsn },
    });
    return response.data;
  },

  // Public PPDB Info (no auth required)
  // tenantIdentifier can be NPSN (string) or numeric ID
  getPublicInfo: async (tenantIdentifier: string | number): Promise<{
    totalRegistrations: number;
    acceptedCount: number;
    pendingCount: number;
    registeredCount: number;
    availableSchedules: Array<{
      id: number;
      scheduleDate: string;
      startTime: string;
      endTime: string;
      location: string;
      maxParticipants: number;
      currentParticipants: number;
      notes: string;
    }>;
    byPath: Record<string, number>;
  }> => {
    const response = await apiClient.get('/public/ppdb/info', {
      headers: {
        'X-Tenant-NPSN': tenantIdentifier.toString(),
      },
    });
    return response.data;
  },
};

