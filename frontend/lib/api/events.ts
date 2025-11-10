import apiClient from './client';

export interface Event {
  id: number;
  title: string;
  description?: string;
  type?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventCreateData {
  title: string;
  description?: string;
  type?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isActive?: boolean;
}

export const eventsApi = {
  getAll: async (
    tenantId: number,
    params?: { type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }
  ): Promise<{ data: Event[]; total: number }> => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
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
};

