'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { alumniApi, Alumni, AlumniCreateData } from '@/lib/api/alumni';
import { studentsApi } from '@/lib/api/students';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function AlumniPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<AlumniCreateData>({
    studentId: 0,
    graduationYear: new Date().getFullYear(),
    graduationDate: new Date().toISOString().split('T')[0],
    finalGrade: 0,
    gpa: undefined,
    rank: undefined,
    currentOccupation: '',
    company: '',
    position: '',
    industry: '',
    salaryRange: undefined,
    address: '',
    phone: '',
    email: '',
    status: 'unemployed',
    notes: '',
  });
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['alumni', resolvedTenantId, currentPage, searchQuery, filterYear],
    queryFn: () => alumniApi.getAll(resolvedTenantId!, { 
      page: currentPage, 
      limit: itemsPerPage,
      search: searchQuery || undefined,
      graduationYear: filterYear,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  // Fetch students for dropdown
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', resolvedTenantId, 'alumni'],
    queryFn: () => studentsApi.getAll(resolvedTenantId!, { 
      page: 1, 
      limit: 1000,
      status: 'active',
    }),
    enabled: resolvedTenantId !== undefined && isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: AlumniCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return alumniApi.create(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Alumni berhasil ditambahkan');
    },
    onError: () => {
      showError('Gagal menambahkan alumni');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AlumniCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return alumniApi.update(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni', resolvedTenantId] });
      setIsModalOpen(false);
      setSelectedAlumni(null);
      resetForm();
      success('Alumni berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate alumni');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return alumniApi.delete(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni', resolvedTenantId] });
      success('Alumni berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus alumni');
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      graduationYear: new Date().getFullYear(),
      graduationDate: new Date().toISOString().split('T')[0],
      finalGrade: 0,
      gpa: undefined,
      rank: undefined,
      currentOccupation: '',
      company: '',
      position: '',
      industry: '',
      salaryRange: undefined,
      address: '',
      phone: '',
      email: '',
      status: 'unemployed',
      notes: '',
    });
    setSelectedAlumni(null);
  };

  const handleEdit = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
    setFormData({
      studentId: alumni.studentId,
      graduationYear: alumni.graduationYear,
      graduationDate: alumni.graduationDate ? alumni.graduationDate.split('T')[0] : new Date().toISOString().split('T')[0],
      finalGrade: alumni.finalGrade,
      gpa: alumni.gpa,
      rank: alumni.rank,
      currentOccupation: alumni.currentOccupation || '',
      company: alumni.company || '',
      position: alumni.position || '',
      industry: alumni.industry || '',
      salaryRange: alumni.salaryRange,
      address: alumni.address || '',
      phone: alumni.phone || '',
      email: alumni.email || '',
      status: alumni.status || 'unemployed',
      notes: alumni.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedAlumni) {
      updateMutation.mutate({ id: selectedAlumni.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus alumni ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    console.log(`Exporting to ${format}...`);
    success(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const totalPages = data?.totalPages || 1;
  const paginatedData = data?.data || [];

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Alumni</h1>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="alumni" />
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Tambah Alumni
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="Cari alumni..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
              <input
                type="number"
                value={filterYear || ''}
                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Filter tahun lulus"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tahun Lulus</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((alumni) => (
                    <TableRow key={alumni.id}>
                      <TableCell className="font-medium">
                        {alumni.student?.name || `Siswa ID: ${alumni.studentId}`}
                      </TableCell>
                      <TableCell>{alumni.graduationYear}</TableCell>
                      <TableCell>{alumni.email || '-'}</TableCell>
                      <TableCell>{alumni.phone || '-'}</TableCell>
                      <TableCell>{alumni.currentOccupation || '-'}</TableCell>
                      <TableCell>{alumni.company || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alumni.status === 'employed' ? 'bg-green-100 text-green-800' :
                          alumni.status === 'studying' ? 'bg-blue-100 text-blue-800' :
                          alumni.status === 'self_employed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alumni.status === 'employed' ? 'Bekerja' :
                           alumni.status === 'studying' ? 'Kuliah' :
                           alumni.status === 'self_employed' ? 'Wirausaha' :
                           'Belum Bekerja'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(alumni)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(alumni.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Tidak ada data alumni
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedAlumni ? 'Edit Alumni' : 'Tambah Alumni'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoadingStudents || !!selectedAlumni}
                >
                  <option value="0">Pilih Siswa</option>
                  {studentsData?.data?.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.nisn ? `(${student.nisn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.graduationDate}
                    onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Akhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.finalGrade}
                    onChange={(e) => setFormData({ ...formData, finalGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IPK</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peringkat</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rank || ''}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unemployed">Belum Bekerja</option>
                  <option value="employed">Bekerja</option>
                  <option value="studying">Kuliah</option>
                  <option value="self_employed">Wirausaha</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.currentOccupation || ''}
                    onChange={(e) => setFormData({ ...formData, currentOccupation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industri</label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Gaji</label>
                <input
                  type="number"
                  min="0"
                  value={formData.salaryRange || ''}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 5000000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedAlumni ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

