'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function GradeConversionPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const examId = params?.examId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: undefined as number | undefined,
    classId: undefined as number | undefined,
    minScore: 0,
    maxScore: 100,
    conversionType: 'per_class' as 'per_student' | 'per_class',
  });

  const queryClient = useQueryClient();

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(tenantId!, parseInt(examId)),
    enabled: !!tenantId && !!examId,
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

  // TODO: Add getGradeConversions API
  const { data: conversions } = useQuery({
    queryKey: ['grade-conversions', examId],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => examsApi.createGradeConversion({ ...data, examId: parseInt(examId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-conversions', examId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const applyMutation = useMutation({
    mutationFn: (conversionId: number) => examsApi.applyGradeConversion(parseInt(examId), conversionId),
    onSuccess: () => {
      alert('Katrol nilai berhasil diterapkan!');
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
  });

  const resetForm = () => {
    setFormData({
      subjectId: undefined,
      classId: undefined,
      minScore: 0,
      maxScore: 100,
      conversionType: 'per_class',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Katrol Nilai</h1>
              <p className="text-gray-600 mt-1">{exam?.title}</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              Tambah Aturan Katrol
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Cara Kerja Katrol Nilai</h3>
              <p className="text-sm text-blue-700">
                Katrol nilai akan menaikkan nilai siswa yang berada di bawah nilai minimum, dan membatasi nilai maksimal.
                Contoh: Jika minScore = 50 dan maxScore = 90, maka nilai &lt; 50 akan menjadi 50, dan nilai &gt; 90 akan menjadi 90.
              </p>
            </div>
          </div>
        </div>

        {/* Conversions List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                  <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nilai Min</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nilai Max</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions && conversions.length > 0 ? (
                  conversions.map((conversion: any) => (
                    <TableRow key={conversion.id} className="hover:bg-violet-50/50 transition-colors">
                      <TableCell>{conversion.subject?.name || '-'}</TableCell>
                      <TableCell>{conversion.classRoom?.name || '-'}</TableCell>
                      <TableCell>{conversion.minScore}</TableCell>
                      <TableCell>{conversion.maxScore}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {conversion.conversionType === 'per_class' ? 'Per Kelas' : 'Per Siswa'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm('Terapkan katrol nilai ini ke semua hasil ujian?')) {
                              applyMutation.mutate(conversion.id);
                            }
                          }}
                          loading={applyMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Terapkan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada aturan katrol nilai</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Tambah Aturan Katrol Nilai"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="">Semua</option>
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
                <option value="">Semua</option>
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
                Nilai Minimum <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.minScore}
                onChange={(e) => setFormData({ ...formData, minScore: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Nilai di bawah ini akan dinaikkan</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nilai Maksimum <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Nilai di atas ini akan dibatasi</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Katrol</label>
            <select
              value={formData.conversionType}
              onChange={(e) =>
                setFormData({ ...formData, conversionType: e.target.value as 'per_student' | 'per_class' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="per_class">Per Kelas</option>
              <option value="per_student">Per Siswa</option>
            </select>
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
    </TenantLayout>
  );
}

