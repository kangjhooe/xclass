'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { gradesApi } from '@/lib/api/grades';
import { subjectsApi } from '@/lib/api/subjects';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const examId = params?.examId as string;
  const [selectedAttempts, setSelectedAttempts] = useState<Set<number>>(new Set());
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputFormData, setInputFormData] = useState({
    subjectId: undefined as number | undefined,
    assignmentType: 'exam' as string,
  });

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(tenantId!, parseInt(examId)),
    enabled: !!tenantId && !!examId,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => examsApi.getExamResults(tenantId!, parseInt(examId)),
    enabled: !!examId && !!tenantId,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const inputToGradesMutation = useMutation({
    mutationFn: async () => {
      if (!inputFormData.subjectId) {
        throw new Error('Pilih mata pelajaran terlebih dahulu');
      }

      const attempts = results?.attempts?.filter((a: any) => selectedAttempts.has(a.id)) || [];
      const promises = attempts.map((attempt: any) =>
        gradesApi.create(tenantId!, {
          studentId: attempt.studentId,
          subjectId: inputFormData.subjectId!,
          score: attempt.score,
          assignmentType: inputFormData.assignmentType,
          description: `Nilai dari ujian: ${exam?.title}`,
          date: attempt.submittedAt || new Date().toISOString(),
        })
      );

      await Promise.all(promises);
      return { success: true, count: attempts.length };
    },
    onSuccess: (data) => {
      alert(`Berhasil menginput ${data.count} nilai ke penilaian!`);
      setIsInputModalOpen(false);
      setSelectedAttempts(new Set());
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
    },
  });

  const toggleAttemptSelection = (attemptId: number) => {
    const newSelected = new Set(selectedAttempts);
    if (newSelected.has(attemptId)) {
      newSelected.delete(attemptId);
    } else {
      newSelected.add(attemptId);
    }
    setSelectedAttempts(newSelected);
  };

  const selectAll = () => {
    if (selectedAttempts.size === results?.attempts?.length) {
      setSelectedAttempts(new Set());
    } else {
      setSelectedAttempts(new Set(results?.attempts?.map((a: any) => a.id) || []));
    }
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
            <p className="text-gray-600">Memuat hasil ujian...</p>
          </div>
        </div>
      </TenantLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-800">Hasil Ujian</h1>
              <p className="text-gray-600 mt-1">{exam?.title}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/${params.tenant}/exams/${examId}/item-analysis`)}
              >
                Analisis Butir Soal
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${params.tenant}/exams/${examId}/grade-conversion`)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Katrol Nilai
              </Button>
              <Button
                onClick={() => {
                  if (selectedAttempts.size === 0) {
                    alert('Pilih siswa terlebih dahulu');
                    return;
                  }
                  setIsInputModalOpen(true);
                }}
                disabled={selectedAttempts.size === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Input ke Penilaian ({selectedAttempts.size})
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Total Peserta</div>
              <div className="text-2xl font-bold text-gray-800">{results.totalAttempts}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Rata-rata</div>
              <div className="text-2xl font-bold text-gray-800">{results.averageScore.toFixed(1)}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Nilai Tertinggi</div>
              <div className="text-2xl font-bold text-green-600">{results.highestScore}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Nilai Terendah</div>
              <div className="text-2xl font-bold text-red-600">{results.lowestScore}</div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedAttempts.size === results?.attempts?.length && results?.attempts?.length > 0}
                      onChange={selectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nama Siswa</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nilai</TableHead>
                  <TableHead className="font-semibold text-gray-700">Benar</TableHead>
                  <TableHead className="font-semibold text-gray-700">Waktu</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results?.attempts && results.attempts.length > 0 ? (
                  results.attempts.map((attempt: any, index: number) => {
                    const scorePercentage = attempt.totalQuestions > 0
                      ? (attempt.correctAnswers / attempt.totalQuestions) * 100
                      : 0;
                    const isPassed = exam?.passingScore ? scorePercentage >= exam.passingScore : false;

                    return (
                      <TableRow key={attempt.id} className="hover:bg-violet-50/50 transition-colors">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAttempts.has(attempt.id)}
                            onChange={() => toggleAttemptSelection(attempt.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {attempt.student?.name || `Siswa #${attempt.studentId}`}
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold text-lg ${
                            isPassed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {attempt.score}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({scorePercentage.toFixed(1)}%)
                          </span>
                        </TableCell>
                        <TableCell>
                          {attempt.correctAnswers} / {attempt.totalQuestions}
                        </TableCell>
                        <TableCell>
                          {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            isPassed
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {isPassed ? 'Lulus' : 'Tidak Lulus'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // View detail
                            }}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada hasil ujian</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Input to Grades Modal */}
      <Modal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setInputFormData({ subjectId: undefined, assignmentType: 'exam' });
        }}
        title="Input Nilai ke Penilaian"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <select
              value={inputFormData.subjectId || ''}
              onChange={(e) =>
                setInputFormData({ ...inputFormData, subjectId: e.target.value ? parseInt(e.target.value) : undefined })
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Penilaian</label>
            <select
              value={inputFormData.assignmentType}
              onChange={(e) => setInputFormData({ ...inputFormData, assignmentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="exam">Ujian</option>
              <option value="quiz">Quiz</option>
              <option value="midterm">UTS</option>
              <option value="final">UAS</option>
              <option value="assignment">Tugas</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Perhatian:</strong> {selectedAttempts.size} nilai akan diinput ke penilaian. Pastikan mata pelajaran sudah benar.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsInputModalOpen(false);
                setInputFormData({ subjectId: undefined, assignmentType: 'exam' });
              }}
            >
              Batal
            </Button>
            <Button
              onClick={() => inputToGradesMutation.mutate()}
              loading={inputToGradesMutation.isPending}
              disabled={!inputFormData.subjectId}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Input {selectedAttempts.size} Nilai
            </Button>
          </div>
        </div>
      </Modal>
    </TenantLayout>
  );
}

