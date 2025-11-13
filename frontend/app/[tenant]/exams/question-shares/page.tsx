'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function QuestionSharesPage() {
  const tenantId = useTenantId();
  const [selectedShare, setSelectedShare] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: pendingShares, isLoading } = useQuery({
    queryKey: ['pending-shares', tenantId],
    queryFn: () => examsApi.getPendingShares(),
    enabled: !!tenantId,
  });

  const approveMutation = useMutation({
    mutationFn: (shareId: number) => examsApi.approveQuestionShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shares', tenantId] });
      setIsDetailModalOpen(false);
      setSelectedShare(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (shareId: number) => examsApi.rejectQuestionShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shares', tenantId] });
      setIsDetailModalOpen(false);
      setSelectedShare(null);
    },
  });

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="exams"
        title="Permintaan Berbagi Soal"
        description="Kelola permintaan berbagi soal dari guru lain"
      >
        {({ themeConfig }) => (
          <>
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
                        <TableHead className="font-semibold text-gray-700">Dari Guru</TableHead>
                        <TableHead className="font-semibold text-gray-700">Soal</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingShares && pendingShares.length > 0 ? (
                        pendingShares.map((share: any) => (
                          <TableRow key={share.id} className="hover:bg-violet-50/50 transition-colors">
                            <TableCell className="font-medium text-gray-800">
                              {share.fromTeacher?.name || `Guru #${share.fromTeacherId}`}
                            </TableCell>
                            <TableCell className="max-w-md">
                              <div className="truncate">{share.question?.questionText || 'Soal tidak ditemukan'}</div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {share.shareType === 'copy' && 'Copy'}
                                {share.shareType === 'edit' && 'Edit'}
                                {share.shareType === 'view' && 'View'}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(share.requestedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedShare(share);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Setujui permintaan berbagi soal ini?')) {
                                      approveMutation.mutate(share.id);
                                    }
                                  }}
                                  loading={approveMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Setujui
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Tolak permintaan berbagi soal ini?')) {
                                      rejectMutation.mutate(share.id);
                                    }
                                  }}
                                  loading={rejectMutation.isPending}
                                >
                                  Tolak
                                </Button>
                              </div>
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
                              <p className="text-gray-500 font-medium">Tidak ada permintaan berbagi soal</p>
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedShare(null);
        }}
        title="Detail Permintaan Berbagi Soal"
        size="lg"
      >
        {selectedShare && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Guru</label>
              <p className="text-gray-800">{selectedShare.fromTeacher?.name || `Guru #${selectedShare.fromTeacherId}`}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soal</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{selectedShare.question?.questionText || 'Soal tidak ditemukan'}</p>
                {selectedShare.question && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="mr-4">Tipe: {selectedShare.question.questionType}</span>
                    <span>Level: {selectedShare.question.difficulty}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Berbagi</label>
              <p className="text-gray-800">
                {selectedShare.shareType === 'copy' && 'Copy (Anda bisa menyalin soal ini)'}
                {selectedShare.shareType === 'edit' && 'Edit (Anda bisa mengedit soal ini)'}
                {selectedShare.shareType === 'view' && 'View (Anda hanya bisa melihat soal ini)'}
              </p>
            </div>

            {selectedShare.message && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <p className="text-gray-800">{selectedShare.message}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Permintaan</label>
              <p className="text-gray-800">{formatDate(selectedShare.requestedAt)}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedShare(null);
                }}
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  if (confirm('Setujui permintaan berbagi soal ini?')) {
                    approveMutation.mutate(selectedShare.id);
                  }
                }}
                loading={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Setujui
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Tolak permintaan berbagi soal ini?')) {
                    rejectMutation.mutate(selectedShare.id);
                  }
                }}
                loading={rejectMutation.isPending}
              >
                Tolak
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </TenantLayout>
  );
}

