import apiClient from './client';

export interface DisciplinaryAction {
  id: number;
  instansiId: number;
  studentId: number;
  reporterId?: number;
  incidentDate: string;
  description: string;
  sanctionType: 'warning' | 'reprimand' | 'suspension' | 'expulsion';
  sanctionDetails?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    nik?: string;
    nisn?: string;
    nis?: string;
  };
  reporter?: {
    id: number;
    name: string;
  };
}

export interface DisciplinaryActionCreateData {
  studentId: number;
  reporterId?: number;
  incidentDate: string;
  description: string;
  sanctionType: 'warning' | 'reprimand' | 'suspension' | 'expulsion';
  sanctionDetails?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface DisciplinaryActionListParams {
  studentId?: number;
  status?: string;
  sanctionType?: string;
  page?: number;
  limit?: number;
}

export interface DisciplinaryActionListResponse {
  data: DisciplinaryAction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const disciplineApi = {
  getAll: async (
    tenantId: number,
    params?: DisciplinaryActionListParams
  ): Promise<DisciplinaryActionListResponse> => {
    const response = await apiClient.get(`/discipline/actions`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<DisciplinaryAction> => {
    const response = await apiClient.get(`/discipline/actions/${id}`);
    return response.data;
  },

  create: async (
    tenantId: number,
    data: DisciplinaryActionCreateData
  ): Promise<DisciplinaryAction> => {
    const response = await apiClient.post(`/discipline/actions`, data);
    return response.data;
  },

  updateStatus: async (
    tenantId: number,
    id: number,
    status: string
  ): Promise<DisciplinaryAction> => {
    const response = await apiClient.patch(`/discipline/actions/${id}/status`, { status });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/discipline/actions/${id}`);
    return response.data;
  },
};

