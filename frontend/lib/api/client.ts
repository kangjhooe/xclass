import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Inject delegated tenant header for super admin impersonation sessions
      const delegatedRaw = sessionStorage.getItem('delegatedTenant');
      if (delegatedRaw) {
        try {
          const delegated = JSON.parse(delegatedRaw);
          if (delegated?.tenantId) {
            if (!delegated.expiresAt || new Date(delegated.expiresAt).getTime() > Date.now()) {
              config.headers['x-tenant-id'] = delegated.tenantId;
            } else {
              sessionStorage.removeItem('delegatedTenant');
            }
          }
        } catch (error) {
          console.error('Failed to parse delegated tenant data', error);
          sessionStorage.removeItem('delegatedTenant');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error (backend tidak berjalan atau connection refused)
      const errorMessage = error.code === 'ECONNABORTED' 
        ? `Network Error: Request timeout. Backend tidak merespons dalam 30 detik. Pastikan backend berjalan di ${API_URL}`
        : error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')
        ? `Network Error: Backend tidak dapat dijangkau di ${API_URL}. Pastikan backend berjalan dan CORS dikonfigurasi dengan benar.`
        : `Network Error: ${error.message || 'Backend tidak dapat dijangkau'}. Pastikan backend berjalan di ${API_URL}`;
      
      const networkError = new Error(errorMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      console.error('API Client Error:', {
        message: error.message,
        code: error.code,
        config: error.config,
        baseURL: API_URL,
      });
      return Promise.reject(networkError);
    }

    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        const currentPath = window.location.pathname;
        const tenantMatch = currentPath.match(/\/(\d+)\//);
        if (tenantMatch) {
          window.location.href = `/${tenantMatch[1]}/login`;
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

