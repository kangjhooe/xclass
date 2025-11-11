'use client';

import { useEffect, useMemo, useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { tenantAccessApi, TenantAccessRecord } from '@/lib/api/tenantAccess';
import { useToastStore } from '@/lib/store/toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils/date';

type ModalMode = 'approve' | 'reject' | 'revoke' | null;

export default function AdminAccessPage() {
  const { success, error: showError } = useToastStore();
  const [requests, setRequests] = useState<TenantAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRequest, setSelectedRequest] = useState<TenantAccessRecord | null>(null);
  const [form, setForm] = useState({
    note: '',
    expiresAt: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await tenantAccessApi.getTenantRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading tenant access requests:', err);
      showError(err?.response?.data?.message || 'Gagal memuat permintaan akses');
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending'),
    [requests],
  );

  const activeGrants = useMemo(
    () => requests.filter((request) => request.status === 'approved'),
    [requests],
  );

  const historyRequests = useMemo(
    () =>
      requests.filter((request) =>
        ['rejected', 'revoked', 'expired', 'cancelled'].includes(request.status),
      ),
    [requests],
  );

  const openModal = (mode: ModalMode, request: TenantAccessRecord) => {
    setModalMode(mode);
    setSelectedRequest(request);
    setForm({
      note: '',
      expiresAt: '',
      reason: '',
    });
  };

  const closeModal = () => {
    if (submitting) return;
    setModalMode(null);
    setSelectedRequest(null);
  };

  const submitModal = async () => {
    if (!selectedRequest || !modalMode) return;
    try {
      setSubmitting(true);
      if (modalMode === 'approve') {
        if (!form.note.trim()) {
          showError('Catatan persetujuan wajib diisi');
          setSubmitting(false);
          return;
        }
        await tenantAccessApi.approveAccessRequest(selectedRequest.id, {
          note: form.note.trim(),
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        });
        success('Permintaan akses disetujui');
      } else if (modalMode === 'reject') {
        if (!form.reason.trim()) {
          showError('Alasan penolakan wajib diisi');
          setSubmitting(false);
          return;
        }
        await tenantAccessApi.rejectAccessRequest(selectedRequest.id, {
          reason: form.reason.trim(),
        });
        success('Permintaan akses ditolak');
      } else if (modalMode === 'revoke') {
        await tenantAccessApi.revokeAccessGrant(selectedRequest.id, {
          reason: form.reason.trim() || undefined,
        });
        success('Akses super admin dicabut');
      }
      closeModal();
      loadRequests();
    } catch (err: any) {
      console.error('Error submitting tenant access action:', err);
      showError(err?.response?.data?.message || 'Gagal memproses permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Akses Super Admin</h1>
          <p className="text-sm text-gray-600 mt-2">
            Kelola permintaan dan akses yang diberikan kepada tim super admin CLASS.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Permintaan Menunggu Persetujuan</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tinjau dan putuskan permintaan akses yang diajukan oleh super admin.
            </p>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <EmptyState
                title="Tidak ada permintaan"
                description="Belum ada permintaan akses baru dari super admin."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Super Admin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alasan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diajukan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {request.superAdmin?.name || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div>{request.superAdmin?.email}</div>
                          {request.superAdmin?.phone && <div>{request.superAdmin.phone}</div>}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {request.reason || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDateTime(request.requestedAt)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium space-x-2">
                          <Button size="sm" onClick={() => openModal('approve', request)}>
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal('reject', request)}
                          >
                            Tolak
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Akses Aktif</h2>
            <p className="text-sm text-gray-500 mt-1">
              Super admin yang saat ini memiliki akses ke tenant Anda.
            </p>
          </div>
          <div className="p-6">
            {activeGrants.length === 0 ? (
              <EmptyState
                title="Tidak ada akses aktif"
                description="Belum ada super admin yang memiliki akses ke tenant Anda."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Super Admin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disetujui
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catatan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batas Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeGrants.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          <div>{request.superAdmin?.name || '-'}</div>
                          <div className="text-xs text-gray-500">{request.superAdmin?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {request.approvedAt ? formatDateTime(request.approvedAt) : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {request.responseNote || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {request.expiresAt ? formatDateTime(request.expiresAt) : 'Tidak dibatasi'}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal('revoke', request)}
                          >
                            Cabut Akses
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Permintaan</h2>
            <p className="text-sm text-gray-500 mt-1">
              Catatan permintaan yang ditolak, dicabut, atau kedaluwarsa.
            </p>
          </div>
          <div className="p-6">
            {historyRequests.length === 0 ? (
              <EmptyState
                title="Belum ada riwayat"
                description="Riwayat akan muncul setelah permintaan akses diproses."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Super Admin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {request.superAdmin?.name || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 capitalize">
                          {request.status}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {request.status === 'rejected' && request.rejectionReason
                            ? request.rejectionReason
                            : request.responseNote || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDateTime(request.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={
          modalMode === 'approve'
            ? 'Setujui Permintaan Akses'
            : modalMode === 'reject'
            ? 'Tolak Permintaan Akses'
            : modalMode === 'revoke'
            ? 'Cabut Akses Super Admin'
            : ''
        }
      >
        {modalMode && selectedRequest && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Super admin: <span className="font-semibold">{selectedRequest.superAdmin?.name}</span>
            </div>
            {modalMode === 'approve' && (
              <>
                <Textarea
                  label="Catatan untuk super admin"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={4}
                  placeholder="Contoh: Akses diberikan untuk membantu konfigurasi modul keuangan"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Waktu Akses (opsional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jika diisi, akses akan otomatis berakhir pada waktu tersebut.
                  </p>
                </div>
              </>
            )}
            {modalMode === 'reject' && (
              <Textarea
                label="Alasan penolakan"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={4}
                placeholder="Jelaskan alasan penolakan permintaan"
                required
              />
            )}
            {modalMode === 'revoke' && (
              <Textarea
                label="Catatan (opsional)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                placeholder="Catatan akan disampaikan ke super admin"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={submitting}>
                Batal
              </Button>
              <Button onClick={submitModal} disabled={submitting}>
                {submitting ? 'Memproses...' : 'Simpan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </TenantLayout>
  );
}

