'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { publicPageAdminApi, ContactForm, ContactFormStatus } from '@/lib/api/public-page';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { Mail, Eye, Reply, CheckCircle, Clock, Archive } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function ContactFormsPage() {
  const tenantId = useTenantId();
  const [selectedForm, setSelectedForm] = useState<ContactForm | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactFormStatus | ''>('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contact-forms', tenantId, statusFilter],
    queryFn: () => publicPageAdminApi.getContactForms(tenantId!, { status: statusFilter || undefined }),
    enabled: !!tenantId,
  });

  const replyMutation = useMutation({
    mutationFn: ({ formId, reply }: { formId: number; reply: string }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return publicPageAdminApi.replyToContactForm(tenantId, formId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-forms', tenantId] });
      setIsReplyModalOpen(false);
      setReplyText('');
      setSelectedForm(null);
    },
  });

  const handleReply = (form: ContactForm) => {
    setSelectedForm(form);
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = () => {
    if (!selectedForm || !replyText.trim()) {
      alert('Mohon isi balasan');
      return;
    }
    replyMutation.mutate({ formId: selectedForm.id, reply: replyText });
  };

  const forms = data?.data || [];
  const statusCounts = {
    new: forms.filter((f) => f.status === ContactFormStatus.NEW).length,
    read: forms.filter((f) => f.status === ContactFormStatus.READ).length,
    replied: forms.filter((f) => f.status === ContactFormStatus.REPLIED).length,
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="public-page"
        title="Contact Forms"
        description="Kelola pesan dari formulir kontak publik"
      >
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesan Baru</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.new}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Dibaca</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.read}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Dibalas</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.replied}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContactFormStatus | '')}
            options={[
              { value: '', label: 'Semua Status' },
              { value: ContactFormStatus.NEW, label: 'Baru' },
              { value: ContactFormStatus.READ, label: 'Sudah Dibaca' },
              { value: ContactFormStatus.REPLIED, label: 'Sudah Dibalas' },
              { value: ContactFormStatus.ARCHIVED, label: 'Diarsipkan' },
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
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada pesan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`bg-white border rounded-lg p-6 ${
                  form.status === ContactFormStatus.NEW ? 'border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{form.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {form.email}
                      </span>
                      {form.phone && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {form.phone}
                        </span>
                      )}
                      {form.status === ContactFormStatus.NEW && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Baru
                        </span>
                      )}
                      {form.status === ContactFormStatus.REPLIED && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Sudah Dibalas
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{form.subject}</p>
                    <p className="text-gray-600 mb-3">{form.message}</p>
                    {form.reply && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                        <p className="text-sm font-medium text-green-900 mb-1">Balasan:</p>
                        <p className="text-sm text-green-800">{form.reply}</p>
                        {form.repliedAt && (
                          <p className="text-xs text-green-600 mt-2">
                            Dibalas pada: {formatDate(form.repliedAt)}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Dikirim: {formatDate(form.createdAt)}
                    </p>
                  </div>
                  {form.status !== ContactFormStatus.REPLIED && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(form)}
                      className="flex items-center gap-2"
                    >
                      <Reply className="w-4 h-4" />
                      Balas
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Modal */}
        <Modal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setReplyText('');
            setSelectedForm(null);
          }}
          title="Balas Pesan"
        >
          {selectedForm && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Dari:</p>
                <p className="text-gray-900">{selectedForm.name} ({selectedForm.email})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Subjek:</p>
                <p className="text-gray-900">{selectedForm.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Pesan:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedForm.message}</p>
              </div>
              <Textarea
                label="Balasan"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                required
                placeholder="Tulis balasan Anda di sini..."
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setReplyText('');
                    setSelectedForm(null);
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleSubmitReply} loading={replyMutation.isPending}>
                  Kirim Balasan
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

