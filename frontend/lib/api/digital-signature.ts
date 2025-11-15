import apiClient from './client';

export enum SignatureType {
  HEADMASTER = 'headmaster',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  COUNSELOR = 'counselor',
}

export enum DocumentType {
  REPORT_CARD = 'report_card',
  TRANSCRIPT = 'transcript',
  CERTIFICATE = 'certificate',
  LETTER = 'letter',
  OTHER = 'other',
}

export interface DigitalSignature {
  id: number;
  instansiId: number;
  userId: number;
  type: SignatureType;
  name: string;
  signatureImage: string;
  signatureHash?: string;
  status: string;
  metadata?: Record<string, any>;
  validFrom?: string;
  validUntil?: string;
  revokedAt?: string;
  revokeReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SignedDocument {
  id: number;
  instansiId: number;
  studentId: number;
  documentType: DocumentType;
  documentNumber: string;
  documentPath: string;
  documentHash?: string;
  signatureId: number;
  status: string;
  signatureMetadata?: Record<string, any>;
  documentMetadata?: Record<string, any>;
  signedAt?: string;
  verifiedAt?: string;
  verificationHash?: string;
  student?: {
    id: number;
    name: string;
  };
  signature?: DigitalSignature;
}

export const digitalSignatureApi = {
  // Signatures
  createSignature: async (
    tenantId: number,
    data: {
      type: SignatureType;
      name: string;
      signatureImage: string;
      validFrom?: string;
      validUntil?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<{ data: DigitalSignature }> => {
    const response = await apiClient.post(`/academic-reports/digital-signature/signatures`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getSignatures: async (
    tenantId: number,
    type?: SignatureType,
    userId?: number,
  ): Promise<{ data: DigitalSignature[] }> => {
    const response = await apiClient.get(`/academic-reports/digital-signature/signatures`, {
      params: { type, userId },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getSignature: async (tenantId: number, id: number): Promise<{ data: DigitalSignature }> => {
    const response = await apiClient.get(`/academic-reports/digital-signature/signatures/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  revokeSignature: async (
    tenantId: number,
    id: number,
    reason: string,
  ): Promise<{ data: DigitalSignature }> => {
    const response = await apiClient.put(
      `/academic-reports/digital-signature/signatures/${id}/revoke`,
      { reason },
      {
        headers: {
          'x-tenant-id': tenantId.toString(),
        },
      },
    );
    return response.data;
  },

  // Documents
  signDocument: async (
    tenantId: number,
    data: {
      studentId: number;
      signatureId: number;
      documentType: DocumentType;
      documentNumber: string;
      documentPath: string;
      signatureMetadata?: Record<string, any>;
      documentMetadata?: Record<string, any>;
    },
  ): Promise<{ data: SignedDocument }> => {
    const response = await apiClient.post(`/academic-reports/digital-signature/documents/sign`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getSignedDocuments: async (
    tenantId: number,
    filters?: {
      studentId?: number;
      documentType?: DocumentType;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: SignedDocument[] }> => {
    const response = await apiClient.get(`/academic-reports/digital-signature/documents`, {
      params: filters,
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  verifyDocument: async (
    tenantId: number,
    id: number,
  ): Promise<{
    data: {
      isValid: boolean;
      document: SignedDocument;
      signature: DigitalSignature;
      verificationHash: string;
      message: string;
    };
  }> => {
    const response = await apiClient.get(`/academic-reports/digital-signature/documents/${id}/verify`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  // PDF Operations
  embedSignature: async (data: {
    pdfPath: string;
    signatureId: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    page?: number;
  }): Promise<{ data: string }> => {
    const response = await apiClient.post(`/academic-reports/digital-signature/pdf/embed-signature`, data);
    return response.data;
  },

  generateReportCard: async (data: {
    studentData: any;
    gradesData: any[];
    signatureId: number;
    outputPath: string;
  }): Promise<{ data: string }> => {
    const response = await apiClient.post(
      `/academic-reports/digital-signature/pdf/generate-report-card`,
      data,
    );
    return response.data;
  },
};

