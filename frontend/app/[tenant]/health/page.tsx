'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { healthApi, HealthRecord, HealthRecordCreateData } from '@/lib/api/health';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { studentsApi } from '@/lib/api/students';
import { useToastStore } from '@/lib/store/toast';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Activity, Thermometer, Scale, Ruler, FileText, Eye, Trash2, Plus, Edit, BarChart3 } from 'lucide-react';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { ExportButton } from '@/components/ui/ExportButton';

export default function HealthPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [filters, setFilters] = useState({
    studentId: '',
    healthStatus: 'all',
    startDate: '',
    endDate: '',
  });
  const getDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<HealthRecordCreateData>({
    studentId: 0,
    checkupDate: getDefaultDate(),
    healthStatus: 'healthy',
    height: undefined,
    weight: undefined,
    temperature: undefined,
    bloodPressure: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatistics, setShowStatistics] = useState(false);
  const limit = 20;

  const queryClient = useQueryClient();
  const { success, error: showError } = useToastStore();

  // Fetch students for dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!, { limit: 1000 }),
    enabled: !!tenantId,
  });

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['health-records', tenantId, filters, currentPage],
    queryFn: () =>
      healthApi.getAll(tenantId!, {
        studentId: filters.studentId ? Number(filters.studentId) : undefined,
        healthStatus: filters.healthStatus !== 'all' ? filters.healthStatus : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        limit,
      }),
    enabled: !!tenantId,
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['health-statistics', tenantId, filters.startDate, filters.endDate],
    queryFn: () =>
      healthApi.getStatistics(tenantId!, filters.startDate || undefined, filters.endDate || undefined),
    enabled: !!tenantId && showStatistics,
  });

  const createMutation = useMutation({
    mutationFn: (data: HealthRecordCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return healthApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Catatan kesehatan berhasil dibuat');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat catatan kesehatan';
      showError(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HealthRecordCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return healthApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', tenantId] });
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      resetForm();
      success('Catatan kesehatan berhasil diperbarui');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui catatan kesehatan';
      showError(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return healthApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', tenantId] });
      success('Catatan kesehatan berhasil dihapus');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus catatan kesehatan';
      showError(errorMessage);
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      checkupDate: getDefaultDate(),
      healthStatus: 'healthy',
      height: undefined,
      weight: undefined,
      temperature: undefined,
      bloodPressure: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      notes: '',
    });
    setSelectedRecord(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleView = (record: HealthRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEdit = (record: HealthRecord) => {
    setSelectedRecord(record);
    const formatDateLocal = (dateStr: string | undefined) => {
      if (!dateStr) return getDefaultDate();
      try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return getDefaultDate();
      }
    };
    setFormData({
      studentId: record.studentId,
      checkupDate: formatDateLocal(record.checkupDate),
      healthStatus: record.healthStatus as any,
      height: record.height,
      weight: record.weight,
      temperature: record.temperature,
      bloodPressure: record.bloodPressure || '',
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan kesehatan ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500 text-white';
      case 'sick':
        return 'bg-red-500 text-white';
      case 'recovering':
        return 'bg-yellow-500 text-white';
      case 'chronic':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Sehat';
      case 'sick':
        return 'Sakit';
      case 'recovering':
        return 'Pulih';
      case 'chronic':
        return 'Kronis';
      default:
        return status;
    }
  };

  const totalRecords = recordsData?.total || 0;
  const healthyCount = recordsData?.data?.filter((r) => r.healthStatus === 'healthy').length || 0;
  const sickCount = recordsData?.data?.filter((r) => r.healthStatus === 'sick').length || 0;
  const recoveringCount = recordsData?.data?.filter((r) => r.healthStatus === 'recovering').length || 0;
  const chronicCount = recordsData?.data?.filter((r) => r.healthStatus === 'chronic').length || 0;

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!recordsData?.data || recordsData.data.length === 0) {
      showError('Tidak ada data untuk diekspor');
      return;
    }

    try {
      // Prepare data for export
      const exportData = recordsData.data.map((record) => ({
        'Nama Siswa': record.student?.name || `ID: ${record.studentId}`,
        'Tanggal Pemeriksaan': formatDate(record.checkupDate),
        'Status Kesehatan': getStatusLabel(record.healthStatus),
        'Tinggi Badan (cm)': record.height || '-',
        'Berat Badan (kg)': record.weight || '-',
        'Suhu Tubuh (°C)': record.temperature || '-',
        'Tekanan Darah': record.bloodPressure || '-',
        'Gejala': record.symptoms || '-',
        'Diagnosis': record.diagnosis || '-',
        'Pengobatan': record.treatment || '-',
        'Catatan': record.notes || '-',
      }));

      if (format === 'csv') {
        // CSV Export
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map((row) =>
            headers.map((header) => {
              const value = row[header as keyof typeof row];
              return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            }).join(',')
          ),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `catatan-kesehatan-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        success('Data berhasil diekspor ke CSV');
      } else if (format === 'excel') {
        // Excel Export using export-import API
        const { exportImportApi } = await import('@/lib/api/export-import');
        await exportImportApi.exportExcel(
          {
            data: exportData,
            filename: `catatan-kesehatan-${new Date().toISOString().split('T')[0]}`,
            sheetName: 'Catatan Kesehatan',
          },
          tenantId?.toString(),
        );
        success('Data berhasil diekspor ke Excel');
      } else {
        showError('Format PDF belum tersedia');
      }
    } catch (error: any) {
      showError(error.message || 'Gagal mengekspor data');
    }
  };

  // Prepare chart data
  const statusChartData = statistics
    ? Object.entries(statistics.byStatus).map(([status, count]) => ({
        name: getStatusLabel(status),
        value: count,
      }))
    : [];

  const monthlyChartData = statistics?.monthlyTrends.map((item) => ({
    name: item.month,
    count: item.count,
  })) || [];

  const dailyChartData = statistics?.dailyTrends
    .slice()
    .reverse()
    .map((item) => ({
      name: formatDate(item.date),
      count: item.count,
    })) || [];

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Kesehatan
              </h1>
              <p className="text-gray-600">Manajemen catatan kesehatan siswa</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowStatistics(!showStatistics)}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <BarChart3 className="w-5 h-5 mr-2 inline" />
                {showStatistics ? 'Sembunyikan Statistik' : 'Tampilkan Statistik'}
              </Button>
              <ExportButton onExport={handleExport} filename="catatan-kesehatan" />
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Catatan Baru
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {showStatistics && (
          <div className="mb-8 space-y-6">
            {statsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat statistik...</p>
              </div>
            ) : statistics ? (
              <>
                {/* Status Distribution Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Distribusi Status Kesehatan</h3>
                  <div className="h-80">
                    <PieChartComponent
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      height={320}
                    />
                  </div>
                </div>

                {/* Monthly Trends */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trend Bulanan</h3>
                  <div className="h-80">
                    <BarChartComponent
                      data={monthlyChartData}
                      dataKey="count"
                      bars={[{ key: 'count', name: 'Jumlah Catatan', color: '#3b82f6' }]}
                      height={320}
                    />
                  </div>
                </div>

                {/* Daily Trends */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trend Harian (30 Hari Terakhir)</h3>
                  <div className="h-80">
                    <LineChartComponent
                      data={dailyChartData}
                      dataKey="count"
                      lines={[{ key: 'count', name: 'Jumlah Catatan', color: '#10b981' }]}
                      height={320}
                    />
                  </div>
                </div>

                {/* BMI Statistics */}
                {statistics.bmiStats && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Statistik BMI</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Rata-rata</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {statistics.bmiStats.avg.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Minimum</p>
                        <p className="text-2xl font-bold text-green-600">
                          {statistics.bmiStats.min.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Maksimum</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {statistics.bmiStats.max.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Catatan</p>
                <p className="text-3xl font-bold text-blue-600">{totalRecords}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sehat</p>
                <p className="text-3xl font-bold text-green-600">{healthyCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sakit</p>
                <p className="text-3xl font-bold text-red-600">{sickCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pulih</p>
                <p className="text-3xl font-bold text-yellow-600">{recoveringCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
              <select
                value={filters.studentId}
                onChange={(e) => {
                  setFilters({ ...filters, studentId: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
              <select
                value={filters.healthStatus}
                onChange={(e) => {
                  setFilters({ ...filters, healthStatus: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="healthy">Sehat</option>
                <option value="sick">Sakit</option>
                <option value="recovering">Pulih</option>
                <option value="chronic">Kronis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-gray-700">Siswa</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Pemeriksaan</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tinggi (cm)</TableHead>
                    <TableHead className="font-semibold text-gray-700">Berat (kg)</TableHead>
                    <TableHead className="font-semibold text-gray-700">Suhu (°C)</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsData?.data?.map((record) => (
                    <TableRow key={record.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <button
                          onClick={() => router.push(`/${params.tenant as string}/health/${record.studentId}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {record.student?.name || `ID: ${record.studentId}`}
                        </button>
                      </TableCell>
                      <TableCell>{formatDate(record.checkupDate)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(record.healthStatus)}`}>
                          {getStatusLabel(record.healthStatus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {record.height ? `${record.height} cm` : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {record.weight ? `${record.weight} kg` : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {record.temperature ? `${record.temperature}°C` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(record)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recordsData?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Heart className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada catatan kesehatan</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {recordsData && recordsData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, recordsData.total)} dari {recordsData.total}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(recordsData.totalPages, p + 1))}
                    disabled={currentPage === recordsData.totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Catatan Kesehatan Baru"
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tenantId) {
                showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                return;
              }
              const submitData = {
                ...formData,
                checkupDate: formData.checkupDate ? new Date(formData.checkupDate).toISOString() : '',
              };
              createMutation.mutate(submitData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="0">Pilih Siswa</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pemeriksaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkupDate}
                  onChange={(e) => setFormData({ ...formData, checkupDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Kesehatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="healthy">Sehat</option>
                  <option value="sick">Sakit</option>
                  <option value="recovering">Pulih</option>
                  <option value="chronic">Kronis</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 165.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 55.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 36.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tekanan Darah</label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gejala</label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan gejala yang dialami..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan diagnosis..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengobatan</label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan pengobatan yang diberikan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan..."
              />
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
              <Button type="submit" loading={createMutation.isPending}>
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
            setSelectedRecord(null);
          }}
          title="Edit Catatan Kesehatan"
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tenantId || !selectedRecord) {
                showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                return;
              }
              const submitData = {
                ...formData,
                checkupDate: formData.checkupDate ? new Date(formData.checkupDate).toISOString() : undefined,
              };
              updateMutation.mutate({ id: selectedRecord.id, data: submitData });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="0">Pilih Siswa</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pemeriksaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkupDate}
                  onChange={(e) => setFormData({ ...formData, checkupDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Kesehatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="healthy">Sehat</option>
                  <option value="sick">Sakit</option>
                  <option value="recovering">Pulih</option>
                  <option value="chronic">Kronis</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 165.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 55.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 36.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tekanan Darah</label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gejala</label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan gejala yang dialami..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan diagnosis..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengobatan</label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan pengobatan yang diberikan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                  setSelectedRecord(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRecord(null);
          }}
          title="Detail Catatan Kesehatan"
          size="lg"
        >
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
                  <p className="text-gray-900 font-medium">
                    {selectedRecord.student?.name || `ID: ${selectedRecord.studentId}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pemeriksaan</label>
                  <p className="text-gray-900">{formatDate(selectedRecord.checkupDate)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(selectedRecord.healthStatus)}`}>
                  {getStatusLabel(selectedRecord.healthStatus)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Badan</label>
                  <p className="text-gray-900">{selectedRecord.height ? `${selectedRecord.height} cm` : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan</label>
                  <p className="text-gray-900">{selectedRecord.weight ? `${selectedRecord.weight} kg` : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh</label>
                  <p className="text-gray-900">{selectedRecord.temperature ? `${selectedRecord.temperature}°C` : '-'}</p>
                </div>
              </div>

              {selectedRecord.bloodPressure && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tekanan Darah</label>
                  <p className="text-gray-900">{selectedRecord.bloodPressure}</p>
                </div>
              )}

              {selectedRecord.symptoms && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gejala</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.diagnosis && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengobatan</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedRecord(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}

