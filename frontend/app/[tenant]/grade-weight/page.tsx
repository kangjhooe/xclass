'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExportButton } from '@/components/ui/ExportButton';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  ModuleCard,
  ModuleEmptyState,
  ModuleHeader,
  ModuleLoadingState,
  ModulePage,
  ModuleSection,
  ModuleStatCard,
  ModuleStatsGrid,
} from '@/components/ui/module';
import { gradeWeightApi, GradeWeight, GradeWeightCreateData } from '@/lib/api/grade-weight';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function GradeWeightPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGradeWeight, setSelectedGradeWeight] = useState<GradeWeight | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<GradeWeightCreateData>({
    assignmentType: '',
    assignmentLabel: '',
    weightPercentage: 0,
    isActive: true,
  });
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['grade-weights', tenantId],
    queryFn: () => gradeWeightApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: GradeWeightCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradeWeightApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-weights', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Bobot nilai berhasil ditambahkan');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Gagal menambahkan bobot nilai';
      showError(errorMessage);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradeWeightApi.toggleActive(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-weights', tenantId] });
      success('Status bobot nilai berhasil diubah');
    },
    onError: () => {
      showError('Gagal mengubah status bobot nilai');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradeWeightApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-weights', tenantId] });
      success('Bobot nilai berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus bobot nilai');
    },
  });

  const resetForm = () => {
    setFormData({
      assignmentType: '',
      assignmentLabel: '',
      weightPercentage: 0,
      isActive: true,
    });
    setSelectedGradeWeight(null);
  };

  const handleEdit = (gradeWeight: GradeWeight) => {
    setSelectedGradeWeight(gradeWeight);
    setFormData({
      assignmentType: gradeWeight.assignmentType,
      assignmentLabel: gradeWeight.assignmentLabel,
      weightPercentage: gradeWeight.weightPercentage,
      isActive: gradeWeight.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    // Calculate total weight of active items (excluding current item if editing)
    const activeWeights = data?.filter((item) => {
      if (selectedGradeWeight && item.id === selectedGradeWeight.id) {
        return false; // Exclude current item when editing
      }
      return item.isActive;
    }) || [];

    const currentTotal = activeWeights.reduce(
      (sum, item) => sum + item.weightPercentage,
      0,
    );

    if (currentTotal + formData.weightPercentage > 100) {
      showError(
        `Total bobot tidak boleh melebihi 100%. Total saat ini: ${currentTotal}%, bobot baru: ${formData.weightPercentage}%`,
      );
      return;
    }

    if (selectedGradeWeight) {
      // For update, we need to check if the new total exceeds 100
      const newTotal = currentTotal - selectedGradeWeight.weightPercentage + formData.weightPercentage;
      if (newTotal > 100) {
        showError(
          `Total bobot tidak boleh melebihi 100%. Total setelah update: ${newTotal}%`,
        );
        return;
      }
      // Note: The API doesn't have an update endpoint, so we'll need to delete and recreate
      // For now, we'll just show an error
      showError('Fitur edit belum tersedia. Silakan hapus dan buat ulang.');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleToggleActive = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    toggleActiveMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus bobot nilai ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`Exporting to ${format}...`);
    success(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const filteredData =
    data?.filter(
      (item) =>
        item.assignmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignmentLabel.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const totalActiveWeight =
    data?.filter((item) => item.isActive).reduce((sum, item) => sum + item.weightPercentage, 0) ?? 0;
  const activeFilteredCount = filteredData.filter((item) => item.isActive).length;
  const totalWeight = totalActiveWeight;

  return (
    <TenantLayout>
      <ModulePage variant="amber">
        <ModuleHeader
          title="Bobot Nilai"
          description="Atur proporsi penilaian agar evaluasi siswa lebih seimbang dan transparan."
          variant="amber"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
            </svg>
          }
          actions={
            <>
              <ExportButton onExport={handleExport} filename="grade-weights" />
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                Tambah Bobot Nilai
              </Button>
            </>
          }
        />

        <ModuleStatsGrid>
          <ModuleStatCard
            label="Total Bobot Aktif"
            value={`${totalActiveWeight.toFixed(2)}%`}
            accent="warning"
            hint={
              totalActiveWeight >= 100
                ? 'Total bobot telah mencapai batas 100%.'
                : `Sisa bobot tersedia: ${(100 - totalActiveWeight).toFixed(2)}%`
            }
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18" />
              </svg>
            }
          />
          <ModuleStatCard
            label="Total Tipe Bobot"
            value={filteredData.length}
            accent="primary"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            }
          />
          <ModuleStatCard
            label="Bobot Aktif (Filter)"
            value={activeFilteredCount}
            accent="success"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
        </ModuleStatsGrid>

        <ModuleSection
          title="Filter Pencarian"
          description="Cari bobot nilai berdasarkan tipe atau label penilaian."
          actions={<SearchInput onSearch={setSearchQuery} placeholder="Cari bobot nilai..." className="md:w-72" />}
        >
          <p className="text-xs text-slate-500">
            Pastikan total bobot aktif tidak melebihi 100%. Gunakan toggle pada kolom status untuk mengaktifkan atau
            menonaktifkan bobot tertentu.
          </p>
        </ModuleSection>

        {isLoading ? (
          <ModuleLoadingState description="Memuat daftar bobot nilai..." />
        ) : filteredData.length === 0 ? (
          <ModuleEmptyState
            title="Tidak ada data bobot nilai"
            description="Tambah bobot nilai baru untuk mengatur komposisi penilaian."
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            }
            action={
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                Tambah Bobot Nilai
              </Button>
            }
          />
        ) : (
          <ModuleCard padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/60">
                    <TableHead className="font-semibold text-slate-700">Tipe Penilaian</TableHead>
                    <TableHead className="font-semibold text-slate-700">Label</TableHead>
                    <TableHead className="font-semibold text-slate-700">Bobot (%)</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Dibuat</TableHead>
                    <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((gradeWeight) => (
                    <TableRow key={gradeWeight.id} className="hover:bg-amber-50/40 transition-colors">
                      <TableCell className="font-medium text-slate-800">{gradeWeight.assignmentType}</TableCell>
                      <TableCell className="text-slate-800">{gradeWeight.assignmentLabel}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-amber-600">{gradeWeight.weightPercentage}%</span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(gradeWeight.id)}
                          className={cn(
                            'inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold shadow-inner ring-1 ring-black/5 transition-colors',
                            gradeWeight.isActive
                              ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
                          )}
                        >
                          {gradeWeight.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{formatDate(gradeWeight.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(gradeWeight)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(gradeWeight.id)}>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ModuleCard>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedGradeWeight ? 'Edit Bobot Nilai' : 'Tambah Bobot Nilai'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Penilaian <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="tugas">Tugas</option>
                  <option value="ulangan">Ulangan</option>
                  <option value="uts">UTS</option>
                  <option value="uas">UAS</option>
                  <option value="praktikum">Praktikum</option>
                  <option value="proyek">Proyek</option>
                  <option value="presentasi">Presentasi</option>
                  <option value="partisipasi">Partisipasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.assignmentLabel}
                  onChange={(e) => setFormData({ ...formData, assignmentLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Tugas Harian, Ulangan Harian, dll"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bobot (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.weightPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weightPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total bobot aktif saat ini: {totalWeight.toFixed(2)}%
                  {selectedGradeWeight && (
                    <span className="ml-2">
                      (Setelah update: {(totalWeight - selectedGradeWeight.weightPercentage + formData.weightPercentage).toFixed(2)}%)
                    </span>
                  )}
                  {!selectedGradeWeight && (
                    <span className="ml-2">
                      (Setelah tambah: {(totalWeight + formData.weightPercentage).toFixed(2)}%)
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
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
              <Button type="submit" loading={createMutation.isPending}>
                {selectedGradeWeight ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </ModulePage>
    </TenantLayout>
  );
}
