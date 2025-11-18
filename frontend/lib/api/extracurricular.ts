import apiClient from './client';

export enum ExtracurricularStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
}

export enum ExtracurricularCategory {
  SPORTS = 'sports',
  ARTS = 'arts',
  ACADEMIC = 'academic',
  SOCIAL = 'social',
  RELIGIOUS = 'religious',
  TECHNOLOGY = 'technology',
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}

export enum ActivityType {
  REGULAR = 'regular',
  COMPETITION = 'competition',
  TRAINING = 'training',
  EVENT = 'event',
  MEETING = 'meeting',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Teacher {
  id: number;
  name: string;
  email?: string;
}

export interface Student {
  id: number;
  name: string;
  studentNumber?: string;
  classRoom?: {
    id: number;
    name: string;
  };
}

export interface Extracurricular {
  id: number;
  name: string;
  description?: string;
  category: ExtracurricularCategory;
  supervisorId?: number;
  assistantSupervisorId?: number;
  supervisor?: Teacher;
  assistantSupervisor?: Teacher;
  schedule?: Record<string, any>;
  venue?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: ExtracurricularStatus;
  startDate?: string;
  endDate?: string;
  requirements?: string[];
  equipmentNeeded?: string[];
  cost?: number;
  notes?: string;
  participants?: ExtracurricularParticipant[];
  activities?: ExtracurricularActivity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtracurricularParticipant {
  id: number;
  extracurricularId: number;
  studentId: number;
  student?: Student;
  status: ParticipantStatus;
  joinedAt: string;
  leftAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtracurricularActivity {
  id: number;
  extracurricularId: number;
  title: string;
  description?: string;
  activityDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  type: ActivityType;
  status: ActivityStatus;
  notes?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtracurricularCreateData {
  name: string;
  description?: string;
  category: ExtracurricularCategory;
  supervisorId?: number;
  assistantSupervisorId?: number;
  schedule?: Record<string, any>;
  venue?: string;
  maxParticipants?: number;
  status?: ExtracurricularStatus;
  startDate?: string;
  endDate?: string;
  requirements?: string[];
  equipmentNeeded?: string[];
  cost?: number;
  notes?: string;
}

export interface ExtracurricularParticipantCreateData {
  extracurricularId: number;
  studentId: number;
  status?: ParticipantStatus;
  joinedAt?: string;
  notes?: string;
}

export interface ExtracurricularActivityCreateData {
  extracurricularId: number;
  title: string;
  description?: string;
  activityDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  notes?: string;
}

export interface ExtracurricularListParams {
  search?: string;
  category?: ExtracurricularCategory;
  status?: ExtracurricularStatus;
  page?: number;
  limit?: number;
}

export interface ExtracurricularListResponse {
  data: Extracurricular[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExtracurricularStatistics {
  total: number;
  active: number;
  totalParticipants: number;
}

export const extracurricularApi = {
  getAll: async (
    tenantId: number,
    params?: ExtracurricularListParams,
  ): Promise<ExtracurricularListResponse> => {
    const response = await apiClient.get('/extracurriculars', {
      params,
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getById: async (
    tenantId: number,
    id: number,
  ): Promise<Extracurricular> => {
    const response = await apiClient.get(`/extracurriculars/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  create: async (
    tenantId: number,
    data: ExtracurricularCreateData,
  ): Promise<Extracurricular> => {
    const response = await apiClient.post('/extracurriculars', data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  update: async (
    tenantId: number,
    id: number,
    data: Partial<ExtracurricularCreateData>,
  ): Promise<Extracurricular> => {
    const response = await apiClient.patch(`/extracurriculars/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/extracurriculars/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },

  // Participants
  addParticipant: async (
    tenantId: number,
    data: ExtracurricularParticipantCreateData,
  ): Promise<ExtracurricularParticipant> => {
    const response = await apiClient.post('/extracurriculars/participants', data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getParticipants: async (
    tenantId: number,
    extracurricularId: number,
  ): Promise<ExtracurricularParticipant[]> => {
    const response = await apiClient.get(
      `/extracurriculars/${extracurricularId}/participants`,
      {
        headers: { 'x-tenant-id': tenantId.toString() },
      },
    );
    return response.data;
  },

  removeParticipant: async (
    tenantId: number,
    participantId: number,
    notes?: string,
  ): Promise<ExtracurricularParticipant> => {
    const response = await apiClient.delete(
      `/extracurriculars/participants/${participantId}`,
      {
        data: { notes },
        headers: { 'x-tenant-id': tenantId.toString() },
      },
    );
    return response.data;
  },

  // Activities
  createActivity: async (
    tenantId: number,
    data: ExtracurricularActivityCreateData,
    createdBy?: number,
  ): Promise<ExtracurricularActivity> => {
    const response = await apiClient.post(
      '/extracurriculars/activities',
      data,
      {
        params: createdBy ? { createdBy } : undefined,
        headers: { 'x-tenant-id': tenantId.toString() },
      },
    );
    return response.data;
  },

  getActivities: async (
    tenantId: number,
    extracurricularId: number,
  ): Promise<ExtracurricularActivity[]> => {
    const response = await apiClient.get(
      `/extracurriculars/${extracurricularId}/activities`,
      {
        headers: { 'x-tenant-id': tenantId.toString() },
      },
    );
    return response.data;
  },

  updateActivity: async (
    tenantId: number,
    activityId: number,
    data: Partial<ExtracurricularActivityCreateData>,
  ): Promise<ExtracurricularActivity> => {
    const response = await apiClient.patch(
      `/extracurriculars/activities/${activityId}`,
      data,
      {
        headers: { 'x-tenant-id': tenantId.toString() },
      },
    );
    return response.data;
  },

  deleteActivity: async (
    tenantId: number,
    activityId: number,
  ): Promise<void> => {
    await apiClient.delete(`/extracurriculars/activities/${activityId}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },

  // Statistics
  getStatistics: async (
    tenantId: number,
  ): Promise<ExtracurricularStatistics> => {
    const response = await apiClient.get('/extracurriculars/statistics', {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },
};

