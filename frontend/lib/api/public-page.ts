import apiClient from './client';

export enum ContactFormStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived',
}

export enum PPDBFormStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
}

export interface ContactForm {
  id: number;
  instansiId: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactFormStatus;
  reply?: string;
  repliedAt?: string;
  repliedBy?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PPDBForm {
  id: number;
  instansiId: number;
  studentName: string;
  studentNIK: string;
  studentBirthDate: string;
  studentBirthPlace: string;
  studentGender: string;
  studentAddress: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation?: string;
  desiredClass: string;
  previousSchool?: string;
  notes?: string;
  status: PPDBFormStatus;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  documents?: Record<string, string>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
}

export interface Gallery {
  id: number;
  name: string;
  description?: string;
  images: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface TenantProfile {
  id: number;
  instansiId: number;
  description?: string;
  vision?: string;
  mission?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
}

export const publicPageApi = {
  // Public endpoints (no auth required, but need tenant ID)
  submitContactForm: async (
    tenantId: number,
    data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    },
  ): Promise<{ data: ContactForm }> => {
    const response = await apiClient.post(`/public/contact`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  submitPPDBForm: async (tenantId: number, data: any): Promise<{ data: PPDBForm }> => {
    const response = await apiClient.post(`/public/ppdb`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getHomeStatistics: async (tenantId: number): Promise<any> => {
    const response = await apiClient.get(`/public/home`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getFeaturedNews: async (tenantId: number, limit = 3): Promise<{ data: News[] }> => {
    const response = await apiClient.get(`/public/news/featured`, {
      params: { limit },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getLatestNews: async (tenantId: number, limit = 6): Promise<{ data: News[] }> => {
    const response = await apiClient.get(`/public/news/latest`, {
      params: { limit },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getAllNews: async (
    tenantId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: News[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get(`/public/news`, {
      params: { page, limit },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getNewsBySlug: async (tenantId: number, slug: string): Promise<{ data: News }> => {
    const response = await apiClient.get(`/public/news/${slug}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getAllGalleries: async (tenantId: number): Promise<{ data: Gallery[] }> => {
    const response = await apiClient.get(`/public/galleries`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getTenantProfile: async (tenantId: number): Promise<{ data: TenantProfile }> => {
    const response = await apiClient.get(`/public/profile`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },
};

// Admin endpoints (require auth)
export const publicPageAdminApi = {
  getContactForms: async (
    tenantId: number,
    filters?: {
      status?: ContactFormStatus;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: ContactForm[] }> => {
    const response = await apiClient.get(`/public-page/contact-forms`, {
      params: filters,
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  replyToContactForm: async (
    tenantId: number,
    formId: number,
    reply: string,
  ): Promise<{ data: ContactForm }> => {
    const response = await apiClient.put(
      `/public-page/contact-forms/${formId}/reply`,
      { reply },
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  getPPDBForms: async (
    tenantId: number,
    filters?: {
      status?: PPDBFormStatus;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: PPDBForm[] }> => {
    const response = await apiClient.get(`/public-page/ppdb-forms`, {
      params: filters,
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  reviewPPDBForm: async (
    tenantId: number,
    formId: number,
    data: {
      status: PPDBFormStatus;
      reviewNotes: string;
    },
  ): Promise<{ data: PPDBForm }> => {
    const response = await apiClient.put(`/public-page/ppdb-forms/${formId}/review`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },
};

