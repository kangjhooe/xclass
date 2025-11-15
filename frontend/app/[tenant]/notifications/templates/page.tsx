'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  notificationApi,
  NotificationTemplate,
  NotificationTemplateCreateData,
} from '@/lib/api/notification';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function NotificationTemplatesPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; content: string } | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<NotificationTemplateCreateData>({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    variables: [],
  });
  const [variableInput, setVariableInput] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-templates', tenantId],
    queryFn: () => notificationApi.getTemplates(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: NotificationTemplateCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return notificationApi.createTemplate(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Gagal membuat template');
    },
  });

  const addVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput.trim()],
      });
      setVariableInput('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
    });
    setVariableInput('');
    setEditingTemplate(null);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
    });
    setIsModalOpen(true);
  };

  const handlePreview = (template: NotificationTemplate) => {
    // Replace variables with sample data
    let subject = template.subject;
    let content = template.content;
    template.variables?.forEach((variable) => {
      const sampleValue = `[${variable}]`;
      subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
    });
    setPreviewData({ subject, content });
    setIsPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama template harus diisi');
      return;
    }

    if (!formData.content.trim()) {
      alert('Content template harus diisi');
      return;
    }

    if (formData.type !== 'sms' && !formData.subject.trim()) {
      alert('Subject harus diisi untuk tipe ' + formData.type);
      return;
    }

    createMutation.mutate(formData);
  };

  const templates = data?.data || [];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="notifications"
        title="Template Notifikasi"
        description="Kelola template pesan untuk notifikasi (Email, SMS, WhatsApp, Push)"
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Template
          </Button>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada template</p>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                  Tambah Template Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {template.type.toUpperCase()}
                          </span>
                          {template.isActive ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Subject:</span> {template.subject}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">{template.content}</p>
                        {template.variables && template.variables.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {template.variables.map((variable) => (
                              <span
                                key={variable}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                              >
                                {`{{${variable}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Template"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Welcome Email"
            />

            <Select
              label="Tipe Template"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'push', label: 'Push Notification' },
              ]}
            />

            {formData.type !== 'sms' && (
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required={formData.type !== 'sms'}
                placeholder="Subject pesan"
              />
            )}

            <Textarea
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={8}
              placeholder="Isi pesan. Gunakan {{variable}} untuk variable dinamis"
              helpText="Gunakan {{variable}} untuk variable yang akan diganti saat pengiriman"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={variableInput}
                  onChange={(e) => setVariableInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addVariable();
                    }
                  }}
                  placeholder="Nama variable (tanpa {{}})"
                />
                <Button type="button" onClick={addVariable}>
                  Tambah
                </Button>
              </div>
              {formData.variables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {`{{${variable}}}`}
                      <button
                        type="button"
                        onClick={() => removeVariable(variable)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {editingTemplate ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Preview Template"
        >
          {previewData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="p-3 bg-gray-50 rounded border">{previewData.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                  {previewData.content}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

