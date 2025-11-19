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

  updateSPP: async (tenantId: number, id: number, data: Partial<SPPCreateData>): Promise<SPP> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/spp/${id}`, data);
    return response.data;
  },

  deleteSPP: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/spp/${id}`);
  },

  // Savings
  getAllSavings: async (
    tenantId: number,
    params?: { studentId?: number; transactionType?: 'deposit' | 'withdrawal' }
  ): Promise<{ data: Savings[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/savings`, { params });
    return response.data;
  },

  createSavings: async (tenantId: number, data: SavingsCreateData): Promise<Savings> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/savings`, data);
    return response.data;
  },

  updateSavings: async (tenantId: number, id: number, data: Partial<SavingsCreateData>): Promise<Savings> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/savings/${id}`, data);
    return response.data;
  },

  deleteSavings: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/savings/${id}`);
  },

  getStudentBalance: async (tenantId: number, studentId: number): Promise<{ balance: number; totalDeposits: number; totalWithdrawals: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/students/${studentId}/savings/balance`);
    return response.data;
  },

  // Other Bills
  getAllOtherBills: async (
    tenantId: number,
    params?: { studentId?: number; category?: string; status?: string }
  ): Promise<{ data: OtherBill[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/other-bills`, { params });
    return response.data;
  },

  createOtherBill: async (tenantId: number, data: OtherBillCreateData): Promise<OtherBill> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/other-bills`, data);
    return response.data;
  },

  updateOtherBill: async (tenantId: number, id: number, data: Partial<OtherBillCreateData>): Promise<OtherBill> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/other-bills/${id}`, data);
    return response.data;
  },

  deleteOtherBill: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/other-bills/${id}`);
  },

  payOtherBill: async (tenantId: number, id: number, paidDate: string, paymentMethod?: string, paymentReference?: string, receiptNumber?: string): Promise<OtherBill> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/other-bills/${id}/pay`, {
      paidDate,
      paymentMethod,
      paymentReference,
      receiptNumber,
    });
    return response.data;
  },

  // Income & Expense
  getAllIncomeExpenses: async (
    tenantId: number,
    params?: { type?: 'income' | 'expense'; category?: string; startDate?: string; endDate?: string }
  ): Promise<{ data: IncomeExpense[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/income-expenses`, { params });
    return response.data;
  },

  createIncomeExpense: async (tenantId: number, data: IncomeExpenseCreateData): Promise<IncomeExpense> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/income-expenses`, data);
    return response.data;
  },

  updateIncomeExpense: async (tenantId: number, id: number, data: Partial<IncomeExpenseCreateData>): Promise<IncomeExpense> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/income-expenses/${id}`, data);
    return response.data;
  },

  deleteIncomeExpense: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/income-expenses/${id}`);
  },

  getIncomeExpenseSummary: async (
    tenantId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/income-expenses/summary`, { params });
    return response.data;
  },

  // Scholarships
  getAllScholarships: async (
    tenantId: number,
    params?: { studentId?: number; type?: string; status?: string }
  ): Promise<{ data: Scholarship[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/scholarships`, { params });
    return response.data;
  },

  createScholarship: async (tenantId: number, data: ScholarshipCreateData): Promise<Scholarship> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/scholarships`, data);
    return response.data;
  },

  updateScholarship: async (tenantId: number, id: number, data: Partial<ScholarshipCreateData>): Promise<Scholarship> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/scholarships/${id}`, data);
    return response.data;
  },

  deleteScholarship: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/scholarships/${id}`);
  },

  getScholarshipStatistics: async (tenantId: number): Promise<{ total: number; active: number; expired: number; cancelled: number; totalAmount: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/scholarships/statistics`);
    return response.data;
  },

  // Financial Reports
  getFinancialDashboard: async (
    tenantId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<FinancialDashboard> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reports/dashboard`, { params });
    return response.data;
  },

  getMonthlyTrends: async (
    tenantId: number,
    months?: number
  ): Promise<MonthlyTrend[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reports/monthly-trends`, {
      params: { months },
    });
    return response.data;
  },

  getCategoryBreakdown: async (
    tenantId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<CategoryBreakdown> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reports/category-breakdown`, { params });
    return response.data;
  },

  getPaymentStatusSummary: async (
    tenantId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<PaymentStatusSummary> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reports/payment-status`, { params });
    return response.data;
  },

  // Reminders & Notifications
  getPaymentReminders: async (
    tenantId: number,
    daysAhead?: number
  ): Promise<PaymentReminders> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reminders`, {
      params: { daysAhead },
    });
    return response.data;
  },

  getReminderSummary: async (
    tenantId: number
  ): Promise<ReminderSummary> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/reminders/summary`);
    return response.data;
  },

  // Budgets
  getAllBudgets: async (
    tenantId: number,
    params?: { category?: string; period?: string; year?: number; status?: string }
  ): Promise<{ data: Budget[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/budgets`, { params });
    return response.data;
  },

  createBudget: async (tenantId: number, data: BudgetCreateData): Promise<Budget> => {
    const response = await apiClient.post(`/tenants/${tenantId}/finance/budgets`, data);
    return response.data;
  },

  updateBudget: async (tenantId: number, id: number, data: Partial<BudgetCreateData>): Promise<Budget> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/budgets/${id}`, data);
    return response.data;
  },

  deleteBudget: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/finance/budgets/${id}`);
  },

  approveBudget: async (tenantId: number, id: number, approvedBy: number): Promise<Budget> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/budgets/${id}/approve`, null, {
      params: { approvedBy },
    });
    return response.data;
  },

  updateBudgetActual: async (tenantId: number, id: number): Promise<{ id: number; plannedAmount: number; actualAmount: number; remaining: number; utilizationPercentage: number }> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/finance/budgets/${id}/update-actual`);
    return response.data;
  },

  getBudgetSummary: async (
    tenantId: number,
    year?: number
  ): Promise<BudgetSummary> => {
    const response = await apiClient.get(`/tenants/${tenantId}/finance/budgets/summary`, {
      params: { year },
    });
    return response.data;
  },
};

export interface FinancialDashboard {
  spp: {
    total: number;
    paid: number;
    pending: number;
  };
  otherBills: {
    total: number;
    paid: number;
    pending: number;
  };
  savings: {
    deposits: number;
    withdrawals: number;
    net: number;
  };
  incomeExpense: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  overall: {
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
  };
}

export interface MonthlyTrend {
  month: string;
  monthNumber: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  income: Array<{ category: string; amount: number }>;
  expense: Array<{ category: string; amount: number }>;
}

export interface PaymentStatusSummary {
  spp: Array<{ status: string; count: number; total: number }>;
  otherBills: Array<{ status: string; count: number; total: number }>;
}

export interface PaymentReminder {
  id: number;
  type: 'spp' | 'other-bill';
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  title: string;
  amount: number;
  dueDate: string;
  isOverdue: boolean;
  daysUntilDue: number;
}

export interface PaymentReminders {
  upcoming: PaymentReminder[];
  overdue: PaymentReminder[];
  summary: {
    upcomingCount: number;
    overdueCount: number;
    upcomingTotal: number;
    overdueTotal: number;
  };
}

export interface ReminderSummary {
  totalReminders: number;
  overdueCount: number;
  upcomingCount: number;
  totalAmount: number;
}

export interface Budget {
  id: number;
  category: 'operational' | 'salary' | 'facility' | 'activity' | 'maintenance' | 'utilities' | 'supplies' | 'education' | 'infrastructure' | 'other';
  title: string;
  description?: string;
  plannedAmount: number;
  actualAmount: number;
  period: 'monthly' | 'quarterly' | 'semester' | 'yearly';
  periodValue: number;
  year: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  approvedBy?: number;
  approvedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCreateData {
  category: 'operational' | 'salary' | 'facility' | 'activity' | 'maintenance' | 'utilities' | 'supplies' | 'education' | 'infrastructure' | 'other';
  title: string;
  description?: string;
  plannedAmount: number;
  period: 'monthly' | 'quarterly' | 'semester' | 'yearly';
  periodValue: number;
  year: number;
  startDate: string;
  endDate: string;
  status?: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  utilizationPercentage: number;
  byCategory: Array<{
    category: string;
    planned: number;
    actual: number;
    remaining: number;
    utilizationPercentage: number;
  }>;
}

export interface Scholarship {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  scholarshipType: 'full' | 'partial' | 'tuition' | 'book' | 'uniform' | 'transport' | 'meal' | 'other';
  title: string;
  description?: string;
  amount?: number;
  percentage?: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'cancelled';
  sponsor?: string;
  requirements?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScholarshipCreateData {
  studentId: number;
  scholarshipType: 'full' | 'partial' | 'tuition' | 'book' | 'uniform' | 'transport' | 'meal' | 'other';
  title: string;
  description?: string;
  amount?: number;
  percentage?: number;
  startDate: string;
  endDate?: string;
  status?: 'active' | 'expired' | 'cancelled';
  sponsor?: string;
  requirements?: string;
  notes?: string;
}

export interface IncomeExpense {
  id: number;
  transactionType: 'income' | 'expense';
  category: string;
  title: string;
  description?: string;
  amount: number;
  transactionDate: string;
  referenceNumber?: string;
  vendor?: string;
  recipient?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeExpenseCreateData {
  transactionType: 'income' | 'expense';
  category: string;
  title: string;
  description?: string;
  amount: number;
  transactionDate: string;
  referenceNumber?: string;
  vendor?: string;
  recipient?: string;
  notes?: string;
}

export interface OtherBill {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  category: 'exam' | 'activity' | 'uniform' | 'book' | 'osis' | 'practicum' | 'field_trip' | 'graduation' | 'other';
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentReference?: string;
  notes?: string;
  receiptNumber?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OtherBillCreateData {
  studentId: number;
  category: 'exam' | 'activity' | 'uniform' | 'book' | 'osis' | 'practicum' | 'field_trip' | 'graduation' | 'other';
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  receiptNumber?: string;
}

export interface Savings {
  id: number;
  studentId: number;
  student?: {
    id: number;
    name: string;
  };
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  receiptNumber?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsCreateData {
  studentId: number;
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  receiptNumber?: string;
}

