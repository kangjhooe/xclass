'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { examsApi } from '@/lib/api/exams';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ItemAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = useTenantId();
  const examId = params?.examId as string;

  const queryClient = useQueryClient();

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(tenantId!, parseInt(examId)),
    enabled: !!tenantId && !!examId,
  });

  const { data: analyses, isLoading: analysesLoading, refetch: refetchAnalyses } = useQuery({
    queryKey: ['item-analyses', examId],
    queryFn: () => examsApi.getAllItemAnalyses(parseInt(examId)),
    enabled: !!examId,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => examsApi.analyzeExamQuestions(parseInt(examId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-analyses', examId] });
      alert('Analisis butir soal berhasil dilakukan!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal melakukan analisis butir soal');
    },
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.3) return 'text-red-600 bg-red-50';
    if (difficulty > 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.3) return 'Sulit';
    if (difficulty > 0.7) return 'Mudah';
    return 'Sedang';
  };

  const getDiscriminationColor = (discrimination: number) => {
    if (discrimination < 0.2) return 'text-red-600 bg-red-50';
    if (discrimination > 0.4) return 'text-green-600 bg-green-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getDiscriminationLabel = (discrimination: number) => {
    if (discrimination < 0.2) return 'Rendah';
    if (discrimination > 0.4) return 'Sangat Baik';
    return 'Baik';
  };

  return (
    <TenantLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analisis Butir Soal</h1>
            <p className="text-gray-600 mt-1">{exam?.title}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/${params.tenant}/exams/${examId}`)}
            >
              Kembali
            </Button>
            <Button
              onClick={() => analyzeMutation.mutate()}
              loading={analyzeMutation.isPending}
            >
              Jalankan Analisis
            </Button>
          </div>
        </div>

        {analysesLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat data analisis...</p>
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 mb-4">
              Belum ada analisis butir soal. Klik tombol "Jalankan Analisis" untuk memulai.
            </p>
            <p className="text-sm text-blue-600">
              Pastikan sudah ada siswa yang menyelesaikan ujian ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {analyses.map((analysis: any, index: number) => (
              <div key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Soal {index + 1}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {analysis.question?.questionText?.substring(0, 100)}
                      {analysis.question?.questionText?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Mencoba</p>
                    <p className="text-2xl font-bold text-gray-800">{analysis.totalAttempts}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Benar</p>
                    <p className="text-2xl font-bold text-green-600">{analysis.correctAnswers}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Salah</p>
                    <p className="text-2xl font-bold text-red-600">{analysis.incorrectAnswers}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Kosong</p>
                    <p className="text-2xl font-bold text-yellow-600">{analysis.blankAnswers}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`rounded-lg p-4 ${getDifficultyColor(analysis.difficultyIndex)}`}>
                    <p className="text-sm font-medium mb-1">Indeks Kesulitan</p>
                    <p className="text-2xl font-bold">
                      {(analysis.difficultyIndex * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm mt-1">{getDifficultyLabel(analysis.difficultyIndex)}</p>
                  </div>
                  <div className={`rounded-lg p-4 ${getDiscriminationColor(analysis.discriminationIndex)}`}>
                    <p className="text-sm font-medium mb-1">Daya Pembeda</p>
                    <p className="text-2xl font-bold">
                      {analysis.discriminationIndex > 0 ? '+' : ''}
                      {(analysis.discriminationIndex * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm mt-1">{getDiscriminationLabel(analysis.discriminationIndex)}</p>
                  </div>
                </div>

                {analysis.optionStatistics && Object.keys(analysis.optionStatistics).length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Statistik Pilihan Jawaban:</p>
                    <div className="space-y-2">
                      {Object.entries(analysis.optionStatistics).map(([key, stat]: [string, any]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            stat.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {key}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">
                                Dipilih: {stat.selected} siswa
                              </span>
                              <span className="text-gray-600">
                                {stat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  stat.isCorrect ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${stat.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.topGroupStats && analysis.bottomGroupStats && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">Kelompok Atas (27% Terbaik)</p>
                      <p className="text-lg font-bold text-blue-600">
                        {analysis.topGroupStats.correct} / {analysis.topGroupStats.total}
                      </p>
                      <p className="text-sm text-blue-600">
                        {analysis.topGroupStats.percentage.toFixed(1)}% benar
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-orange-800 mb-2">Kelompok Bawah (27% Terburuk)</p>
                      <p className="text-lg font-bold text-orange-600">
                        {analysis.bottomGroupStats.correct} / {analysis.bottomGroupStats.total}
                      </p>
                      <p className="text-sm text-orange-600">
                        {analysis.bottomGroupStats.percentage.toFixed(1)}% benar
                      </p>
                    </div>
                  </div>
                )}

                {analysis.analysis && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Analisis & Rekomendasi:</p>
                    <p className="text-sm text-yellow-700">{analysis.analysis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}

