'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { subjectsApi, Subject, SubjectCreateData } from '@/lib/api/subjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function SubjectsPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectCreateData>({
    name: '',
    code: '',
    description: '',
    level: '',
    hoursPerWeek: undefined,
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: SubjectCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SubjectCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      setIsModalOpen(false);
      setSelectedSubject(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      level: '',
      hoursPerWeek: undefined,
      isActive: true,
    });
    setSelectedSubject(null);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      level: subject.level || '',
      hoursPerWeek: subject.hoursPerWeek,
      isActive: subject.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalSubjects = data?.data?.length || 0;
  const activeSubjects = data?.data?.filter((s) => s.isActive).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="subjects"
        title="Data Mata Pelajaran"
        description="Kelola kurikulum dan mata pelajaran secara terstruktur"
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
            Tambah Mata Pelajaran
          </Button>
        )}
        stats={[
          {
            label: 'Total Mata Pelajaran',
            value: totalSubjects,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            ),
          },
          {
            label: 'Mata Pelajaran Aktif',
            value: activeSubjects,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            footer: (
              <span className="text-green-600 font-medium">
                {((activeSubjects / (totalSubjects || 1)) * 100).toFixed(1)}% aktif
              </span>
            ),
          },
          {
            label: 'Tidak Aktif',
            value: totalSubjects - activeSubjects,
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kode</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tingkat</TableHead>
                        <TableHead className="font-semibold text-gray-700">Jam/Minggu</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((subject) => (
                        <TableRow key={subject.id} className="hover:bg-cyan-50/50 transition-colors">
                          <TableCell>{subject.code || '-'}</TableCell>
                          <TableCell className="font-medium text-gray-800">{subject.name}</TableCell>
                          <TableCell>{subject.level || '-'}</TableCell>
                          <TableCell>{subject.hoursPerWeek || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              subject.isActive 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {subject.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(subject)}
                                className="hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(subject.id)}
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
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data mata pelajaran</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              title={selectedSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                      <input
                        type="text"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: X, XI, XII"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam per Minggu</label>
                    <input
                      type="number"
                      value={formData.hoursPerWeek || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hoursPerWeek: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
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
                    {selectedSubject ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

