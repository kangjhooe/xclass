'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { gradesApi, StudentGrade, StudentGradeCreateData } from '@/lib/api/grades';
import { studentsApi } from '@/lib/api/students';
import { subjectsApi } from '@/lib/api/subjects';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function GradesPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<number | undefined>(undefined);
  const [filterSubjectId, setFilterSubjectId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<StudentGradeCreateData>({
    studentId: 0,
    subjectId: 0,
    score: 0,
    assignmentType: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['grades', tenantId, filterStudentId, filterSubjectId],
    queryFn: () => gradesApi.getAll(tenantId!, { studentId: filterStudentId, subjectId: filterSubjectId }),
    enabled: !!tenantId,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: StudentGradeCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradesApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentGradeCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradesApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
      setIsModalOpen(false);
      setSelectedGrade(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return gradesApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      subjectId: 0,
      score: 0,
      assignmentType: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedGrade(null);
  };

  const handleEdit = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setFormData({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      score: grade.score,
      assignmentType: grade.assignmentType || '',
      description: grade.description || '',
      date: grade.date || new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus nilai ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 font-semibold';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalGrades = data?.data?.length || 0;
  const averageScore = data?.data && data.data.length > 0
    ? (data.data.reduce((sum, g) => sum + g.score, 0) / data.data.length).toFixed(1)
    : 0;
  const excellentCount = data?.data?.filter((g) => g.score >= 85).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="grades"
        title="Data Nilai Siswa"
        description="Kelola data nilai siswa di instansi Anda"
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
            Tambah Nilai
          </Button>
        )}
        stats={[
          {
            label: 'Total Nilai',
            value: totalGrades,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            label: 'Rata-rata Nilai',
            value: averageScore,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            label: 'Nilai ≥ 85',
            value: excellentCount,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Siswa</label>
                  <select
                    value={filterStudentId || ''}
                    onChange={(e) => setFilterStudentId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Siswa</option>
                    {studentsData?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Mata Pelajaran</label>
                  <select
                    value={filterSubjectId || ''}
                    onChange={(e) => setFilterSubjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
                  >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjectsData?.data?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterStudentId(undefined);
                      setFilterSubjectId(undefined);
                    }}
                    className="w-full px-4 py-3 rounded-2xl border-2 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b-2 border-white/20">
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Siswa</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Mata Pelajaran</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Jenis Penilaian</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Nilai</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Tanggal</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Catatan</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((grade, index) => (
                        <TableRow 
                          key={grade.id} 
                          className={`transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                          } hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                        >
                          <TableCell className="font-medium text-gray-800">
                            {grade.student?.name || `Siswa #${grade.studentId}`}
                          </TableCell>
                          <TableCell>{grade.subject?.name || '-'}</TableCell>
                          <TableCell>
                            <span className={`font-bold ${getScoreColor(grade.score)}`}>
                              {grade.score}
                            </span>
                          </TableCell>
                          <TableCell>{grade.assignmentType || '-'}</TableCell>
                          <TableCell>{grade.description || '-'}</TableCell>
                          <TableCell>{formatDate(grade.date)}</TableCell>
                          <TableCell>{grade.teacher?.name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(grade)}
                                className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(grade.id)}
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Tidak ada data nilai</p>
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
              title={selectedGrade ? 'Edit Nilai' : 'Tambah Nilai'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Siswa</option>
                      {studentsData?.data?.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {subjectsData?.data?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Penilaian
                    </label>
                    <input
                      type="text"
                      value={formData.assignmentType}
                      onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Ulangan Harian, UAS, dll"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Opsional"
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
                    className={themeConfig.primaryButton}
                  >
                    {selectedGrade ? 'Update' : 'Simpan'}
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

