'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { examsApi, ExamQuestion, ExamAttempt } from '@/lib/api/exams';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';
import { studentsApi } from '@/lib/api/students';

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = useTenantId();
  const scheduleId = searchParams?.get('scheduleId');
  const examId = params?.examId as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get student ID from user email
  const { data: studentData } = useQuery({
    queryKey: ['student-by-email', tenantId, user?.email],
    queryFn: async () => {
      if (!tenantId || !user?.email) return null;
      const students = await studentsApi.getAll(tenantId, { search: user.email });
      return students.data.find((s) => s.email === user.email);
    },
    enabled: !!tenantId && !!user?.email,
  });

  const studentId = studentData?.id;

  // Start exam attempt
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!scheduleId) throw new Error('Schedule ID tidak ditemukan');
      if (!studentId) throw new Error('Student ID tidak ditemukan. Pastikan Anda sudah login sebagai siswa.');
      const attemptData = await examsApi.startAttempt(
        {
          scheduleId: parseInt(scheduleId),
          ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => ''),
          userAgent: navigator.userAgent,
        },
        studentId
      );
      return attemptData;
    },
    onSuccess: (data) => {
      setAttempt(data);
      setStartedAt(new Date());
      if (data.exam?.duration) {
        setTimeRemaining(data.exam.duration * 60); // Convert minutes to seconds
      }
      // Load questions
      loadQuestions(data.examId);
    },
  });

  const loadQuestions = async (examId: number) => {
    try {
      const questionsData = await examsApi.getQuestions(examId);
      // If exam has questionOrder, use it; otherwise use questions as-is
      if (attempt?.questionOrder && attempt.questionOrder.length > 0) {
        const orderedQuestions = attempt.questionOrder
          .map((qId) => questionsData.find((q) => q.id === qId))
          .filter(Boolean) as ExamQuestion[];
        setQuestions(orderedQuestions);
      } else {
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      if (!attempt) throw new Error('Attempt tidak ditemukan');
      return await examsApi.submitAnswer(attempt.id, {
        questionId,
        answer,
        timeSpent: timeRemaining,
      });
    },
    onSuccess: (data) => {
      setAttempt(data);
    },
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) throw new Error('Attempt tidak ditemukan');
      return await examsApi.submitAttempt(attempt.id);
    },
    onSuccess: () => {
      router.push(`/${params.tenant}/student-portal/exams/${examId}/results?scheduleId=${scheduleId}`);
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && startedAt) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up, auto submit
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining, startedAt]);

  // Auto-save answers periodically
  useEffect(() => {
    if (attempt && Object.keys(answers).length > 0) {
      autoSaveIntervalRef.current = setInterval(async () => {
        setAutoSaveStatus('saving');
        try {
          const savePromises = Object.entries(answers)
            .filter(([_, answer]) => answer)
            .map(([questionId, answer]) =>
              submitAnswerMutation.mutateAsync({ questionId: parseInt(questionId), answer })
            );
          await Promise.all(savePromises);
          setAutoSaveStatus('saved');
        } catch (error) {
          console.error('Auto-save error:', error);
          setAutoSaveStatus('error');
        }
      }, 30000); // Auto-save every 30 seconds

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [answers, attempt]);

  const handleAutoSubmit = async () => {
    if (!attempt) return;
    setIsSubmitting(true);
    // Submit all answers
    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer) {
        await submitAnswerMutation.mutateAsync({ questionId: parseInt(questionId), answer });
      }
    }
    // Submit exam
    await submitExamMutation.mutateAsync();
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    // Auto-save answer
    if (attempt) {
      submitAnswerMutation.mutate({ questionId, answer });
    }
  };

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      // Submit all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer && attempt) {
          await submitAnswerMutation.mutateAsync({ questionId: parseInt(questionId), answer });
        }
      }
      // Submit exam
      if (attempt) {
        await submitExamMutation.mutateAsync();
        // Redirect to results page after successful submit
        router.push(`/${params.tenant}/student-portal/exams/${examId}/results?scheduleId=${scheduleId}`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Gagal mengirim jawaban. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[parseInt(k)]).length;
  const totalQuestions = questions.length;

  // Warning before leaving page
  useEffect(() => {
    if (attempt && attempt.status === 'in_progress') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Anda sedang mengerjakan ujian. Apakah Anda yakin ingin meninggalkan halaman?';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [attempt]);

  // Start exam on mount
  useEffect(() => {
    if (!attempt && scheduleId && studentId && !startAttemptMutation.isPending) {
      startAttemptMutation.mutate();
    }
  }, [scheduleId, studentId]);

  if (!studentId) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Anda harus login sebagai siswa untuk mengakses halaman ini.</p>
            <Button onClick={() => router.push(`/${params.tenant}/student-portal/exams`)}>
              Kembali ke Daftar Ujian
            </Button>
          </div>
        </div>
      </TenantLayout>
    );
  }

  if (startAttemptMutation.isPending || !attempt) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
            <p className="text-gray-600">Memuat ujian...</p>
          </div>
        </div>
      </TenantLayout>
    );
  }

  if (isSubmitting) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
            <p className="text-gray-600">Mengirim jawaban...</p>
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Header with Timer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{attempt.exam?.title}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Soal {currentQuestionIndex + 1} dari {totalQuestions}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Auto-save indicator */}
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
                      <span className="text-gray-600">Menyimpan...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600">Tersimpan</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-600">Gagal menyimpan</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-500">Waktu Tersisa</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Terjawab: <strong>{answeredCount}</strong> / {totalQuestions}
            </span>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Selesai & Kirim
            </Button>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentQuestionIndex;
              const isBookmarked = bookmarkedQuestions.has(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`relative w-10 h-10 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-violet-600 text-white ring-2 ring-violet-300 scale-110'
                      : isAnswered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {isBookmarked && (
                    <span className="absolute -top-1 -right-1 text-yellow-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    Soal {currentQuestionIndex + 1}
                  </span>
                  <button
                    onClick={() => {
                      setBookmarkedQuestions((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(currentQuestion.id)) {
                          newSet.delete(currentQuestion.id);
                        } else {
                          newSet.add(currentQuestion.id);
                        }
                        return newSet;
                      });
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedQuestions.has(currentQuestion.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={bookmarkedQuestions.has(currentQuestion.id) ? 'Hapus bookmark' : 'Bookmark soal'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {currentQuestion.points} poin • {currentQuestion.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{currentQuestion.questionText}</h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
                <>
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === key
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={key}
                        checked={answers[currentQuestion.id] === key}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <span className="flex-1 text-gray-800">{value as string}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.questionType === 'true_false' && (
                <>
                  {['true', 'false'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <span className="flex-1 text-gray-800">{option === 'true' ? 'Benar' : 'Salah'}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.questionType === 'essay' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:outline-none resize-none"
                  rows={8}
                  placeholder="Tulis jawaban Anda di sini..."
                />
              )}

              {currentQuestion.questionType === 'fill_blank' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:outline-none"
                  placeholder="Isi jawaban Anda di sini..."
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="border-violet-300 text-violet-600 hover:bg-violet-50"
          >
            ← Sebelumnya
          </Button>
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            Selanjutnya →
          </Button>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Pengiriman"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin mengirim jawaban? Pastikan Anda telah menjawab semua soal dengan benar.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Perhatian:</strong> Setelah mengirim, Anda tidak dapat mengubah jawaban lagi.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Batal
            </Button>
            <Button onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700 text-white">
              Ya, Kirim Jawaban
            </Button>
          </div>
        </div>
      </Modal>
    </TenantLayout>
  );
}

