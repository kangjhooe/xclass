'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { financeApi, Budget, BudgetCreateData, BudgetSummary } from '@/lib/api/finance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';
import { formatDate } from '@/lib/utils/date';

const BUDGET_CATEGORIES = [
  { value: 'operational', label: 'Operasional' },
  { value: 'salary', label: 'Gaji' },
  { value: 'facility', label: 'Fasilitas' },
  { value: 'activity', label: 'Kegiatan' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Listrik, Air, Internet' },
  { value: 'supplies', label: 'Perlengkapan' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'infrastructure', label: 'Infrastruktur' },
  { value: 'other', label: 'Lainnya' },
];

const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Bulanan' },
  { value: 'quarterly', label: 'Triwulan' },
  { value: 'semester', label: 'Semester' },
  { value: 'yearly', label: 'Tahunan' },
];

const BUDGET_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function BudgetPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState<BudgetCreateData>({
    category: 'operational',
    title: '',
    description: '',
    plannedAmount: 0,
    period: 'monthly',
    periodValue: 1,
    year: new Date().getFullYear(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets', resolvedTenantId, currentPage, filterYear, filterStatus],
    queryFn: () => financeApi.getAllBudgets(resolvedTenantId!, {
      year: filterYear,
      status: filterStatus || undefined,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: budgetSummary } = useQuery({
    queryKey: ['budget-summary', resolvedTenantId, filterYear],
    queryFn: () => financeApi.getBudgetSummary(resolvedTenantId!, filterYear),
    enabled: resolvedTenantId !== undefined,
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createBudget(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BudgetCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateBudget(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteBudget(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      alert('Anggaran berhasil dihapus');
    },
    onError: (error: any) => {
      alert(`Error: ${error?.response?.data?.message || 'Gagal menghapus anggaran'}`);
    },
  });

  const approveBudgetMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      if (!user?.id) {
        throw new Error('User ID tidak tersedia. Silakan login ulang.');
      }
      return financeApi.approveBudget(resolvedTenantId, id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      alert('Anggaran berhasil disetujui');
    },
    onError: (error: any) => {
      alert(`Error: ${error?.response?.data?.message || 'Gagal menyetujui anggaran'}`);
    },
  });

  const updateActualMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateBudgetActual(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      category: 'operational',
      title: '',
      description: '',
      plannedAmount: 0,
      period: 'monthly',
      periodValue: 1,
      year: new Date().getFullYear(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
    });
    setSelectedBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      title: budget.title,
      description: budget.description || '',
      plannedAmount: budget.plannedAmount,
      period: budget.period,
      periodValue: budget.periodValue,
      year: budget.year,
      startDate: budget.startDate,
      endDate: budget.endDate,
      status: budget.status,
      notes: budget.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }

    // Validasi tanggal
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('Tanggal berakhir harus setelah tanggal mulai!');
      return;
    }

    // Validasi jumlah
    if (formData.plannedAmount <= 0) {
      alert('Jumlah anggaran harus lebih dari 0!');
      return;
    }

    if (selectedBudget) {
      updateBudgetMutation.mutate(
        { id: selectedBudget.id, data: formData },
        {
          onError: (error: any) => {
            alert(`Error: ${error?.response?.data?.message || 'Gagal update anggaran'}`);
          },
        }
      );
    } else {
      createBudgetMutation.mutate(formData, {
        onError: (error: any) => {
          alert(`Error: ${error?.response?.data?.message || 'Gagal membuat anggaran'}`);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
      deleteBudgetMutation.mutate(id);
    }
  };

  const handleApprove = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menyetujui anggaran ini?')) {
      approveBudgetMutation.mutate(id);
    }
  };

  const handleUpdateActual = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Update actual amount dari transaksi pengeluaran yang sesuai?')) {
      updateActualMutation.mutate(id, {
        onSuccess: (data) => {
          alert(`Actual amount berhasil diupdate. Utilisasi: ${data.utilizationPercentage.toFixed(1)}%`);
        },
        onError: (error: any) => {
          alert(`Error: ${error?.response?.data?.message || 'Gagal update actual amount'}`);
        },
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return BUDGET_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getPeriodLabel = (period: string, periodValue: number) => {
    const periodLabel = BUDGET_PERIODS.find(p => p.value === period)?.label || period;
    return `${periodLabel} ${periodValue}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      approved: { label: 'Disetujui', className: 'bg-blue-100 text-blue-800' },
      active: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Selesai', className: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || statusMap.draft;
  };

  const totalPages = budgetsData ? Math.ceil((budgetsData.total || 0) / itemsPerPage) : 1;
  const paginatedData = budgetsData?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  return (
    <TenantLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/${tenantId}/finance`)}
            >
              ← Kembali
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Perencanaan Anggaran</h1>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Tambah Anggaran
          </Button>
        </div>

        {/* Summary Cards */}
        {budgetSummary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Anggaran</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(budgetSummary.totalPlanned)}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Total Aktual</div>
                <div className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(budgetSummary.totalActual)}
                </div>
              </div>
              <div className={`border rounded-lg p-4 ${
                budgetSummary.totalRemaining < 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className={`text-sm font-medium ${
                  budgetSummary.totalRemaining < 0 ? 'text-red-600' : 'text-purple-600'
                }`}>
                  Sisa Anggaran
                </div>
                <div className={`text-2xl font-bold mt-1 ${
                  budgetSummary.totalRemaining < 0 ? 'text-red-700' : 'text-purple-700'
                }`}>
                  {formatCurrency(budgetSummary.totalRemaining)}
                </div>
              </div>
              <div className={`border rounded-lg p-4 ${
                budgetSummary.utilizationPercentage > 100
                  ? 'bg-red-50 border-red-200'
                  : budgetSummary.utilizationPercentage > 80
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className={`text-sm font-medium ${
                  budgetSummary.utilizationPercentage > 100
                    ? 'text-red-600'
                    : budgetSummary.utilizationPercentage > 80
                    ? 'text-orange-600'
                    : 'text-orange-600'
                }`}>
                  Utilisasi
                </div>
                <div className={`text-2xl font-bold mt-1 ${
                  budgetSummary.utilizationPercentage > 100
                    ? 'text-red-700'
                    : budgetSummary.utilizationPercentage > 80
                    ? 'text-orange-700'
                    : 'text-orange-700'
                }`}>
                  {budgetSummary.utilizationPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Breakdown by Category */}
            {budgetSummary.byCategory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Breakdown per Kategori</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetSummary.byCategory.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-2">
                        {getCategoryLabel(item.category)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Anggaran:</span>
                          <span className="font-medium">{formatCurrency(item.planned)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aktual:</span>
                          <span className={`font-medium ${
                            item.actual > item.planned ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(item.actual)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sisa:</span>
                          <span className={`font-medium ${
                            item.remaining < 0 ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {formatCurrency(item.remaining)}
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Utilisasi:</span>
                            <span className={`font-bold ${
                              item.utilizationPercentage > 100
                                ? 'text-red-600'
                                : item.utilizationPercentage > 80
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {item.utilizationPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                item.utilizationPercentage > 100
                                  ? 'bg-red-500'
                                  : item.utilizationPercentage > 80
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(item.utilizationPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Tahun:</label>
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              {BUDGET_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Table */}
        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Anggaran</TableHead>
                    <TableHead>Aktual</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Utilisasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((budget: Budget) => {
                    const remaining = budget.plannedAmount - budget.actualAmount;
                    const utilization = budget.plannedAmount > 0
                      ? (budget.actualAmount / budget.plannedAmount) * 100
                      : 0;
                    const statusBadge = getStatusBadge(budget.status);

                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.title}</TableCell>
                        <TableCell>{getCategoryLabel(budget.category)}</TableCell>
                        <TableCell>{getPeriodLabel(budget.period, budget.periodValue)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(budget.plannedAmount)}
                        </TableCell>
                        <TableCell className={budget.actualAmount > budget.plannedAmount ? 'text-red-600 font-semibold' : 'font-semibold'}>
                          {formatCurrency(budget.actualAmount)}
                        </TableCell>
                        <TableCell className={remaining < 0 ? 'text-red-600 font-semibold' : remaining < budget.plannedAmount * 0.1 ? 'text-orange-600 font-semibold' : 'font-semibold'}>
                          {formatCurrency(remaining)}
                          {remaining < 0 && (
                            <span className="ml-1 text-xs">⚠️ Over budget</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  utilization > 100 ? 'bg-red-500' :
                                  utilization > 80 ? 'bg-orange-500' :
                                  utilization > 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              utilization > 100 ? 'text-red-600' :
                              utilization > 80 ? 'text-orange-600' :
                              'text-gray-700'
                            }`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                            >
                              Edit
                            </Button>
                            {budget.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(budget.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                loading={approveBudgetMutation.isPending}
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateActual(budget.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              loading={updateActualMutation.isPending}
                              title="Update actual amount dari transaksi pengeluaran"
                            >
                              Update Aktual
                            </Button>
                            {budget.status !== 'completed' && budget.status !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(budget.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                loading={deleteBudgetMutation.isPending}
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Tidak ada data anggaran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {budgetsData && budgetsData.total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={budgetsData.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Budget Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Anggaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Anggaran Operasional Bulan Januari"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {BUDGET_PERIODS.map((period) => (
                      <option key={period.value} value={period.value}>{period.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Periode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.periodValue}
                    onChange={(e) => setFormData({ ...formData, periodValue: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BUDGET_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Anggaran (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.plannedAmount}
                  onChange={(e) => setFormData({ ...formData, plannedAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  required
                />
                {formData.plannedAmount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(formData.plannedAmount)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi anggaran (opsional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
              >
                {selectedBudget ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

