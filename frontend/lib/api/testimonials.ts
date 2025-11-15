import { apiClient } from './client';

export interface Testimonial {
  id: number;
  tenantId: number;
  tenantName: string;
  tenantNpsn?: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar?: string;
  rating: number;
  quote: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsResponse {
  data: Testimonial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const testimonialsApi = {
  // Get all approved testimonials (public)
  getAll: async (params?: { page?: number; limit?: number; featured?: boolean }): Promise<TestimonialsResponse> => {
    const response = await apiClient.get<TestimonialsResponse>('/public/testimonials', { params });
    return response.data;
  },

  // Get featured testimonials only
  getFeatured: async (limit: number = 3): Promise<Testimonial[]> => {
    const response = await apiClient.get<Testimonial[]>('/public/testimonials/featured', {
      params: { limit },
    });
    return response.data;
  },

  // Submit a new testimonial (requires auth)
  create: async (data: {
    tenantId: number;
    reviewerName: string;
    reviewerRole: string;
    rating: number;
    quote: string;
  }): Promise<Testimonial> => {
    const response = await apiClient.post<Testimonial>('/testimonials', data);
    return response.data;
  },
};

