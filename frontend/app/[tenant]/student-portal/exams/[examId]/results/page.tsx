'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { examsApi, ExamAttempt, ExamQuestion } from '@/lib/api/exams';
import { formatDate } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';
import { studentsApi } from '@/lib/api/students';

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = useTenantId();
  const examId = params?.examId as string;
  const scheduleId = searchParams?.get('scheduleId');

  const [showDetails, setShowDetails] = useState(false);

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

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['student-attempts', studentId],
    queryFn: () => examsApi.getStudentAttempts(studentId!),
    enabled: !!studentId,
  });

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(tenantId!, parseInt(examId)),
    enabled: !!tenantId && !!examId,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['exam-questions', examId],
    queryFn: () => examsApi.getQuestions(parseInt(examId)),
    enabled: !!examId,
  });

  // Find the attempt for this exam
  const attempt = attempts?.find((a) => a.examId === parseInt(examId) && a.status === 'completed');

  if (attemptsLoading || examLoading || questionsLoading) {
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

  if (!attempt || !exam) {
    return (
      <TenantLayout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Hasil Ujian Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Anda belum menyelesaikan ujian ini atau hasil belum tersedia.</p>
          <Button onClick={() => router.push(`/${params.tenant}/student-portal/exams`)}>
            Kembali ke Daftar Ujian
          </Button>
        </div>
      </TenantLayout>
    );
  }

  const scorePercentage = attempt.totalQuestions > 0 ? (attempt.correctAnswers / attempt.totalQuestions) * 100 : 0;
  const isPassed = exam.passingScore ? scorePercentage >= exam.passingScore : false;
  const answerOrder = attempt.answerOrder || {};

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`;
    }
    return `${minutes}m ${secs}d`;
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Results Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h1>
            <p className="text-gray-600">Hasil Ujian Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-violet-600 mb-2">{scorePercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Nilai</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {attempt.correctAnswers} / {attempt.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Jawaban Benar</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{formatTime(attempt.timeSpent)}</div>
              <div className="text-sm text-gray-600">Waktu Pengerjaan</div>
            </div>
          </div>

          <div className="text-center">
            <div
              className={`inline-block px-6 py-3 rounded-full font-semibold ${
                isPassed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              }`}
            >
              {isPassed ? '✓ LULUS' : '✗ TIDAK LULUS'}
            </div>
            {exam.passingScore && (
              <p className="text-sm text-gray-600 mt-2">
                Nilai Kelulusan: {exam.passingScore}%
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Waktu Mulai:</span>
              <p className="font-medium text-gray-800">{formatDate(attempt.startedAt || '')}</p>
            </div>
            <div>
              <span className="text-gray-500">Waktu Selesai:</span>
              <p className="font-medium text-gray-800">{formatDate(attempt.submittedAt || '')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="border-violet-300 text-violet-600 hover:bg-violet-50"
          >
            {showDetails ? 'Sembunyikan' : 'Tampilkan'} Detail Jawaban
          </Button>
          <Button
            onClick={() => router.push(`/${params.tenant}/student-portal/exams`)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            Kembali ke Daftar Ujian
          </Button>
        </div>

        {/* Detailed Results */}
        {showDetails && questions && exam.showCorrectAnswers && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Jawaban</h2>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const answerData = answerOrder[question.id];
                const userAnswer = answerData?.answer || '-';
                const isCorrect = answerData?.isCorrect || false;

                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-lg p-6 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                          Soal {index + 1}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {isCorrect ? 'Benar' : 'Salah'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{question.points} poin</span>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-4">{question.questionText}</h3>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Jawaban Anda:</span>
                        <p className="text-gray-800 mt-1">
                          {question.questionType === 'multiple_choice' && question.options
                            ? question.options[userAnswer] || userAnswer
                            : userAnswer}
                        </p>
                      </div>
                      {question.correctAnswer && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Jawaban Benar:</span>
                          <p className="text-gray-800 mt-1">
                            {question.questionType === 'multiple_choice' && question.options
                              ? question.options[question.correctAnswer] || question.correctAnswer
                              : question.correctAnswer}
                          </p>
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-800">Penjelasan:</span>
                          <p className="text-blue-700 mt-1 text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showDetails && (!exam.showCorrectAnswers || !questions) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              Detail jawaban tidak tersedia. Pengaturan ujian tidak mengizinkan melihat jawaban yang benar.
            </p>
          </div>
        )}
      </div>
    </TenantLayout>
  );
}

