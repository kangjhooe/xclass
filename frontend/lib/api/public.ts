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

// Admin API for managing public pages
export const publicPageAdminApi = {
  // News Management
  getNews: async (
    tenantId: number,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<NewsListResponse> => {
    const response = await apiClient.get('/public-page/news', { params });
    return response.data;
  },

  getNewsById: async (tenantId: number, id: number): Promise<News> => {
    const response = await apiClient.get(`/public-page/news/${id}`);
    return response.data;
  },

  createNews: async (tenantId: number, data: FormData): Promise<News> => {
    const response = await apiClient.post('/public-page/news', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateNews: async (tenantId: number, id: number, data: FormData): Promise<News> => {
    const response = await apiClient.put(`/public-page/news/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteNews: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/public-page/news/${id}`);
  },

  // Gallery Management
  getGalleries: async (tenantId: number): Promise<Gallery[]> => {
    const response = await apiClient.get('/public-page/galleries');
    return response.data;
  },

  getGalleryById: async (tenantId: number, id: number): Promise<Gallery> => {
    const response = await apiClient.get(`/public-page/galleries/${id}`);
    return response.data;
  },

  createGallery: async (tenantId: number, data: FormData): Promise<Gallery> => {
    const response = await apiClient.post('/public-page/galleries', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateGallery: async (tenantId: number, id: number, data: FormData): Promise<Gallery> => {
    const response = await apiClient.put(`/public-page/galleries/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteGallery: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/public-page/galleries/${id}`);
  },

  // Profile Management
  getProfile: async (tenantId: number): Promise<TenantProfile> => {
    const response = await apiClient.get('/public-page/profile');
    return response.data;
  },

  updateProfile: async (tenantId: number, data: FormData): Promise<TenantProfile> => {
    const response = await apiClient.put('/public-page/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Download Management
  getDownloads: async (tenantId: number, category?: string): Promise<Download[]> => {
    const response = await apiClient.get('/public-page/downloads', {
      params: { category },
    });
    return response.data;
  },

  getDownloadById: async (tenantId: number, id: number): Promise<Download> => {
    const response = await apiClient.get(`/public-page/downloads/${id}`);
    return response.data;
  },

  createDownload: async (tenantId: number, data: FormData): Promise<Download> => {
    const response = await apiClient.post('/public-page/downloads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDownload: async (tenantId: number, id: number, data: FormData): Promise<Download> => {
    const response = await apiClient.put(`/public-page/downloads/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteDownload: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/public-page/downloads/${id}`);
  },
};


