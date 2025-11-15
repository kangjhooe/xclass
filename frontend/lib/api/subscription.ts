import { apiClient } from './client';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  minStudents: number;
  maxStudents?: number;
  pricePerStudentPerYear: number;
  billingThreshold: number;
  isFree: boolean;
  isActive: boolean;
  sortOrder: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum BillingCycle {
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
}

export interface TenantSubscription {
  id: number;
  tenantId: number;
  subscriptionPlanId: number;
  subscriptionPlan?: SubscriptionPlan;
  studentCountAtBilling: number;
  currentStudentCount: number;
  pendingStudentIncrease: number;
  currentBillingAmount: number;
  nextBillingAmount: number;
  lockedPricePerStudent?: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  lastBillingDate?: Date;
  isPaid: boolean;
  paidAt?: Date;
  paymentNotes?: string;
  notes?: string;
  // Trial fields
  isTrial?: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  // Warning fields
  warningSent?: boolean;
  warningSentAt?: Date;
  // Grace period
  gracePeriodEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionBillingHistory {
  id: number;
  tenantSubscriptionId: number;
  tenantId: number;
  studentCount: number;
  previousStudentCount?: number;
  billingAmount: number;
  previousBillingAmount?: number;
  billingType: string;
  pendingIncreaseBefore: number;
  pendingIncreaseAfter: number;
  thresholdTriggered: boolean;
  billingDate: Date;
  periodStart: Date;
  periodEnd: Date;
  isPaid: boolean;
  paidAt?: Date;
  invoiceNumber?: string;
  paymentNotes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionListResponse {
  data: TenantSubscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BillingHistoryResponse {
  data: SubscriptionBillingHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const subscriptionApi = {
  // Plans
  getAllPlans: () => {
    return apiClient.get<SubscriptionPlan[]>('/admin/subscriptions/plans');
  },

  getPlan: (id: number) => {
    return apiClient.get<SubscriptionPlan>(`/admin/subscriptions/plans/${id}`);
  },

  createPlan: (data: Partial<SubscriptionPlan>) => {
    return apiClient.post<SubscriptionPlan>(
      '/admin/subscriptions/plans',
      data,
    );
  },

  updatePlan: (id: number, data: Partial<SubscriptionPlan>) => {
    return apiClient.put<SubscriptionPlan>(
      `/admin/subscriptions/plans/${id}`,
      data,
    );
  },

  deletePlan: (id: number) => {
    return apiClient.delete(`/admin/subscriptions/plans/${id}`);
  },

  // Subscriptions
  getAllSubscriptions: (params?: {
    page?: number;
    limit?: number;
    status?: SubscriptionStatus;
  }) => {
    return apiClient.get<SubscriptionListResponse>(
      '/admin/subscriptions',
      { params },
    );
  },

  getTenantSubscription: (tenantId: number) => {
    return apiClient.get<TenantSubscription>(
      `/admin/subscriptions/tenants/${tenantId}`,
    );
  },

  createSubscription: (
    tenantId: number,
    data: {
      subscriptionPlanId: number;
      startDate: string;
      endDate: string;
    },
  ) => {
    return apiClient.post<TenantSubscription>(
      `/admin/subscriptions/tenants/${tenantId}`,
      data,
    );
  },

  updateSubscription: (
    tenantId: number,
    data: Partial<TenantSubscription>,
  ) => {
    return apiClient.put<TenantSubscription>(
      `/admin/subscriptions/tenants/${tenantId}`,
      data,
    );
  },

  changePlan: (tenantId: number, newPlanId: number) => {
    return apiClient.post(
      `/admin/subscriptions/tenants/${tenantId}/change-plan`,
      { newPlanId },
    );
  },

  updateStudentCount: (tenantId: number, studentCount: number) => {
    return apiClient.post(
      `/admin/subscriptions/tenants/${tenantId}/update-student-count`,
      { studentCount },
    );
  },

  suspendSubscription: (tenantId: number) => {
    return apiClient.post(
      `/admin/subscriptions/tenants/${tenantId}/suspend`,
    );
  },

  activateSubscription: (tenantId: number) => {
    return apiClient.post(
      `/admin/subscriptions/tenants/${tenantId}/activate`,
    );
  },

  cancelSubscription: (tenantId: number) => {
    return apiClient.post(
      `/admin/subscriptions/tenants/${tenantId}/cancel`,
    );
  },

  markAsPaid: (tenantId: number, paidAt?: string) => {
    return apiClient.post(`/admin/subscriptions/tenants/${tenantId}/mark-paid`, {
      paidAt,
    });
  },

  getBillingHistory: (tenantId: number, params?: { page?: number; limit?: number }) => {
    return apiClient.get<BillingHistoryResponse>(
      `/admin/subscriptions/tenants/${tenantId}/billing-history`,
      { params },
    );
  },

  getExpiringSubscriptions: (days?: number) => {
    return apiClient.get<TenantSubscription[]>(
      '/admin/subscriptions/expiring',
      { params: { days } },
    );
  },

  // Maintenance tasks
  checkTrials: () => {
    return apiClient.post('/admin/subscriptions/maintenance/check-trials');
  },

  checkWarnings: () => {
    return apiClient.post('/admin/subscriptions/maintenance/check-warnings');
  },

  checkExpired: () => {
    return apiClient.post('/admin/subscriptions/maintenance/check-expired');
  },

  runAllMaintenance: () => {
    return apiClient.post('/admin/subscriptions/maintenance/run-all');
  },

  // Additional methods
  resetWarning: (tenantId: number) => {
    return apiClient.post(`/admin/subscriptions/tenants/${tenantId}/reset-warning`);
  },

  getSubscriptionDetails: (tenantId: number) => {
    return apiClient.get<TenantSubscription & {
      computed: {
        isInTrial: boolean;
        isEndingSoon: boolean;
        daysUntilEnd: number;
        effectiveEndDate?: Date;
        needsWarning: boolean;
        inGracePeriod: boolean;
      };
    }>(`/admin/subscriptions/tenants/${tenantId}/details`);
  },

  // Payment Gateway
  createPayment: (
    tenantId: number,
    data: {
      paymentMethod: 'qris' | 'virtual_account' | 'e_wallet';
      amount: number;
      bankCode?: string; // For Virtual Account: BCA, BNI, BRI, MANDIRI, PERMATA
      channelCode?: string; // For E-Wallet: OVO, DANA, LINKAJA, SHOPEEPAY
    },
  ) => {
    return apiClient.post(
      `/subscriptions/tenants/${tenantId}/payment`,
      data,
    );
  },

  getPaymentStatus: (tenantId: number, transactionId: number) => {
    return apiClient.get(
      `/subscriptions/tenants/${tenantId}/payment/${transactionId}`,
    );
  },
};

