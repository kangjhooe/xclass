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

export default function QuestionBankDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const bankId = params?.bankId as string;
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isStimulusModalOpen, setIsStimulusModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [shareFormData, setShareFormData] = useState({
    toTeacherId: undefined as number | undefined,
    toInstansiId: undefined as number | undefined,
    shareType: 'copy' as 'copy' | 'edit' | 'view',
    message: '',
  });
  const [copyFormData, setCopyFormData] = useState({
    targetBankId: undefined as number | undefined,
  });
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    questionType: 'multiple_choice' as string,
    options: {} as Record<string, string>,
    correctAnswer: '',
    explanation: '',
    points: 1,
    difficulty: 3,
    stimulusId: undefined as number | undefined,
  });
  const [stimulusFormData, setStimulusFormData] = useState({
    title: '',
    content: '',
    contentType: 'text' as string,
    fileUrl: '',
  });

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: bank, isLoading } = useQuery({
    queryKey: ['question-bank', bankId],
    queryFn: () => examsApi.getQuestionBank(parseInt(bankId)),
    enabled: !!bankId,
  });

  const { data: myBanks } = useQuery({
    queryKey: ['question-banks', tenantId],
    queryFn: () => examsApi.getQuestionBanks(),
    enabled: !!tenantId,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', tenantId, bankId],
    queryFn: () => examsApi.getQuestions({ questionBankId: parseInt(bankId) }),
    enabled: !!bankId && !!tenantId,
  });

  const { data: stimuli } = useQuery({
    queryKey: ['stimuli', tenantId],
    queryFn: () => examsApi.getStimuli(),
    enabled: !!tenantId,
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data: any) => examsApi.createQuestion({ ...data, questionBankId: parseInt(bankId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', tenantId, bankId] });
      queryClient.invalidateQueries({ queryKey: ['question-bank', bankId] });
      setIsQuestionModalOpen(false);
      resetQuestionForm();
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: any) => examsApi.updateQuestion(selectedQuestion!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', tenantId, bankId] });
      queryClient.invalidateQueries({ queryKey: ['question-bank', bankId] });
      setIsQuestionModalOpen(false);
      resetQuestionForm();
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) => examsApi.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', tenantId, bankId] });
      queryClient.invalidateQueries({ queryKey: ['question-bank', bankId] });
    },
  });

  const shareQuestionMutation = useMutation({
    mutationFn: (data: any) => examsApi.shareQuestion(data),
    onSuccess: () => {
      alert('Permintaan berbagi soal berhasil dikirim!');
      setIsShareModalOpen(false);
      setShareFormData({
        toTeacherId: undefined,
        toInstansiId: undefined,
        shareType: 'copy',
        message: '',
      });
      setSelectedQuestion(null);
    },
  });

  const copyQuestionMutation = useMutation({
    mutationFn: (data: any) => examsApi.createQuestion(data),
    onSuccess: () => {
      alert('Soal berhasil disalin ke bank soal Anda!');
      queryClient.invalidateQueries({ queryKey: ['questions', tenantId, bankId] });
      queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
      setIsCopyModalOpen(false);
      setCopyFormData({ targetBankId: undefined });
      setSelectedQuestion(null);
    },
  });

  const createStimulusMutation = useMutation({
    mutationFn: (data: any) => examsApi.createStimulus(data),
    onSuccess: () => {
      setIsStimulusModalOpen(false);
      resetStimulusForm();
      // Refresh questions to show new stimulus
      queryClient.invalidateQueries({ queryKey: ['questions', tenantId, bankId] });
    },
  });

  const resetQuestionForm = () => {
    setQuestionFormData({
      questionText: '',
      questionType: 'multiple_choice',
      options: {},
      correctAnswer: '',
      explanation: '',
      points: 1,
      difficulty: 3,
      stimulusId: undefined,
    });
    setSelectedQuestion(null);
  };

  const resetStimulusForm = () => {
    setStimulusFormData({
      title: '',
      content: '',
      contentType: 'text',
      fileUrl: '',
    });
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      updateQuestionMutation.mutate({ ...questionFormData, questionBankId: parseInt(bankId) });
    } else {
      createQuestionMutation.mutate({ ...questionFormData, questionBankId: parseInt(bankId) });
    }
  };

  const handleStimulusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStimulusMutation.mutate(stimulusFormData);
  };

  const addOption = () => {
    const key = String.fromCharCode(65 + Object.keys(questionFormData.options).length); // A, B, C, D...
    setQuestionFormData({
      ...questionFormData,
      options: { ...questionFormData.options, [key]: '' },
    });
  };

  const removeOption = (key: string) => {
    const newOptions = { ...questionFormData.options };
    delete newOptions[key];
    setQuestionFormData({ ...questionFormData, options: newOptions });
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat bank soal...</div>
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
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali
                </button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const blob = await examsApi.exportQuestionBank(parseInt(bankId), true);
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${bank?.name?.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.zip`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      alert('Bank soal berhasil diekspor!');
                    } catch (error) {
                      alert('Gagal mengekspor bank soal');
                      console.error(error);
                    }
                  }}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Bank Soal
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{bank?.name}</h1>
              {bank?.description && <p className="text-gray-600 mt-1">{bank.description}</p>}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Mata Pelajaran: {bank?.subject?.name || '-'}</span>
                <span>Kelas: {bank?.classRoom?.name || '-'}</span>
                <span>Total Soal: {questions?.length || 0}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsStimulusModalOpen(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Tambah Stimulus
              </Button>
              <Button
                onClick={() => {
                  resetQuestionForm();
                  setIsQuestionModalOpen(true);
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                Tambah Soal
              </Button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Soal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                  <TableHead className="font-semibold text-gray-700">Level</TableHead>
                  <TableHead className="font-semibold text-gray-700">Poin</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </TableCell>
                  </TableRow>
                ) : questions && questions.length > 0 ? (
                  questions.map((question: any, index: number) => (
                    <TableRow key={question.id} className="hover:bg-violet-50/50 transition-colors">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{question.questionText}</div>
                        {question.stimulus && (
                          <span className="text-xs text-blue-600">📎 {question.stimulus.title}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {question.questionType === 'multiple_choice' && 'Pilihan Ganda'}
                          {question.questionType === 'true_false' && 'Benar/Salah'}
                          {question.questionType === 'essay' && 'Essay'}
                          {question.questionType === 'fill_blank' && 'Isian'}
                          {question.questionType === 'matching' && 'Menjodohkan'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= question.difficulty
                                  ? 'bg-violet-600'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{question.points} poin</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setQuestionFormData({
                                questionText: question.questionText,
                                questionType: question.questionType,
                                options: question.options || {},
                                correctAnswer: question.correctAnswer || '',
                                explanation: question.explanation || '',
                                points: question.points,
                                difficulty: question.difficulty,
                                stimulusId: question.stimulusId,
                              });
                              setIsQuestionModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setShareFormData({
                                toTeacherId: undefined,
                                toInstansiId: undefined,
                                shareType: 'copy',
                                message: '',
                              });
                              setIsShareModalOpen(true);
                            }}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Bagikan
                          </Button>
                          {(question.createdBy === user?.id || bank?.teacherId === user?.id) && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm('Hapus soal ini?')) {
                                  deleteQuestionMutation.mutate(question.id);
                                }
                              }}
                              loading={deleteQuestionMutation.isPending}
                            >
                              Hapus
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada soal</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          resetQuestionForm();
        }}
        title={selectedQuestion ? 'Edit Soal' : 'Tambah Soal'}
        size="lg"
      >
        <form onSubmit={handleQuestionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teks Soal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={questionFormData.questionText}
              onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Masukkan teks soal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
              <select
                value={questionFormData.questionType}
                onChange={(e) => setQuestionFormData({ ...questionFormData, questionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="true_false">Benar/Salah</option>
                <option value="essay">Essay</option>
                <option value="fill_blank">Isian</option>
                <option value="matching">Menjodohkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Kesulitan (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={questionFormData.difficulty}
                onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(questionFormData.questionType === 'multiple_choice' || questionFormData.questionType === 'matching') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Pilihan Jawaban</label>
                <Button type="button" size="sm" variant="outline" onClick={addOption}>
                  + Tambah Pilihan
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(questionFormData.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="w-8 text-center font-medium">{key}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          options: { ...questionFormData.options, [key]: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan pilihan jawaban"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeOption(key)}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(questionFormData.questionType === 'multiple_choice' ||
            questionFormData.questionType === 'true_false' ||
            questionFormData.questionType === 'fill_blank') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban Benar</label>
              {questionFormData.questionType === 'true_false' ? (
                <select
                  value={questionFormData.correctAnswer}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="true">Benar</option>
                  <option value="false">Salah</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={questionFormData.correctAnswer}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={questionFormData.questionType === 'multiple_choice' ? 'Masukkan kunci jawaban (A, B, C, dll)' : 'Masukkan jawaban benar'}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poin</label>
              <input
                type="number"
                min="1"
                value={questionFormData.points}
                onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stimulus (Opsional)</label>
              <select
                value={questionFormData.stimulusId || ''}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    stimulusId: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tidak ada stimulus</option>
                {stimuli?.map((stimulus: any) => (
                  <option key={stimulus.id} value={stimulus.id}>
                    {stimulus.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penjelasan</label>
            <textarea
              value={questionFormData.explanation}
              onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Penjelasan jawaban (opsional)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsQuestionModalOpen(false);
                resetQuestionForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={createQuestionMutation.isPending || updateQuestionMutation.isPending}>
              {selectedQuestion ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stimulus Modal */}
      <Modal
        isOpen={isStimulusModalOpen}
        onClose={() => {
          setIsStimulusModalOpen(false);
          resetStimulusForm();
        }}
        title="Tambah Stimulus"
        size="lg"
      >
        <form onSubmit={handleStimulusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Stimulus <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stimulusFormData.title}
              onChange={(e) => setStimulusFormData({ ...stimulusFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Contoh: Bacaan tentang Fotosintesis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select
              value={stimulusFormData.contentType}
              onChange={(e) => setStimulusFormData({ ...stimulusFormData, contentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Teks</option>
              <option value="image">Gambar</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
            </select>
          </div>

          {stimulusFormData.contentType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
              <textarea
                value={stimulusFormData.content}
                onChange={(e) => setStimulusFormData({ ...stimulusFormData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan teks stimulus..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
              <input
                type="text"
                value={stimulusFormData.fileUrl}
                onChange={(e) => setStimulusFormData({ ...stimulusFormData, fileUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL file atau path"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsStimulusModalOpen(false);
                resetStimulusForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={createStimulusMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Question Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareFormData({
            toTeacherId: undefined,
            toInstansiId: undefined,
            shareType: 'copy',
            message: '',
          });
          setSelectedQuestion(null);
        }}
        title="Bagikan Soal"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!shareFormData.toTeacherId) {
              alert('Pilih guru tujuan terlebih dahulu');
              return;
            }
            shareQuestionMutation.mutate({
              questionId: selectedQuestion?.id,
              toTeacherId: shareFormData.toTeacherId,
              toInstansiId: shareFormData.toInstansiId || tenantId,
              shareType: shareFormData.shareType,
              message: shareFormData.message,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Berbagi <span className="text-red-500">*</span>
            </label>
            <select
              value={shareFormData.shareType}
              onChange={(e) =>
                setShareFormData({ ...shareFormData, shareType: e.target.value as 'copy' | 'edit' | 'view' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="copy">Copy (Guru bisa menyalin soal)</option>
              <option value="edit">Edit (Guru bisa mengedit soal)</option>
              <option value="view">View (Guru hanya bisa melihat)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guru Tujuan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={shareFormData.toTeacherId || ''}
              onChange={(e) =>
                setShareFormData({ ...shareFormData, toTeacherId: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan ID Guru"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Masukkan ID guru yang akan menerima soal. Untuk berbagi antar tenant, masukkan juga ID tenant tujuan.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Tujuan (Opsional)</label>
            <input
              type="number"
              value={shareFormData.toInstansiId || ''}
              onChange={(e) =>
                setShareFormData({
                  ...shareFormData,
                  toInstansiId: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kosongkan jika dalam tenant yang sama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesan (Opsional)</label>
            <textarea
              value={shareFormData.message}
              onChange={(e) => setShareFormData({ ...shareFormData, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pesan untuk guru tujuan..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Jika berbagi dalam tenant yang sama, permintaan akan otomatis disetujui. Jika berbagi antar tenant, perlu persetujuan dari guru tujuan.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsShareModalOpen(false);
                setShareFormData({
                  toTeacherId: undefined,
                  toInstansiId: undefined,
                  shareType: 'copy',
                  message: '',
                });
                setSelectedQuestion(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={shareQuestionMutation.isPending}>
              Kirim Permintaan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Copy Question Modal */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => {
          setIsCopyModalOpen(false);
          setCopyFormData({ targetBankId: undefined });
          setSelectedQuestion(null);
        }}
        title="Salin Soal ke Bank Soal"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!copyFormData.targetBankId) {
              alert('Pilih bank soal tujuan terlebih dahulu');
              return;
            }
            copyQuestionMutation.mutate({
              ...selectedQuestion,
              questionBankId: copyFormData.targetBankId,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Soal Tujuan <span className="text-red-500">*</span>
            </label>
            <select
              value={copyFormData.targetBankId || ''}
              onChange={(e) =>
                setCopyFormData({ targetBankId: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih bank soal...</option>
              {myBanks?.map((bank: any) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} {bank.subject?.name && `(${bank.subject.name})`}
                </option>
              ))}
            </select>
          </div>

          {selectedQuestion && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Soal yang akan disalin:</p>
              <p className="text-sm text-gray-600">{selectedQuestion.questionText}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCopyModalOpen(false);
                setCopyFormData({ targetBankId: undefined });
                setSelectedQuestion(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={copyQuestionMutation.isPending}>
              Salin Soal
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

