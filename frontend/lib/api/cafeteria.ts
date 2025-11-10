import apiClient from './client';

export interface Menu {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  status?: 'available' | 'unavailable';
  created_at?: string;
  updated_at?: string;
}

export interface MenuCreateData {
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  status?: 'available' | 'unavailable';
}

export interface Order {
  id: number;
  order_number?: string;
  student_id?: number;
  student_name?: string;
  items: OrderItem[];
  total_amount: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status?: 'unpaid' | 'paid';
  order_date?: string;
  created_at?: string;
}

export interface OrderItem {
  menu_id: number;
  menu_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderCreateData {
  student_id?: number;
  items: OrderItem[];
  payment_status?: 'unpaid' | 'paid';
}

export const cafeteriaApi = {
  // Menus
  getAllMenus: async (tenantId: number, params?: any): Promise<{ data: Menu[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/menus`, { params });
    return response.data;
  },

  getMenuById: async (tenantId: number, id: number): Promise<Menu> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/menus/${id}`);
    return response.data;
  },

  createMenu: async (tenantId: number, data: MenuCreateData): Promise<Menu> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/menus`, data);
    return response.data;
  },

  updateMenu: async (tenantId: number, id: number, data: Partial<MenuCreateData>): Promise<Menu> => {
    const response = await apiClient.put(`/tenants/${tenantId}/cafeteria/menus/${id}`, data);
    return response.data;
  },

  deleteMenu: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cafeteria/menus/${id}`);
  },

  // Orders
  getAllOrders: async (tenantId: number, params?: any): Promise<{ data: Order[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/orders`, { params });
    return response.data;
  },

  getOrderById: async (tenantId: number, id: number): Promise<Order> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/orders/${id}`);
    return response.data;
  },

  createOrder: async (tenantId: number, data: OrderCreateData): Promise<Order> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/orders`, data);
    return response.data;
  },

  updateOrder: async (tenantId: number, id: number, data: Partial<OrderCreateData>): Promise<Order> => {
    const response = await apiClient.put(`/tenants/${tenantId}/cafeteria/orders/${id}`, data);
    return response.data;
  },

  deleteOrder: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cafeteria/orders/${id}`);
  },
};

