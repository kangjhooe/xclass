'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { useToastStore } from '@/lib/store/toast';
import {
  npsnChangeRequestApi,
  NpsnChangeRequest,
  NpsnChangeRequestStatus,
} from '@/lib/api/npsn-change-request';
import { adminApi } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils/date';

export default function NpsnChangePage() {
  const params = useParams();
  const tenantId = params?.tenant as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNpsn, setCurrentNpsn] = useState('');
  const [requests, setRequests] = useState<NpsnChangeRequest[]>([]);
  const [formData, setFormData] = useState({
    requestedNpsn: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load current tenant info
      const tenantResponse = await adminApi.getAllTenants();
      const tenant = tenantResponse.data.data.find(
        (t) => t.npsn === tenantId || t.id.toString() === tenantId,
      );
      if (tenant) {
        setCurrentNpsn(tenant.npsn);
      }

      // Load requests
      const requestsResponse = await npsnChangeRequestApi.getAll();
      setRequests(requestsResponse.data);
    } catch (error: any) {
      showError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.requestedNpsn.trim()) {
      newErrors.requestedNpsn = 'NPSN baru wajib diisi';
    } else if (formData.requestedNpsn.length < 8) {
      newErrors.requestedNpsn = 'NPSN harus minimal 8 karakter';
    } else if (formData.requestedNpsn === currentNpsn) {
      newErrors.requestedNpsn = 'NPSN baru harus berbeda dengan NPSN saat ini';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Alasan perubahan wajib diisi';
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Alasan harus minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await npsnChangeRequestApi.create(formData);
      success('Request perubahan NPSN berhasil diajukan');
      setIsModalOpen(false);
      setFormData({ requestedNpsn: '', reason: '' });
      setErrors({});
      loadData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Gagal mengajukan request perubahan NPSN';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    if (confirm('Apakah Anda yakin ingin membatalkan request ini?')) {
      npsnChangeRequestApi
        .cancel(id)
        .then(() => {
          success('Request berhasil dibatalkan');
          loadData();
        })
        .catch((error: any) => {
          showError('Gagal membatalkan request');
        });
    }
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

  const hasPendingRequest = requests.some(
    (r) => r.status === NpsnChangeRequestStatus.PENDING,
  );

  if (loading) {
    return (
      <TenantLayout>
        <Loading />
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Perubahan NPSN
          </h1>
          <p className="text-gray-600">
            Ajukan perubahan NPSN untuk tenant Anda. Perubahan harus disetujui
            oleh super admin.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NPSN Saat Ini
            </label>
            <Input
              type="text"
              value={currentNpsn}
              disabled
              className="bg-gray-50"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={hasPendingRequest}
            className="w-full sm:w-auto"
          >
            {hasPendingRequest
              ? 'Ada Request yang Pending'
              : 'Ajukan Perubahan NPSN'}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Request
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
                      NPSN Lama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NPSN Baru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alasan
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
                        {request.currentNpsn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestedNpsn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === NpsnChangeRequestStatus.PENDING && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(request.id)}
                          >
                            Batal
                          </Button>
                        )}
                        {request.status === NpsnChangeRequestStatus.REJECTED &&
                          request.reviewNote && (
                            <div className="text-xs text-red-600">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ requestedNpsn: '', reason: '' });
          setErrors({});
        }}
        title="Ajukan Perubahan NPSN"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPSN Baru <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.requestedNpsn}
                onChange={(e) => {
                  setFormData({ ...formData, requestedNpsn: e.target.value });
                  if (errors.requestedNpsn) {
                    setErrors({ ...errors, requestedNpsn: '' });
                  }
                }}
                placeholder="Masukkan NPSN baru (minimal 8 karakter)"
                error={errors.requestedNpsn}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Perubahan <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.reason}
                onChange={(e) => {
                  setFormData({ ...formData, reason: e.target.value });
                  if (errors.reason) {
                    setErrors({ ...errors, reason: '' });
                  }
                }}
                placeholder="Jelaskan alasan perubahan NPSN (minimal 10 karakter)"
                rows={4}
                error={errors.reason}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ requestedNpsn: '', reason: '' });
                setErrors({});
              }}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Mengajukan...' : 'Ajukan Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

