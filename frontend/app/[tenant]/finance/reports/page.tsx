'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { financeApi, FinancialDashboard, MonthlyTrend, CategoryBreakdown, PaymentStatusSummary } from '@/lib/api/finance';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { ExportButton } from '@/components/ui/ExportButton';

export default function FinanceReportsPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['financial-dashboard', resolvedTenantId, dateRange],
    queryFn: () => financeApi.getFinancialDashboard(resolvedTenantId!, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['monthly-trends', resolvedTenantId],
    queryFn: () => financeApi.getMonthlyTrends(resolvedTenantId!, 12),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-breakdown', resolvedTenantId, dateRange],
    queryFn: () => financeApi.getCategoryBreakdown(resolvedTenantId!, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: paymentStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['payment-status', resolvedTenantId, dateRange],
    queryFn: () => financeApi.getPaymentStatusSummary(resolvedTenantId!, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting financial report to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (dashboardLoading || trendsLoading || categoryLoading || statusLoading) {
    return (
      <TenantLayout>
        <div className="text-center py-8">Memuat laporan keuangan...</div>
      </TenantLayout>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">Laporan Keuangan</h1>
          </div>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="laporan-keuangan" />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Periode:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">s/d</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Overall Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Pemasukan</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(dashboardData.overall.totalRevenue)}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 font-medium">Total Pengeluaran</div>
              <div className="text-2xl font-bold text-red-700 mt-1">
                {formatCurrency(dashboardData.overall.totalExpenses)}
              </div>
            </div>
            <div className={`border rounded-lg p-4 ${
              dashboardData.overall.netBalance >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className={`text-sm font-medium ${
                dashboardData.overall.netBalance >= 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                Saldo Bersih
              </div>
              <div className={`text-2xl font-bold mt-1 ${
                dashboardData.overall.netBalance >= 0 ? 'text-green-700' : 'text-orange-700'
              }`}>
                {formatCurrency(dashboardData.overall.netBalance)}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Tabungan Net</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                {formatCurrency(dashboardData.savings.net)}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* SPP Summary */}
          {dashboardData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rincian SPP</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tagihan:</span>
                  <span className="font-semibold">{formatCurrency(dashboardData.spp.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sudah Dibayar:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(dashboardData.spp.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Belum Dibayar:</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(dashboardData.spp.pending)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Tingkat Pembayaran:</span>
                    <span className="font-bold">
                      {dashboardData.spp.total > 0
                        ? ((dashboardData.spp.paid / dashboardData.spp.total) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Bills Summary */}
          {dashboardData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tagihan Lainnya</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tagihan:</span>
                  <span className="font-semibold">{formatCurrency(dashboardData.otherBills.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sudah Dibayar:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(dashboardData.otherBills.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Belum Dibayar:</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(dashboardData.otherBills.pending)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Tingkat Pembayaran:</span>
                    <span className="font-bold">
                      {dashboardData.otherBills.total > 0
                        ? ((dashboardData.otherBills.paid / dashboardData.otherBills.total) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trends Chart */}
        {monthlyTrends && monthlyTrends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trend Bulanan (12 Bulan Terakhir)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Bulan</th>
                    <th className="text-right py-2 px-4">Pemasukan</th>
                    <th className="text-right py-2 px-4">Pengeluaran</th>
                    <th className="text-right py-2 px-4">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((trend, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{trend.month}</td>
                      <td className="text-right py-2 px-4 text-green-600 font-medium">
                        {formatCurrency(trend.income)}
                      </td>
                      <td className="text-right py-2 px-4 text-red-600 font-medium">
                        {formatCurrency(trend.expense)}
                      </td>
                      <td className={`text-right py-2 px-4 font-semibold ${
                        trend.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(trend.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pemasukan per Kategori</h2>
              {categoryBreakdown.income.length > 0 ? (
                <div className="space-y-2">
                  {categoryBreakdown.income.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{item.category.replace('_', ' ')}</span>
                      <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada data pemasukan</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pengeluaran per Kategori</h2>
              {categoryBreakdown.expense.length > 0 ? (
                <div className="space-y-2">
                  {categoryBreakdown.expense.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{item.category.replace('_', ' ')}</span>
                      <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada data pengeluaran</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Status Summary */}
        {paymentStatus && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Status Pembayaran SPP</h2>
              {paymentStatus.spp.length > 0 ? (
                <div className="space-y-3">
                  {paymentStatus.spp.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{item.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span>
                        <span className="text-gray-500 text-sm ml-2">({item.count} pembayaran)</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada data</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Status Tagihan Lainnya</h2>
              {paymentStatus.otherBills.length > 0 ? (
                <div className="space-y-3">
                  {paymentStatus.otherBills.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{item.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span>
                        <span className="text-gray-500 text-sm ml-2">({item.count} tagihan)</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada data</p>
              )}
            </div>
          </div>
        )}
      </div>
    </TenantLayout>
  );
}

