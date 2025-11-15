import apiClient from './client';

export interface PublicHomeStats {
  newsCount: number;
  studentCount: number;
  teacherCount: number;
  yearCount: number;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Gallery {
  id: number;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantProfile {
  id: number;
  description: string;
  vision: string;
  mission: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
}

export interface Download {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  downloadCount: number;
  isActive: boolean;
  order: number;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export const publicApi = {
  getHome: async (tenantId: string | number): Promise<PublicHomeStats> => {
    const response = await apiClient.get('/public/home', {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getNews: async (
    tenantId: string | number,
    params?: { page?: number; limit?: number }
  ): Promise<NewsListResponse> => {
    const response = await apiClient.get('/public/news', {
      params,
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getFeaturedNews: async (
    tenantId: string | number,
    limit?: number
  ): Promise<News[]> => {
    const response = await apiClient.get('/public/news/featured', {
      params: { limit },
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getLatestNews: async (
    tenantId: string | number,
    limit?: number
  ): Promise<News[]> => {
    const response = await apiClient.get('/public/news/latest', {
      params: { limit },
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getNewsBySlug: async (
    tenantId: string | number,
    slug: string
  ): Promise<News> => {
    const response = await apiClient.get(`/public/news/${slug}`, {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getGalleries: async (tenantId: string | number): Promise<Gallery[]> => {
    const response = await apiClient.get('/public/galleries', {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getGalleryById: async (
    tenantId: string | number,
    id: number
  ): Promise<Gallery> => {
    const response = await apiClient.get(`/public/galleries/${id}`, {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getProfile: async (tenantId: string | number): Promise<TenantProfile> => {
    const response = await apiClient.get('/public/profile', {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getDownloads: async (
    tenantId: string | number,
    category?: string
  ): Promise<Download[]> => {
    const response = await apiClient.get('/public/downloads', {
      params: { category },
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getDownloadCategories: async (
    tenantId: string | number
  ): Promise<string[]> => {
    const response = await apiClient.get('/public/downloads/categories', {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  getDownloadById: async (
    tenantId: string | number,
    id: number
  ): Promise<Download> => {
    const response = await apiClient.get(`/public/downloads/${id}`, {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },

  submitContact: async (
    tenantId: string | number,
    data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    }
  ): Promise<any> => {
    const response = await apiClient.post('/public/contact', data, {
      headers: {
        'X-Tenant-NPSN': tenantId.toString(),
      },
    });
    return response.data;
  },
};


