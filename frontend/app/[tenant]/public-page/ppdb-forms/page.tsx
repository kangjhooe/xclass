'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { publicPageAdminApi, PPDBForm, PPDBFormStatus } from '@/lib/api/public-page';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { UserPlus, Eye, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function PPDBFormsPage() {
  const tenantId = useTenantId();
  const [selectedForm, setSelectedForm] = useState<PPDBForm | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: PPDBFormStatus.UNDER_REVIEW,
    reviewNotes: '',
  });
  const [statusFilter, setStatusFilter] = useState<PPDBFormStatus | ''>('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ppdb-forms', tenantId, statusFilter],
    queryFn: () => publicPageAdminApi.getPPDBForms(tenantId!, { status: statusFilter || undefined }),
    enabled: !!tenantId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ formId, data }: { formId: number; data: any }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return publicPageAdminApi.reviewPPDBForm(tenantId, formId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-forms', tenantId] });
      setIsReviewModalOpen(false);
      setReviewData({ status: PPDBFormStatus.UNDER_REVIEW, reviewNotes: '' });
      setSelectedForm(null);
    },
  });

  const handleReview = (form: PPDBForm) => {
    setSelectedForm(form);
    setReviewData({
      status: form.status === PPDBFormStatus.SUBMITTED ? PPDBFormStatus.UNDER_REVIEW : form.status,
      reviewNotes: form.reviewNotes || '',
    });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedForm || !reviewData.reviewNotes.trim()) {
      alert('Mohon isi catatan review');
      return;
    }
    reviewMutation.mutate({ formId: selectedForm.id, data: reviewData });
  };

  const forms = data?.data || [];
  const statusCounts = {
    submitted: forms.filter((f) => f.status === PPDBFormStatus.SUBMITTED).length,
    underReview: forms.filter((f) => f.status === PPDBFormStatus.UNDER_REVIEW).length,
    accepted: forms.filter((f) => f.status === PPDBFormStatus.ACCEPTED).length,
    rejected: forms.filter((f) => f.status === PPDBFormStatus.REJECTED).length,
    waitlisted: forms.filter((f) => f.status === PPDBFormStatus.WAITLISTED).length,
  };

  const getStatusBadge = (status: PPDBFormStatus) => {
    const badges = {
      [PPDBFormStatus.SUBMITTED]: (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Dikirim
        </span>
      ),
      [PPDBFormStatus.UNDER_REVIEW]: (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Direview
        </span>
      ),
      [PPDBFormStatus.ACCEPTED]: (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Diterima
        </span>
      ),
      [PPDBFormStatus.REJECTED]: (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Ditolak
        </span>
      ),
      [PPDBFormStatus.WAITLISTED]: (
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Waiting List
        </span>
      ),
    };
    return badges[status] || null;
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="public-page"
        title="PPDB Forms"
        description="Kelola pendaftaran peserta didik baru"
      >
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Dikirim</p>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.submitted}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Direview</p>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.underReview}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Diterima</p>
            <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Ditolak</p>
            <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Waiting List</p>
            <p className="text-2xl font-bold text-purple-600">{statusCounts.waitlisted}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PPDBFormStatus | '')}
            options={[
              { value: '', label: 'Semua Status' },
              { value: PPDBFormStatus.SUBMITTED, label: 'Dikirim' },
              { value: PPDBFormStatus.UNDER_REVIEW, label: 'Direview' },
              { value: PPDBFormStatus.ACCEPTED, label: 'Diterima' },
              { value: PPDBFormStatus.REJECTED, label: 'Ditolak' },
              { value: PPDBFormStatus.WAITLISTED, label: 'Waiting List' },
            ]}
          />
        </div>

        {/* Forms List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada pendaftaran</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`bg-white border rounded-lg p-6 ${
                  form.status === PPDBFormStatus.SUBMITTED ? 'border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{form.studentName}</h3>
                      {getStatusBadge(form.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">NIK</p>
                        <p className="font-medium">{form.studentNIK}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Lahir</p>
                        <p className="font-medium">
                          {formatDate(form.studentBirthDate)} ({form.studentBirthPlace})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jenis Kelamin</p>
                        <p className="font-medium">{form.studentGender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kelas yang Diinginkan</p>
                        <p className="font-medium">{form.desiredClass}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Orang Tua/Wali</p>
                        <p className="font-medium">{form.parentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kontak</p>
                        <p className="font-medium">
                          {form.parentPhone} / {form.parentEmail}
                        </p>
                      </div>
                    </div>

                    {form.studentAddress && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="text-gray-900">{form.studentAddress}</p>
                      </div>
                    )}

                    {form.previousSchool && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Sekolah Asal</p>
                        <p className="text-gray-900">{form.previousSchool}</p>
                      </div>
                    )}

                    {form.reviewNotes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                        <p className="text-sm font-medium text-yellow-900 mb-1">Catatan Review:</p>
                        <p className="text-sm text-yellow-800">{form.reviewNotes}</p>
                        {form.reviewedAt && (
                          <p className="text-xs text-yellow-600 mt-2">
                            Direview pada: {formatDate(form.reviewedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      Dikirim: {formatDate(form.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(form)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewData({ status: PPDBFormStatus.UNDER_REVIEW, reviewNotes: '' });
            setSelectedForm(null);
          }}
          title="Review Pendaftaran"
          size="large"
        >
          {selectedForm && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Calon Siswa:</p>
                <p className="text-gray-900 font-semibold">{selectedForm.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Kelas yang Diinginkan:</p>
                <p className="text-gray-900">{selectedForm.desiredClass}</p>
              </div>

              <Select
                label="Status"
                value={reviewData.status}
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as PPDBFormStatus })}
                options={[
                  { value: PPDBFormStatus.UNDER_REVIEW, label: 'Direview' },
                  { value: PPDBFormStatus.ACCEPTED, label: 'Diterima' },
                  { value: PPDBFormStatus.REJECTED, label: 'Ditolak' },
                  { value: PPDBFormStatus.WAITLISTED, label: 'Waiting List' },
                ]}
              />

              <Textarea
                label="Catatan Review *"
                value={reviewData.reviewNotes}
                onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                rows={6}
                required
                placeholder="Tulis catatan review Anda di sini..."
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setReviewData({ status: PPDBFormStatus.UNDER_REVIEW, reviewNotes: '' });
                    setSelectedForm(null);
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleSubmitReview} loading={reviewMutation.isPending}>
                  Simpan Review
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

