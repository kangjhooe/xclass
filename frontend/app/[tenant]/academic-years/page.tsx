'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { academicYearsApi, AcademicYear, AcademicYearCreateData, SemesterType } from '@/lib/api/academic-years';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function AcademicYearsPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState<AcademicYearCreateData>({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
    currentSemester: 1,
    currentSemesterType: 'ganjil',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['academic-years', tenantId],
    queryFn: () => academicYearsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: AcademicYearCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicYearsApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', tenantId] });
      setIsModalOpen(false);
      resetForm();
      alert('Tahun pelajaran berhasil dibuat!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Gagal membuat tahun pelajaran. Silakan coba lagi.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AcademicYearCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicYearsApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', tenantId] });
      setIsModalOpen(false);
      setSelectedAcademicYear(null);
      resetForm();
      alert('Tahun pelajaran berhasil diperbarui!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Gagal memperbarui tahun pelajaran. Silakan coba lagi.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicYearsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', tenantId] });
      alert('Tahun pelajaran berhasil dihapus!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Gagal menghapus tahun pelajaran. Silakan coba lagi.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const setSemesterMutation = useMutation({
    mutationFn: ({ id, semesterType }: { id: number; semesterType: SemesterType }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicYearsApi.setSemester(tenantId, id, semesterType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', tenantId] });
      alert('Semester berhasil diubah!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Gagal mengubah semester. Silakan coba lagi.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: false,
      currentSemester: 1,
      currentSemesterType: 'ganjil',
      description: '',
    });
    setSelectedAcademicYear(null);
  };

  const handleEdit = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear);
    setFormData({
      name: academicYear.name,
      startDate: academicYear.startDate,
      endDate: academicYear.endDate,
      isActive: academicYear.isActive ?? false,
      currentSemester: academicYear.currentSemester ?? 1,
      currentSemesterType: academicYear.currentSemesterType ?? 'ganjil',
      description: academicYear.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSetSemester = (id: number, currentType: SemesterType) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    const newType: SemesterType = currentType === 'ganjil' ? 'genap' : 'ganjil';
    const confirmMessage = `Apakah Anda yakin ingin mengubah semester menjadi ${newType === 'ganjil' ? 'Ganjil' : 'Genap'}?`;
    
    if (confirm(confirmMessage)) {
      setSemesterMutation.mutate({ id, semesterType: newType });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedAcademicYear) {
      updateMutation.mutate({ id: selectedAcademicYear.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus tahun pelajaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetActive = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin mengaktifkan tahun pelajaran ini? Tahun pelajaran aktif lainnya akan dinonaktifkan.')) {
      updateMutation.mutate({ id, data: { isActive: true } });
    }
  };

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Tahun Pelajaran</h1>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Tambah Tahun Pelajaran
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((academicYear) => (
                  <TableRow key={academicYear.id}>
                    <TableCell className="font-medium">{academicYear.name}</TableCell>
                    <TableCell>{formatDate(academicYear.startDate)}</TableCell>
                    <TableCell>{formatDate(academicYear.endDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          academicYear.currentSemesterType === 'ganjil' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {academicYear.currentSemesterType === 'ganjil' ? 'Ganjil' : 'Genap'}
                        </span>
                        {academicYear.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetSemester(academicYear.id, academicYear.currentSemesterType || 'ganjil')}
                            disabled={setSemesterMutation.isPending}
                            title="Ubah Semester"
                          >
                            {setSemesterMutation.isPending ? '...' : 'Ubah'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {academicYear.isActive ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Tidak Aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{academicYear.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!academicYear.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActive(academicYear.id)}
                          >
                            Aktifkan
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(academicYear)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(academicYear.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Tidak ada data tahun pelajaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedAcademicYear ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                label="Nama Tahun Pelajaran"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: 2024/2025"
                required
                helperText="Masukkan nama tahun pelajaran, contoh: 2024/2025"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Tanggal Mulai"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  helperText="Tanggal dimulainya tahun pelajaran"
                />

                <Input
                  type="date"
                  label="Tanggal Selesai"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  helperText="Tanggal berakhirnya tahun pelajaran"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  options={[
                    { value: 'false', label: 'Tidak Aktif' },
                    { value: 'true', label: 'Aktif' }
                  ]}
                />

                <Select
                  label="Semester"
                  value={formData.currentSemesterType || 'ganjil'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    currentSemesterType: e.target.value as SemesterType,
                    currentSemester: e.target.value === 'ganjil' ? 1 : 2
                  })}
                  options={[
                    { value: 'ganjil', label: 'Ganjil' },
                    { value: 'genap', label: 'Genap' }
                  ]}
                />
              </div>

              <Textarea
                label="Deskripsi"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Deskripsi tahun pelajaran (opsional)"
                helperText="Tambahkan catatan atau deskripsi tambahan untuk tahun pelajaran ini"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
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
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedAcademicYear ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

