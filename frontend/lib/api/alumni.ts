import apiClient from './client';

export interface Alumni {
  id: number;
  instansiId: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
    nisn?: string;
    nis?: string;
  };
  graduationYear: number;
  graduationDate: string;
  finalGrade: number;
  gpa?: number;
  rank?: number;
  currentOccupation?: string;
  company?: string;
  position?: string;
  industry?: string;
  salaryRange?: number;
  address?: string;
  phone?: string;
  email?: string;
  status: 'employed' | 'unemployed' | 'studying' | 'self_employed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlumniCreateData {
  studentId: number;
  graduationYear: number;
  graduationDate: string;
  finalGrade: number;
  gpa?: number;
  rank?: number;
  currentOccupation?: string;
  company?: string;
  position?: string;
  industry?: string;
  salaryRange?: number;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'employed' | 'unemployed' | 'studying' | 'self_employed';
  notes?: string;
}

export const alumniApi = {
  getAll: async (
    tenantId: number,
    params?: { status?: string; graduationYear?: number; search?: string; page?: number; limit?: number }
  ): Promise<{ data: Alumni[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/alumni', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Alumni> => {
    const response = await apiClient.get(`/alumni/${id}`);
    return response.data;
  },

  getStatistics: async (tenantId: number) => {
    const response = await apiClient.get('/alumni/statistics');
    return response.data;
  },

  create: async (tenantId: number, data: AlumniCreateData): Promise<Alumni> => {
    const response = await apiClient.post('/alumni', data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<AlumniCreateData>): Promise<Alumni> => {
    const response = await apiClient.patch(`/alumni/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/alumni/${id}`);
  },
};

