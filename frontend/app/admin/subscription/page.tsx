'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  subscriptionApi,
  SubscriptionPlan,
  TenantSubscription,
  SubscriptionStatus,
} from '@/lib/api/subscription';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loading } from '@/components/ui/Loading';
import { formatDate } from '@/lib/utils/date';
import { PaymentGatewayModal } from '@/components/subscription/PaymentGatewayModal';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('subscriptions');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [planFormData, setPlanFormData] = useState<Partial<SubscriptionPlan>>({});
  const [subscriptionFormData, setSubscriptionFormData] = useState<any>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSubscriptionForPayment, setSelectedSubscriptionForPayment] = useState<TenantSubscription | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'plans') {
        const response = await subscriptionApi.getAllPlans();
        setPlans(response.data);
      } else {
        const [subsRes, tenantsRes] = await Promise.all([
          subscriptionApi.getAllSubscriptions({
            page: pagination.page,
            limit: pagination.limit,
          }),
          adminApi.getAllTenants(),
        ]);
        setSubscriptions(subsRes.data.data);
        setTenants(tenantsRes.data.data);
        setPagination({
          page: subsRes.data.page,
          limit: subsRes.data.limit,
          total: subsRes.data.total,
          totalPages: subsRes.data.totalPages,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormData({});
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanFormData(plan);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, planFormData);
      } else {
        await subscriptionApi.createPlan(planFormData);
      }
      setIsPlanModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Gagal menyimpan plan');
    }
  };

  const handleCreateSubscription = () => {
    setSelectedTenantId(null);
    setSubscriptionFormData({});
    setIsSubscriptionModalOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedTenantId) {
      alert('Pilih tenant terlebih dahulu');
      return;
    }
    try {
      await subscriptionApi.createSubscription(selectedTenantId, {
        subscriptionPlanId: subscriptionFormData.subscriptionPlanId,
        startDate: subscriptionFormData.startDate,
        endDate: subscriptionFormData.endDate,
      });
      setIsSubscriptionModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Gagal membuat subscription');
    }
  };

  const handleChangePlan = async (tenantId: number, newPlanId: number) => {
    if (!confirm('Yakin ingin mengubah plan?')) return;
    try {
      await subscriptionApi.changePlan(tenantId, newPlanId);
      loadData();
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('Gagal mengubah plan');
    }
  };

  const handleSuspend = async (tenantId: number) => {
    if (!confirm('Yakin ingin menangguhkan subscription?')) return;
    try {
      await subscriptionApi.suspendSubscription(tenantId);
      loadData();
    } catch (error) {
      console.error('Error suspending subscription:', error);
      alert('Gagal menangguhkan subscription');
    }
  };

  const handleActivate = async (tenantId: number) => {
    try {
      await subscriptionApi.activateSubscription(tenantId);
      loadData();
    } catch (error) {
      console.error('Error activating subscription:', error);
      alert('Gagal mengaktifkan subscription');
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.SUSPENDED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Subscription Management
            </h1>
            <div className="flex gap-2">
              {activeTab === 'plans' ? (
                <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Plan
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={async () => {
                      try {
                        await subscriptionApi.runAllMaintenance();
                        alert('Maintenance tasks completed');
                        loadData();
                      } catch (error) {
                        console.error('Error running maintenance:', error);
                        alert('Gagal menjalankan maintenance tasks');
                      }
                    }}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Run Maintenance
                  </Button>
                  <Button onClick={handleCreateSubscription} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Subscription
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-600">Kelola paket langganan dan subscription tenant</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'subscriptions'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Plans
            </button>
          </div>
        </div>

        {activeTab === 'plans' ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {plan.name}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <strong>Harga:</strong> Rp{' '}
                        {plan.pricePerStudentPerYear.toLocaleString('id-ID')} /
                        siswa / tahun
                      </p>
                      <p>
                        <strong>Siswa:</strong> {plan.minStudents} -{' '}
                        {plan.maxStudents || 'Unlimited'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {plan.isActive ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((sub) => {
                    const tenant = tenants.find((t) => t.id === sub.tenantId);
                    const effectiveEndDate = sub.isTrial && sub.trialEndDate ? sub.trialEndDate : sub.endDate;
                    const daysUntilEnd = effectiveEndDate 
                      ? Math.ceil((new Date(effectiveEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    const isEndingSoon = daysUntilEnd <= 7 && daysUntilEnd > 0;
                    const needsWarning = isEndingSoon && !sub.warningSent;
                    
                    return (
                      <>
                        {needsWarning && (
                          <tr className="bg-yellow-50 border-yellow-200">
                            <td colSpan={7} className="px-6 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="text-sm font-semibold text-yellow-800">
                                    {tenant?.name || 'Tenant'} - {sub.isTrial ? 'Trial' : 'Subscription'} akan berakhir dalam {daysUntilEnd} hari
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      await subscriptionApi.resetWarning(sub.tenantId);
                                      await subscriptionApi.checkWarnings();
                                      loadData();
                                    } catch (error) {
                                      console.error('Error resetting warning:', error);
                                    }
                                  }}
                                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                                >
                                  Kirim Ulang Warning
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr key={sub.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {tenant?.name || '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tenant?.npsn || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.subscriptionPlan?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                                sub.status === SubscriptionStatus.ACTIVE
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                  : sub.status === SubscriptionStatus.EXPIRED
                                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                              }`}
                            >
                              {sub.status}
                            </span>
                            {sub.isTrial && sub.trialEndDate && new Date(sub.trialEndDate) > new Date() && (
                              <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Trial
                              </span>
                            )}
                            {sub.warningSent && (
                              <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Warning Sent
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium">{sub.currentStudentCount}</div>
                            {sub.lockedPricePerStudent && (
                              <div className="text-xs text-gray-400">
                                @ Rp {sub.lockedPricePerStudent.toLocaleString('id-ID')}/siswa
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {sub.isTrial ? (
                              <div>
                                <div className="text-green-600 font-semibold">GRATIS (Trial)</div>
                                <div className="text-xs text-gray-400">
                                  Setelah trial: Rp {sub.nextBillingAmount.toLocaleString('id-ID')}
                                </div>
                              </div>
                            ) : (
                              <div className="font-medium">
                                Rp {sub.nextBillingAmount.toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {sub.isTrial && sub.trialEndDate ? (
                              <div>
                                <div className="font-medium text-blue-600">
                                  Trial: {formatDate(sub.trialEndDate)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Billing: {formatDate(sub.endDate)}
                                </div>
                              </div>
                            ) : (
                              formatDate(sub.endDate)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {!sub.isPaid && sub.nextBillingAmount > 0 && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscriptionForPayment(sub);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                              >
                                Bayar
                              </Button>
                            )}
                            {sub.status === SubscriptionStatus.ACTIVE ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuspend(sub.tenantId)}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivate(sub.tenantId)}
                              >
                                Activate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 flex justify-between items-center">
                <div className="text-sm text-gray-700 font-medium">
                  Menampilkan <span className="font-bold text-blue-600">{subscriptions.length}</span> dari <span className="font-bold text-purple-600">{pagination.total}</span> subscription
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    className="disabled:opacity-50"
                  >
                    Sebelumnya
                  </Button>
                  <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    className="disabled:opacity-50"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Plan Modal */}
        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          title={editingPlan ? 'Edit Plan' : 'Tambah Plan'}
        >
          <div className="space-y-4">
            <Input
              label="Nama"
              value={planFormData.name || ''}
              onChange={(e) =>
                setPlanFormData({ ...planFormData, name: e.target.value })
              }
              required
            />
            <Input
              label="Slug"
              value={planFormData.slug || ''}
              onChange={(e) =>
                setPlanFormData({ ...planFormData, slug: e.target.value })
              }
              required
            />
            <Textarea
              label="Deskripsi"
              value={planFormData.description || ''}
              onChange={(e) =>
                setPlanFormData({ ...planFormData, description: e.target.value })
              }
            />
            <Input
              label="Min Siswa"
              type="number"
              value={planFormData.minStudents || 0}
              onChange={(e) =>
                setPlanFormData({
                  ...planFormData,
                  minStudents: Number(e.target.value),
                })
              }
            />
            <Input
              label="Max Siswa (kosongkan untuk unlimited)"
              type="number"
              value={planFormData.maxStudents || ''}
              onChange={(e) =>
                setPlanFormData({
                  ...planFormData,
                  maxStudents: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              label="Harga per Siswa per Tahun"
              type="number"
              value={planFormData.pricePerStudentPerYear || 0}
              onChange={(e) =>
                setPlanFormData({
                  ...planFormData,
                  pricePerStudentPerYear: Number(e.target.value),
                })
              }
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={planFormData.isFree || false}
                onChange={(e) =>
                  setPlanFormData({ ...planFormData, isFree: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Gratis</label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSavePlan}>Simpan</Button>
            </div>
          </div>
        </Modal>

        {/* Subscription Modal */}
        <Modal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          title="Tambah Subscription"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant
              </label>
              <select
                value={selectedTenantId || ''}
                onChange={(e) => setSelectedTenantId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Pilih Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.npsn})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>
              <select
                value={subscriptionFormData.subscriptionPlanId || ''}
                onChange={(e) =>
                  setSubscriptionFormData({
                    ...subscriptionFormData,
                    subscriptionPlanId: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Pilih Plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Tanggal Mulai"
              type="date"
              value={subscriptionFormData.startDate || ''}
              onChange={(e) =>
                setSubscriptionFormData({
                  ...subscriptionFormData,
                  startDate: e.target.value,
                })
              }
              required
            />
            <Input
              label="Tanggal Berakhir"
              type="date"
              value={subscriptionFormData.endDate || ''}
              onChange={(e) =>
                setSubscriptionFormData({
                  ...subscriptionFormData,
                  endDate: e.target.value,
                })
              }
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSubscriptionModalOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSaveSubscription}>Simpan</Button>
            </div>
          </div>
        </Modal>

        {/* Payment Gateway Modal */}
        {selectedSubscriptionForPayment && (
          <PaymentGatewayModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedSubscriptionForPayment(null);
            }}
            tenantId={selectedSubscriptionForPayment.tenantId}
            amount={selectedSubscriptionForPayment.nextBillingAmount || selectedSubscriptionForPayment.currentBillingAmount}
            onPaymentSuccess={() => {
              loadData();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

