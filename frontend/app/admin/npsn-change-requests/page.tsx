'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { useToastStore } from '@/lib/store/toast';
import {
  npsnChangeRequestApi,
  NpsnChangeRequest,
  NpsnChangeRequestStatus,
} from '@/lib/api/npsn-change-request';
import { formatDate } from '@/lib/utils/date';

export default function NpsnChangeRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [requests, setRequests] = useState<NpsnChangeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NpsnChangeRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await npsnChangeRequestApi.getAll();
      setRequests(response.data);
    } catch (error: any) {
      showError('Gagal memuat data request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      await npsnChangeRequestApi.approve(selectedRequest.id, {
        status: NpsnChangeRequestStatus.APPROVED,
        reviewNote: reviewNote || undefined,
      });
      success('Request berhasil disetujui');
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      setReviewNote('');
      loadRequests();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Gagal menyetujui request';
      showError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!reviewNote.trim()) {
      showError('Catatan penolakan wajib diisi');
      return;
    }

    try {
      setProcessing(true);
      await npsnChangeRequestApi.reject(selectedRequest.id, {
        status: NpsnChangeRequestStatus.REJECTED,
        reviewNote,
      });
      success('Request berhasil ditolak');
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setReviewNote('');
      loadRequests();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Gagal menolak request';
      showError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const openApproveModal = (request: NpsnChangeRequest) => {
    setSelectedRequest(request);
    setReviewNote('');
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (request: NpsnChangeRequest) => {
    setSelectedRequest(request);
    setReviewNote('');
    setIsRejectModalOpen(true);
  };

  const getStatusBadge = (status: NpsnChangeRequestStatus) => {
    const statusConfig = {
      [NpsnChangeRequestStatus.PENDING]: {
        label: 'Menunggu Persetujuan',
        className: 'bg-yellow-100 text-yellow-800',
      },
      [NpsnChangeRequestStatus.APPROVED]: {
        label: 'Disetujui',
        className: 'bg-green-100 text-green-800',
      },
      [NpsnChangeRequestStatus.REJECTED]: {
        label: 'Ditolak',
        className: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const pendingRequests = requests.filter(
    (r) => r.status === NpsnChangeRequestStatus.PENDING,
  );

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Request Perubahan NPSN
          </h1>
          <p className="text-gray-600">
            Kelola request perubahan NPSN dari admin tenant
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Ada {pendingRequests.length} request yang menunggu persetujuan
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Request
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Belum ada request perubahan NPSN
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NPSN Lama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NPSN Baru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alasan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diajukan Oleh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.tenant?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.currentNpsn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestedNpsn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requestedBy?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {request.status === NpsnChangeRequestStatus.PENDING && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openApproveModal(request)}
                            >
                              Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openRejectModal(request)}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {request.status === NpsnChangeRequestStatus.APPROVED &&
                          request.reviewedBy && (
                            <div className="text-xs text-gray-500">
                              Disetujui oleh: {request.reviewedBy.name}
                            </div>
                          )}
                        {request.status === NpsnChangeRequestStatus.REJECTED &&
                          request.reviewNote && (
                            <div className="text-xs text-red-600 max-w-xs">
                              {request.reviewNote}
                            </div>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedRequest(null);
          setReviewNote('');
        }}
        title="Setujui Request Perubahan NPSN"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Apakah Anda yakin ingin menyetujui perubahan NPSN dari{' '}
              <strong>{selectedRequest?.currentNpsn}</strong> menjadi{' '}
              <strong>{selectedRequest?.requestedNpsn}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Tenant: <strong>{selectedRequest?.tenant?.name}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsApproveModalOpen(false);
              setSelectedRequest(null);
              setReviewNote('');
            }}
          >
            Batal
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={processing}
          >
            {processing ? 'Menyetujui...' : 'Setujui'}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRequest(null);
          setReviewNote('');
        }}
        title="Tolak Request Perubahan NPSN"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Apakah Anda yakin ingin menolak perubahan NPSN dari{' '}
              <strong>{selectedRequest?.currentNpsn}</strong> menjadi{' '}
              <strong>{selectedRequest?.requestedNpsn}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Tenant: <strong>{selectedRequest?.tenant?.name}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Jelaskan alasan penolakan"
              rows={4}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsRejectModalOpen(false);
              setSelectedRequest(null);
              setReviewNote('');
            }}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={processing || !reviewNote.trim()}
          >
            {processing ? 'Menolak...' : 'Tolak'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

