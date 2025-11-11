'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { examsApi, Exam, ExamCreateData } from '@/lib/api/exams';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ExamsPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<ExamCreateData>({
    title: '',
    description: '',
    subjectId: undefined,
    classId: undefined,
    startDate: '',
    endDate: '',
    duration: 60,
    totalQuestions: 0,
    passingScore: 60,
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['exams', tenantId, currentPage],
    queryFn: () => examsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

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

  const createMutation = useMutation({
    mutationFn: (data: ExamCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return examsApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExamCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return examsApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', tenantId] });
      setIsModalOpen(false);
      setSelectedExam(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return examsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjectId: undefined,
      classId: undefined,
      startDate: '',
      endDate: '',
      duration: 60,
      totalQuestions: 0,
      passingScore: 60,
      isActive: true,
    });
    setSelectedExam(null);
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      subjectId: exam.subjectId,
      classId: exam.classId,
      startDate: exam.startDate,
      endDate: exam.endDate,
      duration: exam.duration || 60,
      totalQuestions: exam.totalQuestions || 0,
      passingScore: exam.passingScore || 60,
      isActive: exam.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedExam) {
      updateMutation.mutate({ id: selectedExam.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus ujian ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    // TODO: Implement export functionality
    console.log(`Exporting to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const totalPages = data ? Math.ceil((data.total || 0) / itemsPerPage) : 1;
  const paginatedData = data?.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const totalExams = data?.data?.length || 0;
  const activeExams = data?.data?.filter((e) => e.isActive).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="exams"
        title="Ujian Online"
        description="Kelola ujian online di instansi Anda"
        actions={({ themeConfig }) => (
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="ujian" />
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
              Tambah Ujian
            </Button>
          </div>
        )}
        stats={[
          {
            label: 'Total Ujian',
            value: totalExams,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: 'Ujian Aktif',
            value: activeExams,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Ujian Tidak Aktif',
            value: totalExams - activeExams,
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">Judul</TableHead>
                          <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                          <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                          <TableHead className="font-semibold text-gray-700">Tanggal Mulai</TableHead>
                          <TableHead className="font-semibold text-gray-700">Tanggal Selesai</TableHead>
                          <TableHead className="font-semibold text-gray-700">Durasi</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((exam) => (
                          <TableRow key={exam.id} className="hover:bg-violet-50/50 transition-colors">
                            <TableCell className="font-medium text-gray-800">{exam.title}</TableCell>
                            <TableCell>{exam.subject?.name || '-'}</TableCell>
                            <TableCell>{exam.classRoom?.name || '-'}</TableCell>
                            <TableCell>{formatDate(exam.startDate)}</TableCell>
                            <TableCell>{formatDate(exam.endDate)}</TableCell>
                            <TableCell><span className="font-medium">{exam.duration || 0} menit</span></TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                exam.isActive 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {exam.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(exam)}
                                  className="hover:bg-violet-50 hover:border-violet-300 transition-colors"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(exam.id)}
                                  className="hover:bg-red-600 transition-colors"
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {paginatedData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Tidak ada data ujian</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={data?.total ?? 0}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
      </ModulePageShell>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedExam ? 'Edit Ujian' : 'Tambah Ujian'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Ujian <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  {subjectsData?.data?.map((subject) => (
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
                  {classesData?.data?.map((classItem) => (
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
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Soal</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Lulus</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, passingScore: parseInt(e.target.value) || 60 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {selectedExam ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

