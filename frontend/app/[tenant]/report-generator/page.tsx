'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { reportGeneratorApi, ReportTemplate, ReportTemplateCreateData } from '@/lib/api/report-generator';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ReportGeneratorPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedTemplateForGenerate, setSelectedTemplateForGenerate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState<ReportTemplateCreateData>({
    name: '',
    description: '',
    query: '',
    fields: [],
    filters: {},
    format: 'pdf',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['report-templates', tenantId],
    queryFn: () => reportGeneratorApi.getAllTemplates(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: ReportTemplateCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return reportGeneratorApi.createTemplate(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ReportTemplateCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return reportGeneratorApi.updateTemplate(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates', tenantId] });
      setIsModalOpen(false);
      setSelectedTemplate(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return reportGeneratorApi.deleteTemplate(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates', tenantId] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (templateId: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return reportGeneratorApi.generate(tenantId, templateId);
    },
    onSuccess: () => {
      setIsGenerateModalOpen(false);
      setSelectedTemplateForGenerate(null);
      alert('Laporan berhasil di-generate!');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      query: '',
      fields: [],
      filters: {},
      format: 'pdf',
    });
    setSelectedTemplate(null);
  };

  const handleEdit = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      query: template.query || '',
      fields: template.fields || [],
      filters: template.filters || {},
      format: template.format || 'pdf',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalTemplates = data?.data?.length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Generator Laporan
              </h1>
              <p className="text-gray-600">Buat template laporan custom</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Template</p>
                <p className="text-3xl font-bold text-blue-600">{totalTemplates}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-gray-700">Nama Template</TableHead>
                    <TableHead className="font-semibold text-gray-700">Deskripsi</TableHead>
                    <TableHead className="font-semibold text-gray-700">Format</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Dibuat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((template) => (
                    <TableRow key={template.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{template.name}</TableCell>
                      <TableCell className="max-w-md truncate" title={template.description}>
                        {template.description || '-'}
                      </TableCell>
                      <TableCell className="uppercase">{template.format || 'pdf'}</TableCell>
                      <TableCell>{template.created_at ? formatDate(template.created_at) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplateForGenerate(template);
                              setIsGenerateModalOpen(true);
                            }}
                            className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          >
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
                                deleteMutation.mutate(template.id);
                              }
                            }}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada template</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedTemplate ? 'Edit Template' : 'Buat Template Baru'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Query SQL</label>
              <textarea
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="SELECT * FROM students WHERE..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedTemplate ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isGenerateModalOpen}
          onClose={() => {
            setIsGenerateModalOpen(false);
            setSelectedTemplateForGenerate(null);
          }}
          title={`Generate Laporan: ${selectedTemplateForGenerate?.name || ''}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin generate laporan menggunakan template ini?
            </p>
            {selectedTemplateForGenerate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Format:</strong> {selectedTemplateForGenerate.format?.toUpperCase() || 'PDF'}
                </p>
                {selectedTemplateForGenerate.description && (
                  <p className="text-sm text-gray-600">
                    <strong>Deskripsi:</strong> {selectedTemplateForGenerate.description}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsGenerateModalOpen(false);
                  setSelectedTemplateForGenerate(null);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  if (selectedTemplateForGenerate) {
                    generateMutation.mutate(selectedTemplateForGenerate.id);
                  }
                }}
                loading={generateMutation.isPending}
              >
                Generate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </TenantLayout>
  );
}
