'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { teachersApi, Teacher, TeacherCreateData } from '@/lib/api/teachers';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function TeachersPage() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const tenantId = useTenantId(); // Numeric ID for API calls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherCreateData>({
    name: '',
    email: '',
    phone: '',
    employeeNumber: '',
    nip: '',
    nik: '',
    nuptk: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    education: '',
    specialization: '',
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', tenantId],
    queryFn: () => teachersApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: TeacherCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TeacherCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      setIsModalOpen(false);
      setSelectedTeacher(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeNumber: '',
      nip: '',
      nik: '',
      nuptk: '',
      gender: '',
      birthDate: '',
      birthPlace: '',
      address: '',
      education: '',
      specialization: '',
      isActive: true,
    });
    setSelectedTeacher(null);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      employeeNumber: teacher.employeeNumber || '',
      nip: teacher.nip || '',
      nik: teacher.nik || '',
      nuptk: teacher.nuptk || '',
      gender: teacher.gender || '',
      birthDate: teacher.birthDate || '',
      birthPlace: teacher.birthPlace || '',
      address: teacher.address || '',
      education: teacher.education || '',
      specialization: teacher.specialization || '',
      isActive: teacher.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalTeachers = data?.data?.length || 0;
  const activeTeachers = data?.data?.filter((teacher) => teacher.isActive).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="teachers"
        title="Data Guru"
        description="Kelola data guru dan tenaga pendidik"
        actions={({ themeConfig }) => (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className={themeConfig.primaryButton}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Guru
          </Button>
        )}
        stats={[
          {
            label: 'Total Guru',
            value: totalTeachers,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-3-3h-4M9 20H4v-2a3 3 0 013-3h4m1-3a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            ),
          },
          {
            label: 'Guru Aktif',
            value: activeTeachers,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Tidak Aktif',
            value: totalTeachers - activeTeachers,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-b-2 border-white/20">
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Nama</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Email</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Telepon</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">NUPTK</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Jenis Kelamin</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.data?.map((teacher, index) => (
                          <TableRow 
                            key={teacher.id} 
                            className={`transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                            } hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                          >
                            <TableCell className="font-medium text-gray-800">{teacher.name}</TableCell>
                            <TableCell>{teacher.email || '-'}</TableCell>
                            <TableCell>{teacher.phone || '-'}</TableCell>
                            <TableCell>{teacher.nuptk || '-'}</TableCell>
                            <TableCell>{teacher.gender === 'L' ? 'Laki-laki' : teacher.gender === 'P' ? 'Perempuan' : '-'}</TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                teacher.isActive 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {teacher.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(teacher)}
                                  className="hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(teacher.id)}
                                  className="hover:bg-red-600 transition-colors"
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {data?.data?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Belum ada data guru</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  title={selectedTeacher ? 'Edit Guru' : 'Tambah Guru'}
                  size="lg"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                        <input
                          type="text"
                          value={formData.nip}
                          onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                        <input
                          type="text"
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                        <input
                          type="text"
                          value={formData.nuptk}
                          onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Pegawai</label>
                        <input
                          type="text"
                          value={formData.employeeNumber}
                          onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Aktif</option>
                          <option value="inactive">Tidak Aktif</option>
                        </select>
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
                        className={themeConfig.primaryButton}
                      >
                        {selectedTeacher ? 'Update' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </Modal>
              </>
            )}
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

