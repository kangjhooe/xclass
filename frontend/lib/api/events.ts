import apiClient from './client';

export enum EventType {
  ACADEMIC = 'academic',
  SOCIAL = 'social',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  RELIGIOUS = 'religious',
  MEETING = 'meeting',
  CEREMONY = 'ceremony',
}

export enum EventCategory {
  SCHOOL = 'school',
  CLASS = 'class',
  GRADE = 'grade',
  EXTRACURRICULAR = 'extracurricular',
  PARENT = 'parent',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  eventType: EventType;
  category: EventCategory;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  organizer?: string;
  targetAudience?: string[];
  maxParticipants?: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  cost?: number;
  status: EventStatus;
  isPublic: boolean;
  images?: string[];
  attachments?: string[];
  notes?: string;
  createdBy?: number;
  instansiId: number;
  createdAt?: string;
  updatedAt?: string;
  registrations?: EventRegistration[];
}

export interface EventCreateData {
  title: string;
  description?: string;
  eventType: EventType;
  category: EventCategory;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  organizer?: string;
  targetAudience?: string[];
  maxParticipants?: number;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  cost?: number;
  status?: EventStatus;
  isPublic?: boolean;
  images?: string[];
  attachments?: string[];
  notes?: string;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  studentId?: number;
  parentId?: number;
  teacherId?: number;
  staffId?: number;
  registrationDate: string;
  status: RegistrationStatus;
  paymentStatus: boolean;
  paymentAmount?: number;
  paymentReceipt?: string;
  incomeExpenseId?: number;
  notes?: string;
  createdBy?: number;
  instansiId: number;
  createdAt?: string;
  updatedAt?: string;
  event?: Event;
  student?: any;
  teacher?: any;
  incomeExpense?: any;
}

export interface EventRegistrationCreateData {
  eventId: number;
  studentId?: number;
  parentId?: number;
  teacherId?: number;
  staffId?: number;
  status?: RegistrationStatus;
  paymentAmount?: number;
  notes?: string;
}

export const eventsApi = {
  getAll: async (
    tenantId: number,
    params?: {
      search?: string;
      eventType?: EventType;
      category?: EventCategory;
      status?: EventStatus;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Event[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  getUpcoming: async (tenantId: number): Promise<Event[]> => {
    const response = await apiClient.get('/events/upcoming');
    return response.data;
  },

  getStatistics: async (tenantId: number) => {
    const response = await apiClient.get('/events/statistics');
    return response.data;
  },

  create: async (tenantId: number, data: EventCreateData): Promise<Event> => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<EventCreateData>): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  // Registrations
  createRegistration: async (
    tenantId: number,
    data: EventRegistrationCreateData
  ): Promise<EventRegistration> => {
    const response = await apiClient.post('/events/registrations', data);
    return response.data;
  },

  getAllRegistrations: async (
    tenantId: number,
    params?: {
      eventId?: number;
      studentId?: number;
      status?: RegistrationStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: EventRegistration[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get('/events/registrations', { params });
    return response.data;
  },

  updateRegistrationStatus: async (
    tenantId: number,
    id: number,
    status: RegistrationStatus
  ): Promise<EventRegistration> => {
    const response = await apiClient.patch(`/events/registrations/${id}/status`, { status });
    return response.data;
  },

  confirmPayment: async (
    tenantId: number,
    id: number,
    paymentReceipt?: string
  ): Promise<EventRegistration> => {
    const response = await apiClient.post(`/events/registrations/${id}/confirm-payment`, {
      paymentReceipt,
    });
    return response.data;
  },
};

