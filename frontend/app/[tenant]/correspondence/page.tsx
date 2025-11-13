'use client';

import { useMemo, useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  correspondenceApi,
  CorrespondenceArchiveItem,
  CorrespondenceTemplate,
  CreateIncomingPayload,
  CreateOutgoingPayload,
  TemplateVariableDefinition,
  GenerateLetterPayload,
  LetterSequenceConfig,
  UpdateSequencePayload,
} from '@/lib/api/correspondence';
import { storageApi } from '@/lib/api/storage';
import { formatDate } from '@/lib/utils/date';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import clsx from 'clsx';

type FormMode = 'incoming' | 'outgoing';

interface FormState {
  id?: number;
  mode: FormMode;
  nomorSurat: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  category: string;
  status: string;
  description: string;
  file?: File | null;
  filePath?: string | null;
  uploadedFile?: { filename: string; path: string; url: string } | null;
}

const initialFormState: FormState = {
  mode: 'incoming',
  nomorSurat: '',
    subject: '',
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  category: '',
  status: 'baru',
    description: '',
};

export default function CorrespondencePage() {
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    category: 'all',
    search: '',
  });
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CorrespondenceTemplate | null>(null);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] =
    useState<CorrespondenceTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    code: '',
    name: '',
    category: '',
    content: '',
    description: '',
    isActive: true,
    variables: [] as TemplateVariableDefinition[],
  });

  const archiveQuery = useQuery({
    queryKey: ['correspondence-archive', tenantId, filters],
    queryFn: () =>
      correspondenceApi.getArchive(tenantId!, {
        type: filters.type === 'all' ? undefined : filters.type,
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category,
        search: filters.search || undefined,
      }),
    enabled: !!tenantId,
  });

  const statisticsQuery = useQuery({
    queryKey: ['correspondence-statistics', tenantId],
    queryFn: () => correspondenceApi.getStatistics(tenantId!),
    enabled: !!tenantId,
  });

  const templatesQuery = useQuery({
    queryKey: ['correspondence-templates', tenantId],
    queryFn: () => correspondenceApi.getTemplates(tenantId!),
    enabled: !!tenantId,
  });

  const sequencesQuery = useQuery({
    queryKey: ['correspondence-sequences', tenantId],
    queryFn: () => correspondenceApi.getSequences(tenantId!),
    enabled: !!tenantId,
  });

  const generatedQuery = useQuery({
    queryKey: ['correspondence-generated', tenantId],
    queryFn: () => correspondenceApi.getGeneratedLetters(tenantId!),
    enabled: !!tenantId,
  });

  const createIncomingMutation = useMutation({
    mutationFn: (payload: CreateIncomingPayload) =>
      correspondenceApi.createIncoming(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      closeForm();
    },
  });

  const updateIncomingMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateIncomingPayload>;
    }) => correspondenceApi.updateIncoming(tenantId!, id, payload),
    onSuccess: () => {
      invalidateAll();
      closeForm();
    },
  });

  const deleteIncomingMutation = useMutation({
    mutationFn: (id: number) =>
      correspondenceApi.deleteIncoming(tenantId!, id),
    onSuccess: invalidateAll,
  });

  const createOutgoingMutation = useMutation({
    mutationFn: (payload: CreateOutgoingPayload) =>
      correspondenceApi.createOutgoing(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      closeForm();
    },
  });

  const updateOutgoingMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateOutgoingPayload>;
    }) => correspondenceApi.updateOutgoing(tenantId!, id, payload),
    onSuccess: () => {
      invalidateAll();
      closeForm();
    },
  });

  const deleteOutgoingMutation = useMutation({
    mutationFn: (id: number) =>
      correspondenceApi.deleteOutgoing(tenantId!, id),
    onSuccess: invalidateAll,
  });

  const generateLetterMutation = useMutation({
    mutationFn: (payload: GenerateLetterPayload) =>
      correspondenceApi.generateLetter(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      setIsGeneratorOpen(false);
      setSelectedTemplate(null);
      setVariableValues({});
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (payload: any) =>
      correspondenceApi.createTemplate(tenantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['correspondence-templates', tenantId],
      });
      setIsTemplateModalOpen(false);
      resetTemplateForm();
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      correspondenceApi.updateTemplate(tenantId!, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['correspondence-templates', tenantId],
      });
      setIsTemplateModalOpen(false);
      resetTemplateForm();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) =>
      correspondenceApi.deleteTemplate(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['correspondence-templates', tenantId],
      });
    },
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['correspondence-archive'] });
    queryClient.invalidateQueries({
      queryKey: ['correspondence-statistics'],
    });
    queryClient.invalidateQueries({
      queryKey: ['correspondence-generated'],
    });
  }

  function closeForm() {
    setIsFormOpen(false);
    setFormState(initialFormState);
  }

  function resetTemplateForm() {
    setTemplateForm({
      code: '',
      name: '',
      category: '',
      content: '',
      description: '',
      isActive: true,
      variables: [],
    });
    setSelectedTemplateForEdit(null);
  }

  function openTemplateModal(template?: CorrespondenceTemplate) {
    if (template) {
      setSelectedTemplateForEdit(template);
      setTemplateForm({
        code: template.code,
        name: template.name,
        category: template.category || '',
        content: template.content,
        description: template.description || '',
        isActive: template.isActive,
        variables: template.variables || [],
      });
    } else {
      resetTemplateForm();
    }
    setIsTemplateModalOpen(true);
  }

  function handleTemplateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;

    if (!templateForm.code || !templateForm.name || !templateForm.content) {
      alert('Kode, nama, dan konten template wajib diisi.');
      return;
    }

    const payload = {
      code: templateForm.code,
      name: templateForm.name,
      category: templateForm.category || undefined,
      content: templateForm.content,
      description: templateForm.description || undefined,
      isActive: templateForm.isActive,
      variables: templateForm.variables,
    };

    if (selectedTemplateForEdit) {
      updateTemplateMutation.mutate({
        id: selectedTemplateForEdit.id,
        payload,
      });
    } else {
      createTemplateMutation.mutate(payload);
    }
  }

  function addVariable() {
    setTemplateForm((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          key: '',
          label: '',
          type: 'text',
          required: false,
        },
      ],
    }));
  }

  function removeVariable(index: number) {
    setTemplateForm((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  }

  function updateVariable(index: number, field: string, value: any) {
    setTemplateForm((prev) => ({
      ...prev,
      variables: prev.variables.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));
  }

  const statistics = statisticsQuery.data ?? {
    totalIncoming: 0,
    totalOutgoing: 0,
    totalGenerated: 0,
  };

  const archiveItems = archiveQuery.data?.data ?? [];

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    archiveItems.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories);
  }, [archiveItems]);

  const currentTemplateVariables = selectedTemplate?.variables ?? [];

  const filteredArchive = archiveItems;

  const isLoading =
    archiveQuery.isLoading ||
    statisticsQuery.isLoading ||
    templatesQuery.isLoading;

  const handleEdit = async (item: CorrespondenceArchiveItem) => {
    if (!tenantId) return;

    if (item.sourceType === 'generated') {
      setPreviewHtml(item.metadata?.renderedHtml || null);
      return;
    }

    if (item.sourceType === 'incoming') {
      const detail = await correspondenceApi.getIncomingById(
        tenantId,
        item.sourceId,
      );
      setFormState({
        id: detail.id,
        mode: 'incoming',
        nomorSurat: detail.nomorSurat,
        subject: detail.perihal,
        from: detail.pengirim,
        to: detail.penerimaDisposisi ?? '',
        date: detail.tanggalTerima
          ? detail.tanggalTerima.split('T')[0]
          : new Date().toISOString().split('T')[0],
        category: detail.jenisSurat ?? '',
        status: detail.status,
        description: detail.catatan ?? '',
        filePath: detail.filePath || null,
        file: null,
        uploadedFile: detail.filePath
          ? { filename: detail.filePath.split('/').pop() || '', path: detail.filePath, url: storageApi.getFileUrl(detail.filePath) }
          : null,
      });
      setIsFormOpen(true);
      return;
    }

    if (item.sourceType === 'outgoing') {
      const detail = await correspondenceApi.getOutgoingById(
        tenantId,
        item.sourceId,
      );
      setFormState({
        id: detail.id,
        mode: 'outgoing',
        nomorSurat: detail.nomorSurat,
        subject: detail.perihal,
        from: detail.pengirim ?? '',
        to: detail.tujuan,
        date: detail.tanggalSurat
          ? detail.tanggalSurat.split('T')[0]
          : new Date().toISOString().split('T')[0],
        category: detail.jenisSurat ?? '',
        status: detail.status,
        description: detail.isiRingkas ?? '',
        filePath: detail.filePath || null,
        file: null,
        uploadedFile: detail.filePath
          ? { filename: detail.filePath.split('/').pop() || '', path: detail.filePath, url: storageApi.getFileUrl(detail.filePath) }
          : null,
      });
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (item: CorrespondenceArchiveItem) => {
    if (!tenantId) return;
    if (item.sourceType === 'generated') {
      alert('Surat otomatis tidak dapat dihapus dari sini.');
      return;
    }

    if (
      !confirm(
        `Hapus surat ${item.referenceNumber ?? item.subject}? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    if (item.sourceType === 'incoming') {
      deleteIncomingMutation.mutate(item.sourceId);
    } else if (item.sourceType === 'outgoing') {
      deleteOutgoingMutation.mutate(item.sourceId);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!tenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }

    if (!formState.subject || !formState.nomorSurat) {
      alert('Nomor surat dan perihal wajib diisi.');
      return;
    }

    let filePath = formState.filePath || formState.uploadedFile?.path;

    // Upload file jika ada file baru
    if (formState.file && !formState.id) {
      setIsUploading(true);
      try {
        const uploadResult = await storageApi.upload(tenantId, formState.file, {
          category: 'correspondence',
          folder: formState.mode === 'incoming' ? 'incoming' : 'outgoing',
        });
        filePath = uploadResult.data.path;
      } catch (error) {
        alert('Gagal mengunggah file. Silakan coba lagi.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    if (formState.mode === 'incoming') {
      const payload: CreateIncomingPayload = {
        nomorSurat: formState.nomorSurat,
        perihal: formState.subject,
        pengirim: formState.from,
        tanggalTerima: formState.date,
        jenisSurat: formState.category || undefined,
        status: formState.status || 'baru',
        catatan: formState.description || undefined,
        filePath: filePath || undefined,
      };

      if (formState.id) {
        updateIncomingMutation.mutate({
          id: formState.id,
          payload,
        });
      } else {
        createIncomingMutation.mutate(payload);
      }
    } else {
      const payload: CreateOutgoingPayload = {
        nomorSurat: formState.nomorSurat,
        perihal: formState.subject,
        tujuan: formState.to,
        tanggalSurat: formState.date,
        jenisSurat: formState.category || 'Surat Keluar',
        isiSurat: formState.description || '-',
        status: formState.status || 'draft',
        pengirim: formState.from || undefined,
        filePath: filePath || undefined,
      };

      if (formState.id) {
        updateOutgoingMutation.mutate({
          id: formState.id,
          payload,
        });
      } else {
        createOutgoingMutation.mutate(payload);
      }
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    const template = templatesQuery.data?.find(
      (item) => item.id === templateId,
    );
    setSelectedTemplate(template ?? null);
    setVariableValues({});
  };

  const handleGenerateLetter = () => {
    if (!selectedTemplate) {
      alert('Pilih template terlebih dahulu.');
      return;
    }

    if (!variableValues.subject) {
      alert('Perihal wajib diisi.');
      return;
    }

    const payload: GenerateLetterPayload = {
      templateId: selectedTemplate.id,
      subject: variableValues.subject,
      recipient: variableValues.recipient,
      letterDate: variableValues.letterDate,
      status: variableValues.status ?? 'final',
      variables: variableValues,
    };
    generateLetterMutation.mutate(payload);
  };

  const renderVariableField = (variable: TemplateVariableDefinition) => {
    const value = variableValues[variable.key] ?? '';
    const handleChange = (val: any) => {
      setVariableValues((prev) => ({
        ...prev,
        [variable.key]: val,
      }));
    };

    const baseProps = {
      className:
        'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(e.target.value),
    };

    switch (variable.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={3}
            placeholder={variable.placeholder}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            {...baseProps}
            placeholder={variable.placeholder}
          />
        );
      case 'select':
        return (
          <select {...baseProps}>
            <option value="">Pilih</option>
            {variable.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            {...baseProps}
            placeholder={variable.placeholder}
          />
        );
    }
  };

  return (
    <TenantLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
            <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Persuratan
              </h1>
            <p className="text-gray-600">
              Manajemen arsip surat masuk, keluar, dan surat otomatis
            </p>
            </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              onClick={() => openTemplateModal()}
            >
              <span className="mr-2 text-xl">🧾</span>
              Kelola Template
            </Button>
            <Button
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              onClick={() => setIsSequenceModalOpen(true)}
            >
              <span className="mr-2 text-xl">🔢</span>
              Kelola Penomoran
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              onClick={() => {
                setIsGeneratorOpen(true);
                setSelectedTemplate(null);
                setVariableValues({});
              }}
            >
              <span className="mr-2 text-xl">⚡</span>
              Buat Surat Otomatis
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => {
                setFormState(initialFormState);
                setIsFormOpen(true);
              }}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Surat Manual
            </Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard
            label="Total Surat Masuk"
            value={statistics.totalIncoming ?? 0}
            accent="from-blue-500 to-blue-600"
            icon="📥"
          />
          <StatCard
            label="Total Surat Keluar"
            value={statistics.totalOutgoing ?? 0}
            accent="from-purple-500 to-purple-600"
            icon="📤"
          />
          <StatCard
            label="Surat Otomatis"
            value={statistics.totalGenerated ?? 0}
            accent="from-amber-500 to-orange-600"
            icon="⚡"
          />
          <StatCard
            label="Template Aktif"
            value={templatesQuery.data?.length ?? 0}
            accent="from-emerald-500 to-green-600"
            icon="🧾"
          />
          </div>

        <div className="mb-6 space-y-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <FilterSelect
              label="Jenis Surat"
              value={filters.type}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
              options={[
                { label: 'Semua', value: 'all' },
                { label: 'Surat Masuk', value: 'incoming' },
                { label: 'Surat Keluar', value: 'outgoing' },
                { label: 'Surat Otomatis', value: 'generated' },
              ]}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { label: 'Semua', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Baru', value: 'baru' },
                { label: 'Diproses', value: 'diproses' },
                { label: 'Selesai', value: 'selesai' },
                { label: 'Menunggu TTD', value: 'menunggu_ttd' },
                { label: 'Terkirim', value: 'terkirim' },
                { label: 'Arsip', value: 'arsip' },
                { label: 'Final', value: 'final' },
              ]}
            />
            <FilterSelect
              label="Kategori"
              value={filters.category}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
              options={[
                { label: 'Semua', value: 'all' },
                ...categoryOptions.map((category) => ({
                  label: category,
                  value: category,
                })),
              ]}
            />
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Pencarian
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                placeholder="Cari perihal, nomor surat, pengirim, atau penerima"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>
          </div>

        <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-lg backdrop-blur-sm">
        {isLoading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data arsip persuratan...</p>
          </div>
        ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead>Nomor</TableHead>
                    <TableHead>Perihal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Dari / Kepada</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchive.map((item) => (
                    <TableRow
                      key={`${item.sourceType}-${item.sourceId}`}
                      className="transition-colors hover:bg-blue-50/50"
                    >
                      <TableCell className="font-semibold text-gray-800">
                        {item.referenceNumber ?? '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={item.subject}>
                          {item.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={
                            item.sourceType === 'incoming'
                              ? 'blue'
                              : item.sourceType === 'outgoing'
                              ? 'purple'
                              : 'amber'
                          }
                        >
                          {item.sourceType === 'incoming'
                            ? 'Masuk'
                            : item.sourceType === 'outgoing'
                            ? 'Keluar'
                            : 'Otomatis'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.category ?? '-'}</TableCell>
                      <TableCell>
                        {item.sourceType === 'incoming'
                          ? item.fromName ?? '-'
                          : item.toName ?? '-'}
                      </TableCell>
                      <TableCell>
                        {item.letterDate ? formatDate(item.letterDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge color="slate">
                          {item.status
                            ? item.status.replace(/_/g, ' ').toUpperCase()
                            : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.sourceType === 'generated') {
                                handleEdit(item);
                              } else {
                                handleEdit(item);
                              }
                            }}
                          >
                            {item.sourceType === 'generated'
                              ? 'Lihat'
                              : 'Edit'}
                          </Button>
                          {(item.sourceType === 'generated' ||
                            item.filePath) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  if (item.sourceType === 'generated') {
                                    await correspondenceApi.downloadGeneratedLetter(
                                      tenantId!,
                                      item.sourceId,
                                    );
                                  } else {
                                    await correspondenceApi.downloadArchiveLetter(
                                      tenantId!,
                                      item.id,
                                    );
                                  }
                                } catch (error) {
                                  alert('Gagal mengunduh surat');
                                }
                              }}
                            >
                              📥 Unduh
                            </Button>
                          )}
                          {item.sourceType !== 'generated' && (
                          <Button
                            variant="danger"
                            size="sm"
                              onClick={() => handleDelete(item)}
                          >
                            Hapus
                          </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredArchive.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-12 text-center text-gray-500"
                      >
                        Belum ada data persuratan sesuai filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </div>
        )}
        </div>
      </div>

        <Modal
        isOpen={isFormOpen}
        title={
          formState.id
            ? `Edit Surat ${formState.mode === 'incoming' ? 'Masuk' : 'Keluar'}`
            : `Tambah Surat ${formState.mode === 'incoming' ? 'Masuk' : 'Keluar'}`
        }
          size="lg"
        onClose={closeForm}
        >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Jenis Surat
              </label>
                <select
                value={formState.mode}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    mode: e.target.value as FormMode,
                    status:
                      e.target.value === 'incoming' ? 'baru' : 'draft',
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!formState.id}
                >
                  <option value="incoming">Surat Masuk</option>
                  <option value="outgoing">Surat Keluar</option>
                </select>
              </div>
              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor Surat
              </label>
                <input
                  type="text"
                value={formState.nomorSurat}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    nomorSurat: e.target.value,
                  }))
                }
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Perihal
                </label>
                <input
                  type="text"
                value={formState.subject}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                  required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            {formState.mode === 'incoming' ? (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Pengirim
                </label>
                  <input
                    type="text"
                  value={formState.from}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Penerima
                </label>
                  <input
                    type="text"
                  value={formState.to}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kategori
              </label>
                <input
                  type="text"
                value={formState.category}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tanggal
              </label>
                <input
                  type="date"
                value={formState.date}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
                <select
                value={formState.status}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formState.mode === 'incoming' ? (
                  <>
                    <option value="baru">Baru</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                  </>
                ) : (
                  <>
                    <option value="draft">Draft</option>
                    <option value="menunggu_ttd">Menunggu TTD</option>
                    <option value="terkirim">Terkirim</option>
                    <option value="arsip">Arsip</option>
                  </>
                )}
                </select>
              </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Keterangan Tambahan
              </label>
                <textarea
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                  rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={closeForm}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={
                createIncomingMutation.isPending ||
                updateIncomingMutation.isPending ||
                createOutgoingMutation.isPending ||
                updateOutgoingMutation.isPending
              }
            >
              {formState.id ? 'Simpan Perubahan' : 'Simpan Surat'}
            </Button>
          </div>
        </form>
        )}
      </Modal>

      <Modal
        isOpen={isGeneratorOpen}
        size="xl"
        onClose={() => {
          setIsGeneratorOpen(false);
          setSelectedTemplate(null);
          setVariableValues({});
        }}
        title="Buat Surat Otomatis"
      >
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Pilih Template
            </h3>
            <div className="space-y-2">
              {templatesQuery.data?.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-left text-sm transition-all',
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-white shadow-sm'
                      : 'border-transparent hover:border-blue-200 hover:bg-white',
                  )}
                >
                  <div className="font-medium text-gray-800">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.category ?? template.jenisSurat ?? 'Tanpa kategori'}
                  </div>
                </button>
              ))}
              {templatesQuery.data?.length === 0 && (
                <p className="text-sm text-gray-500">
                  Belum ada template. Silakan tambahkan template terlebih dahulu.
                </p>
              )}
            </div>
          </div>

          <div>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Informasi Surat
                  </h3>
                  <p className="text-sm text-gray-500">
                    Isi variabel berikut sesuai kebutuhan. Variabel digunakan
                    untuk mengganti placeholder pada template.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Perihal Surat
                    </label>
                    <input
                      type="text"
                      value={variableValues.subject ?? ''}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Penerima
                    </label>
                    <input
                      type="text"
                      value={variableValues.recipient ?? ''}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          recipient: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tanggal Surat
                    </label>
                    <input
                      type="date"
                      value={variableValues.letterDate ?? ''}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          letterDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {currentTemplateVariables.map((variable) => (
                    <div
                      key={variable.key}
                      className={clsx({
                        'md:col-span-2': variable.type === 'textarea',
                      })}
                    >
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {variable.label}
                        {variable.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>
                      {renderVariableField(variable)}
                      {variable.helperText && (
                        <p className="mt-1 text-xs text-gray-500">
                          {variable.helperText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsGeneratorOpen(false);
                      setSelectedTemplate(null);
                      setVariableValues({});
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    loading={generateLetterMutation.isPending}
                    onClick={handleGenerateLetter}
                  >
                    Generate Surat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center text-blue-600">
                Pilih template surat untuk mulai mengisi variabel.
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!previewHtml}
        title="Pratinjau Surat Otomatis"
        size="xl"
        onClose={() => setPreviewHtml(null)}
      >
        {previewHtml ? (
          <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Tidak ada konten untuk ditampilkan.</p>
        )}
      </Modal>

      {/* Template Management Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        size="xl"
        onClose={() => {
          setIsTemplateModalOpen(false);
          resetTemplateForm();
        }}
        title={
          selectedTemplateForEdit
            ? 'Edit Template Surat'
            : 'Kelola Template Surat'
        }
      >
        {!selectedTemplateForEdit ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Daftar template surat yang tersedia. Klik template untuk mengedit atau buat template baru.
              </p>
              <Button
                onClick={() => {
                  resetTemplateForm();
                  setSelectedTemplateForEdit(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Buat Template Baru
              </Button>
            </div>

            {templatesQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Memuat template...</p>
              </div>
            ) : templatesQuery.data && templatesQuery.data.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {templatesQuery.data.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">
                          {template.name}
                        </h4>
                        {template.isActive ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Kode: <code className="bg-gray-100 px-1 rounded">{template.code}</code>
                        {template.category && (
                          <> • Kategori: {template.category}</>
                        )}
                      </p>
                      {template.description && (
                        <p className="mt-1 text-xs text-gray-400">
                          {template.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {template.variables?.length || 0} variabel
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTemplateModal(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Hapus template "${template.name}"? Tindakan ini tidak dapat dibatalkan.`,
                            )
                          ) {
                            deleteTemplateMutation.mutate(template.id);
                          }
                        }}
                        loading={deleteTemplateMutation.isPending}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  Belum ada template
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Buat template pertama Anda untuk mulai membuat surat otomatis
                </p>
                <Button
                  onClick={() => {
                    resetTemplateForm();
                    setSelectedTemplateForEdit(null);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Buat Template Pertama
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleTemplateSubmit} className="space-y-6">
            <div className="mb-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetTemplateForm();
                  setSelectedTemplateForEdit(null);
                }}
              >
                ← Kembali ke Daftar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kode Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateForm.code}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  }))
                }
                placeholder="surat_tugas_diklat"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!selectedTemplateForEdit}
              />
              <p className="mt-1 text-xs text-gray-500">
                Kode unik untuk template (huruf kecil, underscore)
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Surat Tugas Mengikuti Diklat"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kategori
              </label>
              <input
                type="text"
                value={templateForm.category}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                placeholder="Surat Tugas"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Template untuk membuat surat tugas mengikuti diklat"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Konten Template <span className="text-red-500">*</span>
              </label>
              <textarea
                value={templateForm.content}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={12}
                placeholder={`Contoh:
<h2>Surat Tugas</h2>
<p>Nomor: {{nomor_surat}}</p>
<p>Yang bertanda tangan di bawah ini, {{nama_kepala_sekolah}}, memberikan tugas kepada:</p>
<p>Nama: {{nama_guru}}</p>
<p>Untuk mengikuti diklat pada tanggal {{tanggal_mulai}} sampai {{tanggal_selesai}}</p>
<p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan sebaik-baiknya.</p>`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Gunakan <code className="bg-gray-100 px-1 rounded">{'{{variabel}}'}</code> untuk
                variabel dinamis. Contoh: <code className="bg-gray-100 px-1 rounded">{'{{nama_siswa}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{tanggal}}'}</code>
              </p>
              <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  💡 Tips:
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Variabel otomatis tersedia: <code className="bg-blue-100 px-1 rounded">{'{{nomor_surat}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{tanggal_surat}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{reference_number}}'}</code></li>
                  <li>Gunakan HTML untuk format surat (h1, h2, p, strong, em, dll)</li>
                  <li>Pastikan variabel di konten template sesuai dengan variabel yang didefinisikan di bawah</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Variabel Template
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariable}
              >
                + Tambah Variabel
              </Button>
            </div>
            <div className="space-y-3">
              {templateForm.variables.map((variable, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="key"
                      value={variable.key}
                      onChange={(e) =>
                        updateVariable(
                          index,
                          'key',
                          e.target.value.toLowerCase().replace(/\s+/g, '_'),
                        )
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Label"
                      value={variable.label}
                      onChange={(e) =>
                        updateVariable(index, 'label', e.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={variable.type}
                      onChange={(e) =>
                        updateVariable(index, 'type', e.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={variable.required}
                        onChange={(e) =>
                          updateVariable(index, 'required', e.target.checked)
                        }
                        className="mr-1"
                      />
                      Wajib
                    </label>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeVariable(index)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
              {templateForm.variables.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  Belum ada variabel. Klik "Tambah Variabel" untuk menambahkan.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={templateForm.isActive}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Template aktif (dapat digunakan untuk generate surat)
            </label>
          </div>

          <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                setIsTemplateModalOpen(false);
                resetTemplateForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
              loading={
                createTemplateMutation.isPending ||
                updateTemplateMutation.isPending
              }
              >
              {selectedTemplateForEdit ? 'Simpan Perubahan' : 'Buat Template'}
              </Button>
            </div>
          </form>
        </Modal>

      {/* Sequence Management Modal */}
      <Modal
        isOpen={isSequenceModalOpen}
        size="xl"
        onClose={() => setIsSequenceModalOpen(false)}
        title="Kelola Penomoran Surat"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Atur format penomoran surat untuk setiap template. Format penomoran akan digunakan secara otomatis saat membuat surat.
          </p>

          {sequencesQuery.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat data penomoran...</p>
            </div>
          ) : sequencesQuery.data && sequencesQuery.data.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {sequencesQuery.data.map((sequence) => (
                <SequenceEditor
                  key={sequence.code}
                  sequence={sequence}
                  tenantId={tenantId!}
                  onUpdate={() => {
                    queryClient.invalidateQueries({
                      queryKey: ['correspondence-sequences', tenantId],
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="text-sm text-gray-500">
                Belum ada penomoran yang dikonfigurasi. Penomoran akan dibuat otomatis saat template pertama kali digunakan.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </TenantLayout>
  );
}

function SequenceEditor({
  sequence,
  tenantId,
  onUpdate,
}: {
  sequence: LetterSequenceConfig;
  tenantId: number;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateSequencePayload>({
    name: sequence.name,
    pattern: sequence.pattern,
    counter: sequence.counter,
    padding: sequence.padding,
    resetPeriod: sequence.resetPeriod,
    description: sequence.description || undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSequencePayload) =>
      correspondenceApi.updateSequence(tenantId, sequence.code, payload),
    onSuccess: () => {
      onUpdate();
      setIsEditing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{sequence.name}</h4>
          <p className="text-xs text-gray-500">Kode: {sequence.code}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Batal' : 'Edit'}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pattern <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pattern}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pattern: e.target.value }))
              }
              placeholder="001/SMK-ABC/{{month_roman}}/{{year}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Variabel tersedia: <code>{'{{counter}}'}</code>, <code>{'{{month}}'}</code>, <code>{'{{month_roman}}'}</code>, <code>{'{{year}}'}</code>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Counter
              </label>
              <input
                type="number"
                value={formData.counter}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    counter: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Padding
              </label>
              <input
                type="number"
                value={formData.padding}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    padding: parseInt(e.target.value) || 3,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reset Period
            </label>
            <select
              value={formData.resetPeriod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  resetPeriod: e.target.value as any,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="none">Tidak pernah</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" loading={updateMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pattern:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {sequence.pattern}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Counter:</span>
            <span className="font-medium">{sequence.counter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Padding:</span>
            <span className="font-medium">{sequence.padding}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reset Period:</span>
            <span className="font-medium">
              {sequence.resetPeriod === 'none'
                ? 'Tidak pernah'
                : sequence.resetPeriod === 'monthly'
                ? 'Bulanan'
                : 'Tahunan'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white text-xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: 'blue' | 'purple' | 'amber' | 'slate';
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        colorMap[color],
      )}
    >
      {children}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="w-full md:w-48">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

