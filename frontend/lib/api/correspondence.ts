import apiClient from './client';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CorrespondenceArchiveItem {
  id: number;
  instansiId: number;
  sourceType: 'incoming' | 'outgoing' | 'generated';
  sourceId: number;
  referenceNumber: string | null;
  subject: string;
  category?: string | null;
  fromName?: string | null;
  toName?: string | null;
  letterDate?: string | null;
  status?: string | null;
  type?: string | null;
  filePath?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariableDefinition {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
  defaultValue?: string;
  source?: string;
}

export interface CreateTemplatePayload {
  code: string;
  name: string;
  jenisSurat?: string;
  category?: string;
  content: string;
  variables?: TemplateVariableDefinition[];
  isActive?: boolean;
  description?: string;
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

export interface CorrespondenceTemplate {
  id: number;
  instansiId: number;
  code: string;
  name: string;
  jenisSurat?: string | null;
  category?: string | null;
  content: string;
  variables: TemplateVariableDefinition[];
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LetterSequenceConfig {
  id: number;
  instansiId: number;
  code: string;
  name: string;
  pattern: string;
  counter: number;
  padding: number;
  resetPeriod: 'none' | 'monthly' | 'yearly';
  lastResetAt?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSequencePayload {
  name?: string;
  pattern?: string;
  counter?: number;
  padding?: number;
  resetPeriod?: 'none' | 'monthly' | 'yearly';
  description?: string;
}

export interface GeneratedLetter {
  id: number;
  instansiId: number;
  templateId: number;
  referenceNumber: string;
  subject: string;
  variables: Record<string, any>;
  status: 'draft' | 'final';
  recipient?: string | null;
  filePath?: string | null;
  renderedHtml?: string | null;
  letterDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomingPayload {
  nomorSurat: string;
  tanggalTerima: string;
  pengirim: string;
  perihal: string;
  lampiran?: string[];
  filePath?: string;
  status?: string;
  catatan?: string;
  disposisi?: Record<string, any>;
  jenisSurat?: string;
  prioritas?: string;
  sifatSurat?: string;
  isiRingkas?: string;
  tindakLanjut?: string;
  tanggalDisposisi?: string;
  penerimaDisposisi?: string;
}

export interface CreateOutgoingPayload {
  nomorSurat: string;
  tanggalSurat: string;
  jenisSurat: string;
  tujuan: string;
  perihal: string;
  isiSurat: string;
  filePath?: string;
  status?: string;
  prioritas?: string;
  sifatSurat?: string;
  isiRingkas?: string;
  tindakLanjut?: string;
  tanggalKirim?: string;
  pengirim?: string;
  lampiran?: string[];
  templateId?: number;
}

export interface GenerateLetterPayload {
  templateId: number;
  subject: string;
  recipient?: string;
  letterDate?: string;
  status?: 'draft' | 'final';
  variables: Record<string, any>;
}

export type OutgoingLetterStatus =
  | 'draft'
  | 'menunggu_ttd'
  | 'terkirim'
  | 'arsip';

export const correspondenceApi = {
  // Archive
  getArchive: async (
    tenantId: number,
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<CorrespondenceArchiveItem>> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence`,
      { params },
    );
    return response.data;
  },

  // Incoming letters
  getIncoming: async (
    tenantId: number,
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/incoming`,
      { params },
    );
    return response.data;
  },

  getIncomingById: async (tenantId: number, id: number) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/incoming/${id}`,
    );
    return response.data;
  },

  createIncoming: async (
    tenantId: number,
    payload: CreateIncomingPayload,
  ) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/incoming`,
      payload,
    );
    return response.data;
  },

  updateIncoming: async (
    tenantId: number,
    id: number,
    payload: Partial<CreateIncomingPayload>,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/incoming/${id}`,
      payload,
    );
    return response.data;
  },

  deleteIncoming: async (tenantId: number, id: number) => {
    await apiClient.delete(
      `/tenants/${tenantId}/correspondence/incoming/${id}`,
    );
  },

  updateIncomingStatus: async (
    tenantId: number,
    id: number,
    status: string,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/incoming/${id}/status`,
      { status },
    );
    return response.data;
  },

  addDisposition: async (
    tenantId: number,
    id: number,
    payload: { penerima: string; catatan?: string; tanggal?: string },
  ) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/incoming/${id}/disposition`,
      payload,
    );
    return response.data;
  },

  // Outgoing letters
  getOutgoing: async (
    tenantId: number,
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/outgoing`,
      { params },
    );
    return response.data;
  },

  getOutgoingById: async (tenantId: number, id: number) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/outgoing/${id}`,
    );
    return response.data;
  },

  createOutgoing: async (
    tenantId: number,
    payload: CreateOutgoingPayload,
  ) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/outgoing`,
      payload,
    );
    return response.data;
  },

  updateOutgoing: async (
    tenantId: number,
    id: number,
    payload: Partial<CreateOutgoingPayload>,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/outgoing/${id}`,
      payload,
    );
    return response.data;
  },

  deleteOutgoing: async (tenantId: number, id: number) => {
    await apiClient.delete(
      `/tenants/${tenantId}/correspondence/outgoing/${id}`,
    );
  },

  updateOutgoingStatus: async (
    tenantId: number,
    id: number,
    status: OutgoingLetterStatus,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/outgoing/${id}/status`,
      { status },
    );
    return response.data;
  },

  archiveOutgoing: async (tenantId: number, id: number) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/outgoing/${id}/archive`,
    );
    return response.data;
  },

  // Templates
  getTemplates: async (tenantId: number): Promise<CorrespondenceTemplate[]> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/templates`,
    );
    return response.data;
  },

  createTemplate: async (
    tenantId: number,
    payload: CreateTemplatePayload,
  ) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/templates`,
      payload,
    );
    return response.data;
  },

  getTemplate: async (
    tenantId: number,
    id: number,
  ): Promise<CorrespondenceTemplate> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/templates/${id}`,
    );
    return response.data;
  },

  updateTemplate: async (
    tenantId: number,
    id: number,
    payload: UpdateTemplatePayload,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/templates/${id}`,
      payload,
    );
    return response.data;
  },

  deleteTemplate: async (tenantId: number, id: number) => {
    await apiClient.delete(
      `/tenants/${tenantId}/correspondence/templates/${id}`,
    );
  },

  // Sequences
  getSequences: async (tenantId: number): Promise<LetterSequenceConfig[]> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/sequences`,
    );
    return response.data;
  },

  getSequence: async (tenantId: number, code: string) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/sequences/${code}`,
    );
    return response.data;
  },

  updateSequence: async (
    tenantId: number,
    code: string,
    payload: UpdateSequencePayload,
  ) => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/correspondence/sequences/${code}`,
      payload,
    );
    return response.data;
  },

  // Generated letters
  generateLetter: async (tenantId: number, payload: GenerateLetterPayload) => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/correspondence/generate`,
      payload,
    );
    return response.data;
  },

  getGeneratedLetters: async (
    tenantId: number,
  ): Promise<GeneratedLetter[]> => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/generated`,
    );
    return response.data;
  },

  downloadGeneratedLetter: async (tenantId: number, id: number) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/generated/${id}/download`,
      {
        responseType: 'blob',
      },
    );
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `surat-${id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadArchiveLetter: async (tenantId: number, id: number) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/archive/${id}/download`,
      {
        responseType: 'blob',
      },
    );
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `surat-${id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Statistics
  getStatistics: async (tenantId: number, year?: number) => {
    const response = await apiClient.get(
      `/tenants/${tenantId}/correspondence/statistics`,
      {
        params: year ? { year } : undefined,
      },
    );
    return response.data;
  },
};

