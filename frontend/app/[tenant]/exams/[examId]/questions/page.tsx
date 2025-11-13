'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ExamQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const examId = params?.examId as string;
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(tenantId!, parseInt(examId)),
    enabled: !!tenantId && !!examId,
  });

  const { data: examQuestions } = useQuery({
    queryKey: ['exam-questions', examId],
    queryFn: () => examsApi.getExamQuestions(parseInt(examId)),
    enabled: !!examId,
  });

  const { data: questionBanks } = useQuery({
    queryKey: ['question-banks', tenantId],
    queryFn: () => examsApi.getQuestionBanks(),
    enabled: !!tenantId,
  });

  const { data: bankQuestions } = useQuery({
    queryKey: ['bank-questions', selectedBankId],
    queryFn: () => examsApi.getQuestions({ questionBankId: selectedBankId! }),
    enabled: !!selectedBankId,
  });

  const addQuestionMutation = useMutation({
    mutationFn: (questionId: number) =>
      examsApi.addQuestionToExam(parseInt(examId), {
        questionId,
        order: examQuestions?.length || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
  });

  const removeQuestionMutation = useMutation({
    mutationFn: (questionId: number) =>
      examsApi.removeQuestionFromExam(parseInt(examId), questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
  });

  const handleSelectFromBank = () => {
    if (!selectedBankId) {
      alert('Pilih bank soal terlebih dahulu');
      return;
    }
    setIsSelectModalOpen(true);
  };

  const handleAddSelectedQuestions = () => {
    selectedQuestions.forEach((questionId) => {
      addQuestionMutation.mutate(questionId);
    });
    setSelectedQuestions(new Set());
    setIsSelectModalOpen(false);
  };

  const toggleQuestionSelection = (questionId: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
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
              <h1 className="text-2xl font-bold text-gray-800">Kelola Soal Ujian</h1>
              <p className="text-gray-600 mt-1">{exam?.title}</p>
              <p className="text-sm text-gray-500 mt-1">Total Soal: {examQuestions?.length || 0}</p>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedBankId || ''}
                  onChange={(e) => setSelectedBankId(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Bank Soal</option>
                  {questionBanks?.map((bank: any) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} ({bank.questions?.length || 0} soal)
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSelectFromBank}
                  disabled={!selectedBankId}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  Pilih dari Bank Soal
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Questions List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Soal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                  <TableHead className="font-semibold text-gray-700">Poin</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examQuestions && examQuestions.length > 0 ? (
                  examQuestions.map((question: any, index: number) => (
                    <TableRow key={question.id} className="hover:bg-violet-50/50 transition-colors">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{question.questionText}</div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {question.questionType === 'multiple_choice' && 'Pilihan Ganda'}
                          {question.questionType === 'true_false' && 'Benar/Salah'}
                          {question.questionType === 'essay' && 'Essay'}
                        </span>
                      </TableCell>
                      <TableCell>{question.points} poin</TableCell>
                      <TableCell>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('Hapus soal ini dari ujian?')) {
                              removeQuestionMutation.mutate(question.id);
                            }
                          }}
                          loading={removeQuestionMutation.isPending}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada soal di ujian ini</p>
                        <p className="text-sm text-gray-400 mt-1">Pilih soal dari bank soal atau buat soal baru</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Select Questions Modal */}
      <Modal
        isOpen={isSelectModalOpen}
        onClose={() => {
          setIsSelectModalOpen(false);
          setSelectedQuestions(new Set());
        }}
        title="Pilih Soal dari Bank Soal"
        size="lg"
      >
        <div className="space-y-4">
          {bankQuestions && bankQuestions.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {bankQuestions.map((question: any) => (
                  <div
                    key={question.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedQuestions.has(question.id)
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="mt-1"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Level {question.difficulty} • {question.points} poin
                          </span>
                        </div>
                        <p className="text-gray-800">{question.questionText}</p>
                        {question.stimulus && (
                          <p className="text-xs text-blue-600 mt-1">📎 {question.stimulus.title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedQuestions.size} soal dipilih
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsSelectModalOpen(false);
                      setSelectedQuestions(new Set());
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAddSelectedQuestions}
                    disabled={selectedQuestions.size === 0}
                    loading={addQuestionMutation.isPending}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    Tambah {selectedQuestions.size > 0 && `(${selectedQuestions.size})`}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada soal di bank soal ini</p>
            </div>
          )}
        </div>
      </Modal>
    </TenantLayout>
  );
}

