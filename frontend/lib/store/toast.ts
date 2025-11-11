import { create } from 'zustand';
import { Toast, ToastType, ToastAction } from '@/components/ui/Toast';

interface ToastStore {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => string;
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => string;
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => string;
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => string;
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => Promise<T>;
}

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  showToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  removeAllToasts: () => {
    set({ toasts: [] });
  },
  
  success: (message, options = {}) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'success', duration: 3000, ...options }],
    }));
    return id;
  },
  
  error: (message, options = {}) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'error', duration: 5000, ...options }],
    }));
    return id;
  },
  
  warning: (message, options = {}) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'warning', duration: 4000, ...options }],
    }));
    return id;
  },
  
  info: (message, options = {}) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'info', duration: 3000, ...options }],
    }));
    return id;
  },
  
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    const loadingId = get().showToast({
      message: messages.loading,
      type: 'info',
      persistent: true,
    });

    try {
      const data = await promise;
      get().removeToast(loadingId);
      const successMessage = typeof messages.success === 'function' 
        ? messages.success(data) 
        : messages.success;
      get().success(successMessage);
      return data;
    } catch (error) {
      get().removeToast(loadingId);
      const errorMessage = typeof messages.error === 'function'
        ? messages.error(error)
        : messages.error;
      get().error(errorMessage);
      throw error;
    }
  },
}));

