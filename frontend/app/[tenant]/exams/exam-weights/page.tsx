'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ExamWeightsPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);
  const [formData, setFormData] = useState({
    subjectId: undefined as number | undefined,
    classId: undefined as number | undefined,
    examType: 'quiz' as string,
    weight: 10,
    semester: '',
    academicYear: '',
  });

  const queryClient = useQueryClient();

  const { data: classesData } = useQuery({
    queryKey: ['classes', tenantId],
    queryFn: () => classesApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  // TODO: Get current academic year and semester
  const currentYear = new Date().getFullYear();
  const currentSemester = '1'; // Default

  const { data: weights, isLoading } = useQuery({
    queryKey: ['exam-weights', tenantId, formData.subjectId, formData.classId, formData.semester, formData.academicYear],
    queryFn: () =>
      examsApi.getExamWeights({
        subjectId: formData.subjectId!,
        classId: formData.classId!,
        semester: formData.semester || currentSemester,
        academicYear: formData.academicYear || `${currentYear}/${currentYear + 1}`,
      }),
    enabled: !!tenantId && !!formData.subjectId && !!formData.classId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => examsApi.createExamWeight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-weights'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => examsApi.updateExamWeight(selectedWeight!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-weights'] });
      setIsModalOpen(false);
      resetForm();
      setSelectedWeight(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (weightId: number) => examsApi.deleteExamWeight(weightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-weights'] });
    },
  });

  const resetForm = () => {
    setFormData({
      subjectId: undefined,
      classId: undefined,
      examType: 'quiz',
      weight: 10,
      semester: currentSemester,
      academicYear: `${currentYear}/${currentYear + 1}`,
    });
    setSelectedWeight(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.classId) {
      alert('Pilih mata pelajaran dan kelas terlebih dahulu');
      return;
    }
    if (selectedWeight) {
      updateMutation.mutate({
        ...formData,
        academicYear: formData.academicYear || `${currentYear}/${currentYear + 1}`,
        semester: formData.semester || currentSemester,
      });
    } else {
      createMutation.mutate({
        ...formData,
        academicYear: formData.academicYear || `${currentYear}/${currentYear + 1}`,
        semester: formData.semester || currentSemester,
      });
    }
  };

  const totalWeight = weights?.reduce((sum: number, w: any) => sum + Number(w.weight), 0) || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="exams"
        title="Setting Bobot Ujian"
        description="Atur bobot ujian per mata pelajaran dan kelas"
        actions={({ themeConfig }) => (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className={themeConfig.primaryButton}
          >
            Tambah Bobot
          </Button>
        )}
      >
        {({ themeConfig }) => (
          <>
            {/* Filter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={formData.subjectId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjectsData?.data?.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formData.classId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {classesData?.data?.map((classItem: any) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder={`${currentYear}/${currentYear + 1}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Total Weight Indicator */}
            {formData.subjectId && formData.classId && (
              <div className={`mb-6 p-4 rounded-lg ${
                totalWeight === 100
                  ? 'bg-green-50 border border-green-200'
                  : totalWeight > 100
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Total Bobot: {totalWeight}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalWeight === 100
                        ? '✓ Total bobot sudah 100%'
                        : totalWeight > 100
                        ? '⚠ Total bobot melebihi 100%'
                        : `⚠ Total bobot belum 100% (kurang ${100 - totalWeight}%)`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Weights Table */}
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
                        <TableHead className="font-semibold text-gray-700">Jenis Ujian</TableHead>
                        <TableHead className="font-semibold text-gray-700">Bobot (%)</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weights && weights.length > 0 ? (
                        weights.map((weight: any) => (
                          <TableRow key={weight.id} className="hover:bg-violet-50/50 transition-colors">
                            <TableCell className="font-medium text-gray-800">
                              {weight.examType === 'quiz' && 'Quiz'}
                              {weight.examType === 'midterm' && 'UTS'}
                              {weight.examType === 'final' && 'UAS'}
                              {weight.examType === 'assignment' && 'Tugas'}
                            </TableCell>
                            <TableCell>{weight.weight}%</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWeight(weight);
                                    setFormData({
                                      subjectId: weight.subjectId,
                                      classId: weight.classId,
                                      examType: weight.examType,
                                      weight: weight.weight,
                                      semester: weight.semester,
                                      academicYear: weight.academicYear,
                                    });
                                    setIsModalOpen(true);
                                  }}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Hapus bobot ujian ini?')) {
                                      deleteMutation.mutate(weight.id);
                                    }
                                  }}
                                  loading={deleteMutation.isPending}
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada bobot ujian</p>
                              <p className="text-sm text-gray-400 mt-1">Pilih mata pelajaran dan kelas untuk melihat bobot</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </ModulePageShell>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedWeight ? 'Edit Bobot Ujian' : 'Tambah Bobot Ujian'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjectsData?.data?.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, classId: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kelas</option>
                {classesData?.data?.map((classItem: any) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Ujian <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">UTS</option>
                <option value="final">UAS</option>
                <option value="assignment">Tugas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bobot (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder={`${currentYear}/${currentYear + 1}`}
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
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {selectedWeight ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

