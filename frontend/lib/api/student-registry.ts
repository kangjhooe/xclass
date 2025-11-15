import apiClient from './client';

export interface RegistryData {
  student: any;
  grades?: any;
  attendance?: any;
  health?: any;
  discipline?: any;
  counseling?: any;
  extracurricular?: any;
  exams?: any;
  promotion?: any;
  transfer?: any;
  graduation?: any;
  alumni?: any;
  library?: any;
  finance?: any;
  events?: any;
  statistics?: any;
  generatedAt?: string;
  academicYear?: string;
}

export interface RegistrySnapshot {
  id: number;
  studentId: number;
  instansiId: number;
  nik: string;
  nisn?: string;
  academicYear?: string;
  academicLevel?: string;
  currentGrade?: string;
  pdfPath?: string;
  pdfUrl?: string;
  registryData?: string;
  generatedBy?: string;
  generatedById?: number;
  fileHash?: string;
  isSigned: boolean;
  signatureId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
  };
}

export interface GenerateRegistryRequest {
  nik: string;
  academicYear?: string;
  includeSignature?: boolean;
  signatureId?: number;
  categories?: string[];
  format?: 'pdf' | 'json' | 'html';
}

export interface BatchGenerateRegistryRequest {
  niks: string[];
  academicYear?: string;
  includeSignature?: boolean;
  format?: 'pdf' | 'zip';
}

export interface RegistryStatistics {
  totalSnapshots: number;
  signedSnapshots: number;
  unsignedSnapshots: number;
  recentSnapshots: Array<{
    id: number;
    studentName?: string;
    nik: string;
    academicYear?: string;
    createdAt: string;
    isSigned: boolean;
  }>;
}

export const studentRegistryApi = {
  /**
   * Generate buku induk untuk satu siswa
   */
  async generate(data: GenerateRegistryRequest): Promise<Blob> {
    const response = await apiClient.post('/student-registry/generate', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Batch generate buku induk
   */
  async batchGenerate(data: BatchGenerateRegistryRequest): Promise<Blob> {
    const response = await apiClient.post('/student-registry/batch-generate', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get registry data (tanpa generate PDF)
   */
  async getData(nik: string, academicYear?: string): Promise<RegistryData> {
    const params = academicYear ? { academicYear } : {};
    const response = await apiClient.get(`/student-registry/data/${nik}`, { params });
    return response.data;
  },

  /**
   * Get semua snapshot untuk siswa
   */
  async getSnapshots(nik: string): Promise<RegistrySnapshot[]> {
    const response = await apiClient.get(`/student-registry/snapshots/${nik}`);
    return response.data;
  },

  /**
   * Get snapshot detail
   */
  async getSnapshot(id: number): Promise<RegistrySnapshot> {
    const response = await apiClient.get(`/student-registry/snapshot/${id}`);
    return response.data;
  },

  /**
   * Download PDF dari snapshot
   */
  async downloadSnapshotPDF(id: number): Promise<Blob> {
    const response = await apiClient.get(`/student-registry/snapshot/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Delete snapshot
   */
  async deleteSnapshot(id: number): Promise<void> {
    await apiClient.delete(`/student-registry/snapshot/${id}`);
  },

  /**
   * Get statistics
   */
  async getStatistics(): Promise<RegistryStatistics> {
    const response = await apiClient.get('/student-registry/statistics');
    return response.data;
  },
};

