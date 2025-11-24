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
        ? `Network Error: Backend tidak dapat dijangkau di ${API_URL}.\n\n💡 Solusi:\n1. Pastikan backend (NestJS) berjalan di terminal terpisah\n2. Jalankan: npm run start:dev (di root directory)\n3. Tunggu sampai muncul: "Application is running on: http://localhost:3000"\n4. Pastikan MySQL/XAMPP berjalan jika diperlukan\n5. Cek file .env di root directory sudah dikonfigurasi dengan benar`
        : `Network Error: ${error.message || 'Backend tidak dapat dijangkau'}. Pastikan backend berjalan di ${API_URL}`;
      
      const networkError = new Error(errorMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      
      // Build error details object with only non-empty values
      const errorDetails: Record<string, any> = {
        baseURL: API_URL,
      };
      
      // Add message if it exists and is not empty
      if (error?.message && typeof error.message === 'string' && error.message.trim()) {
        errorDetails.message = error.message;
      } else {
        errorDetails.message = 'Unknown network error';
      }
      
      // Add code if it exists
      if (error?.code && typeof error.code === 'string') {
        errorDetails.code = error.code;
      }
      
      // Add request details if config exists
      if (error?.config) {
        if (error.config.url) {
          errorDetails.url = error.config.url;
        }
        if (error.config.method) {
          errorDetails.method = error.config.method.toUpperCase();
        }
        if (error.config.baseURL) {
          errorDetails.baseURL = error.config.baseURL;
        }
      }
      
      // Add request property if it exists (indicates request was made but no response)
      if (error?.request) {
        errorDetails.requestMade = true;
      }
      
      // Log error details with safe serialization
      try {
        // Ensure we have valid values before building the object
        const errorMsg = errorMessage ? String(errorMessage) : 'Unknown network error';
        const apiUrl = API_URL ? String(API_URL) : 'Not configured';
        
        // Build a plain object with only serializable primitive values
        const safeErrorInfo: Record<string, string | boolean | number> = {
          message: errorMsg,
          baseURL: apiUrl,
        };

        // Add error details if they exist and are meaningful
        if (errorDetails.message && typeof errorDetails.message === 'string' && errorDetails.message !== 'Unknown network error') {
          safeErrorInfo.details = String(errorDetails.message);
        }
        if (errorDetails.code && typeof errorDetails.code === 'string' && errorDetails.code !== 'N/A') {
          safeErrorInfo.code = String(errorDetails.code);
        }
        if (errorDetails.url && typeof errorDetails.url === 'string' && errorDetails.url !== 'N/A') {
          safeErrorInfo.url = String(errorDetails.url);
        }
        if (errorDetails.method && typeof errorDetails.method === 'string' && errorDetails.method !== 'N/A') {
          safeErrorInfo.method = String(errorDetails.method);
        }
        if (errorDetails.requestMade !== undefined) {
          safeErrorInfo.requestMade = Boolean(errorDetails.requestMade);
        }

        // Safely include original error information
        if (error) {
          if (error.message && typeof error.message === 'string' && error.message.trim()) {
            safeErrorInfo.originalMessage = String(error.message);
          }
          if (error.code && typeof error.code === 'string') {
            safeErrorInfo.originalCode = String(error.code);
          }
          if (error.name && typeof error.name === 'string') {
            safeErrorInfo.errorName = String(error.name);
          }
          // Only include stack if it's a string and not too long
          if (error.stack && typeof error.stack === 'string' && error.stack.length < 5000) {
            safeErrorInfo.stack = String(error.stack);
          }
        }

        // Verify object has at least message before logging
        if (!safeErrorInfo.message || safeErrorInfo.message === 'undefined' || safeErrorInfo.message === 'null') {
          safeErrorInfo.message = 'Unknown API error occurred';
        }
        
        // Log with both formatted message and object to ensure visibility
        console.error(`API Client Error: ${safeErrorInfo.message}`, safeErrorInfo);
        
        // Also log as a single string for better visibility in some console environments
        if (Object.keys(safeErrorInfo).length === 0) {
          console.error('API Client Error: Empty error object detected!', {
            errorMessage,
            API_URL,
            errorDetails,
            errorType: error?.constructor?.name,
            errorKeys: error ? Object.keys(error) : [],
          });
        }
      } catch (logError) {
        // Ultimate fallback if even logging fails
        console.error('API Client Error (fallback):', {
          message: String(errorMessage || 'Unknown error'),
          baseURL: String(API_URL || 'Not configured'),
          originalErrorType: error?.constructor?.name || typeof error,
          logError: logError instanceof Error ? logError.message : String(logError),
        });
      }
      return Promise.reject(networkError);
    }

    // Handle specific HTTP status codes
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
    } else if (error.response?.status === 404) {
      // Endpoint not found - log but don't show error for public endpoints
      const url = error.config?.url || 'unknown';
      const fullUrl = error.config?.baseURL 
        ? `${error.config.baseURL}${url}` 
        : url;
      const method = error.config?.method 
        ? String(error.config.method).toUpperCase() 
        : 'GET';
      const status = error.response?.status ?? 404;
      const baseURL = error.config?.baseURL 
        ? String(error.config.baseURL) 
        : (API_URL ? String(API_URL) : 'not configured');
      const finalUrl = fullUrl ? String(fullUrl) : 'unknown';
      const responseMessageRaw = error.response?.data?.message;
      const responseMessage = Array.isArray(responseMessageRaw)
        ? responseMessageRaw.join(', ')
        : responseMessageRaw;
      const isRouteMissing =
        typeof responseMessage === 'string' && responseMessage.trim().startsWith('Cannot ');
      
      if (url.includes('/public/')) {
        // Silently handle missing public endpoints (they're optional)
        console.warn(`Public endpoint not found: ${finalUrl}. Using fallback data.`);
      } else if (isRouteMissing) {
        const errorDetails: Record<string, string | number> = {
          url: finalUrl,
          method,
          status,
          baseURL,
        };
        console.error(`API Endpoint Not Found (${status}): ${method} ${finalUrl}`, errorDetails);
      } else {
        const resourceError = new Error(
          responseMessage || `Resource not found for ${method} ${finalUrl}`,
        );
        (resourceError as any).status = status;
        (resourceError as any).url = finalUrl;
        (resourceError as any).isNotFound = true;
        (resourceError as any).cause = error;
        (resourceError as any).originalError = error;
        
        console.warn('API Resource Not Found:', {
          url: finalUrl,
          method,
          status,
          message: responseMessage || 'Resource not found',
        });
        return Promise.reject(resourceError);
      }
    } else if (error.response?.status >= 500) {
      // Server errors
      const url = error.config?.url || 'unknown';
      const fullUrl = error.config?.baseURL 
        ? `${error.config.baseURL}${url}` 
        : url;
      
      console.error('API Server Error:', {
        url: fullUrl,
        method: error.config?.method?.toUpperCase() || 'GET',
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.message || 'Internal server error',
        baseURL: error.config?.baseURL || API_URL,
        data: error.response.data,
      });
    } else if (error.response) {
      // Other HTTP errors (400, 403, etc.)
      const url = error.config?.url || 'unknown';
      const fullUrl = error.config?.baseURL 
        ? `${error.config.baseURL}${url}` 
        : url;
      const method = error.config?.method?.toUpperCase() || 'GET';
      const responseStatus = typeof error.response.status === 'number'
        ? error.response.status
        : 'unknown';
      const responseStatusText = error.response.statusText || 'Unknown status';
      const responseData = error.response.data;
      const responseMessage = responseData?.message;
      const safeMessage = typeof responseMessage === 'string' && responseMessage.trim()
        ? responseMessage
        : `HTTP ${responseStatus} error`;
      const baseURL = error.config?.baseURL || API_URL;

      console.error('API Client Error:', {
        url: fullUrl,
        method,
        status: responseStatus,
        statusText: responseStatusText,
        message: safeMessage,
        baseURL,
        data: responseData,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

