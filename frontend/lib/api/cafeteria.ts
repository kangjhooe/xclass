import apiClient from './client';

export type MenuCategory = 'food' | 'drink' | 'snack';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface CafeteriaOutlet {
  id: number;
  instansiId: number;
  name: string;
  description?: string;
  location?: string;
  contactPerson?: string;
  contactPhone?: string;
  openingHours?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CafeteriaMenu {
  id: number;
  instansiId: number;
  canteenId: number;
  canteen?: CafeteriaOutlet;
  name: string;
  description?: string;
  category: MenuCategory;
  price: number;
  stock?: number | null;
  isAvailable: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CafeteriaMenuPayload {
  canteenId: number;
  name: string;
  description?: string;
  category: MenuCategory;
  price: number;
  stock?: number;
  isAvailable?: boolean;
  image?: string;
}

export interface CafeteriaOrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menu?: CafeteriaMenu;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt?: string;
}

export interface CafeteriaOrder {
  id: number;
  instansiId: number;
  canteenId: number;
  canteen?: CafeteriaOutlet;
  studentId: number;
  student?: {
    id: number;
    name: string;
    studentNumber?: string;
    className?: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: CafeteriaOrderItem[];
}

export interface CafeteriaOrderPayload {
  canteenId: number;
  studentId: number;
  menuItems: Array<{ id: number; quantity: number }>;
  notes?: string;
}

export interface CafeteriaStatistics {
  totalCanteens: number;
  perCanteen: Array<{
    canteen: CafeteriaOutlet;
    menu: { total: number; available: number };
    orders: { total: number; today: number };
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const cafeteriaApi = {
  // ===== CANTEENS =====
  getCanteens: async (tenantId: number): Promise<CafeteriaOutlet[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/canteens`);
    return response.data;
  },

  createCanteen: async (tenantId: number, payload: Partial<CafeteriaOutlet>): Promise<CafeteriaOutlet> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/canteens`, payload);
    return response.data;
  },

  updateCanteen: async (
    tenantId: number,
    id: number,
    payload: Partial<CafeteriaOutlet>,
  ): Promise<CafeteriaOutlet> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/cafeteria/canteens/${id}`, payload);
    return response.data;
  },

  deleteCanteen: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cafeteria/canteens/${id}`);
  },

  // ===== MENUS =====
  getMenus: async (
    tenantId: number,
    params?: {
      canteenId?: number;
      category?: MenuCategory;
      isAvailable?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<CafeteriaMenu>> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/menu`, { params });
    return response.data;
  },

  getMenuById: async (tenantId: number, id: number): Promise<CafeteriaMenu> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/menu/${id}`);
    return response.data;
  },

  createMenu: async (tenantId: number, payload: CafeteriaMenuPayload): Promise<CafeteriaMenu> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/menu`, payload);
    return response.data;
  },

  updateMenu: async (
    tenantId: number,
    id: number,
    payload: Partial<CafeteriaMenuPayload>,
  ): Promise<CafeteriaMenu> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/cafeteria/menu/${id}`, payload);
    return response.data;
  },

  deleteMenu: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cafeteria/menu/${id}`);
  },

  // ===== ORDERS =====
  getOrders: async (
    tenantId: number,
    params?: {
      canteenId?: number;
      studentId?: number;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<CafeteriaOrder>> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/orders`, { params });
    return response.data;
  },

  getOrderById: async (tenantId: number, id: number): Promise<CafeteriaOrder> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/orders/${id}`);
    return response.data;
  },

  createOrder: async (tenantId: number, payload: CafeteriaOrderPayload): Promise<CafeteriaOrder> => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/orders`, payload);
    return response.data;
  },

  updateOrderStatus: async (
    tenantId: number,
    id: number,
    status: OrderStatus,
  ): Promise<CafeteriaOrder> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/cafeteria/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/cafeteria/orders/${id}`);
  },

  processPayment: async (
    tenantId: number,
    id: number,
    payload: {
      paymentMethod: 'cash' | 'card' | 'transfer' | 'qris';
      paymentAmount: number;
      paymentReference?: string;
      notes?: string;
    },
  ) => {
    const response = await apiClient.post(`/tenants/${tenantId}/cafeteria/orders/${id}/payment`, payload);
    return response.data;
  },

  // ===== STATS =====
  getStatistics: async (tenantId: number): Promise<CafeteriaStatistics> => {
    const response = await apiClient.get(`/tenants/${tenantId}/cafeteria/statistics`);
    return response.data;
  },
};

