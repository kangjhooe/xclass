import apiClient from './client';

export interface FinanceTransaction {
  id: number;
  studentId?: number;
  student?: {
    id: number;
    name: string;
  };
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface FinanceTransactionCreateData {
  studentId?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface SPP {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SPPCreateData {
  studentId: number;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  notes?: string;
}

export const financeApi = {
  // Transactions
  getAllTransactions: async (
    tenantId: number,
    params?: { type?: string; studentId?: number; startDate?: string; endDate?: string }
  ): Promise<{ data: FinanceTransaction[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/transactions`, { params });
    return response.data;
  },

  createTransaction: async (tenantId: number, data: FinanceTransactionCreateData): Promise<FinanceTransaction> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/transactions`, data);
    return response.data;
  },

  updateTransaction: async (tenantId: number, id: number, data: Partial<FinanceTransactionCreateData>): Promise<FinanceTransaction> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/transactions/${id}`);
  },

  // SPP
  getAllSPP: async (
    tenantId: number,
    params?: { studentId?: number; year?: number; status?: string }
  ): Promise<{ data: SPP[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/spp`, { params });
    return response.data;
  },

  createSPP: async (tenantId: number, data: SPPCreateData): Promise<SPP> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/spp`, data);
    return response.data;
  },

  paySPP: async (tenantId: number, id: number, paidDate: string): Promise<SPP> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/spp/${id}/pay`, { paidDate });
    return response.data;
  },
};

