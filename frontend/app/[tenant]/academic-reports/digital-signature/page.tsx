'use client';

import { useState, useRef } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  digitalSignatureApi,
  DigitalSignature,
  SignatureType,
  SignedDocument,
  DocumentType,
} from '@/lib/api/digital-signature';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { PenTool, Plus, Eye, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function DigitalSignaturePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SignedDocument | null>(null);
  const [formData, setFormData] = useState({
    type: SignatureType.HEADMASTER,
    name: '',
    signatureImage: '',
    validFrom: '',
    validUntil: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['digital-signatures', tenantId],
    queryFn: () => digitalSignatureApi.getSignatures(tenantId!),
    enabled: !!tenantId,
  });

  const { data: documentsData } = useQuery({
    queryKey: ['signed-documents', tenantId],
    queryFn: () => digitalSignatureApi.getSignedDocuments(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return digitalSignatureApi.createSignature(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, signatureImage: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      type: SignatureType.HEADMASTER,
      name: '',
      signatureImage: '',
      validFrom: '',
      validUntil: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama signature harus diisi');
      return;
    }
    if (!formData.signatureImage) {
      alert('Gambar signature harus diupload');
      return;
    }
    createMutation.mutate({
      ...formData,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    });
  };

  const handleVerify = async (document: SignedDocument) => {
    if (!tenantId) return;
    try {
      const result = await digitalSignatureApi.verifyDocument(tenantId, document.id);
      setSelectedDocument({ ...document, ...result.data.document });
      setIsVerifyModalOpen(true);
    } catch (error) {
      alert('Gagal verifikasi dokumen');
    }
  };

  const signatures = data?.data || [];
  const documents = documentsData?.data || [];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="academic-reports"
        title="Tanda Tangan Digital"
        description="Kelola tanda tangan digital dan dokumen yang ditandatangani"
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Signature
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signatures */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Daftar Signature</h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : signatures.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada signature</p>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                  Tambah Signature Pertama
                </Button>
              </div>
            ) : (
              signatures.map((signature) => (
                <div key={signature.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{signature.name}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                          {signature.type}
                        </span>
                        {signature.status === 'active' ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {signature.status}
                          </span>
                        )}
                      </div>
                      {signature.user && (
                        <p className="text-sm text-gray-600 mb-1">
                          User: {signature.user.name} ({signature.user.email})
                        </p>
                      )}
                      {signature.validUntil && (
                        <p className="text-sm text-gray-500">
                          Valid until: {formatDate(signature.validUntil)}
                        </p>
                      )}
                      {signature.signatureImage && (
                        <div className="mt-3">
                          <img
                            src={signature.signatureImage}
                            alt="Signature"
                            className="max-w-[200px] max-h-[100px] border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Signed Documents */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dokumen yang Ditandatangani</h2>
            {documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada dokumen yang ditandatangani</p>
              </div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{document.documentNumber}</h3>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded capitalize">
                          {document.documentType.replace('_', ' ')}
                        </span>
                        {document.status === 'verified' ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : document.status === 'signed' ? (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Signed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {document.status}
                          </span>
                        )}
                      </div>
                      {document.student && (
                        <p className="text-sm text-gray-600 mb-1">Siswa: {document.student.name}</p>
                      )}
                      {document.signedAt && (
                        <p className="text-sm text-gray-500">Signed: {formatDate(document.signedAt)}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(document)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Verify
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Signature Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Tambah Signature Baru"
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Tipe Signature"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SignatureType })}
              options={[
                { value: SignatureType.HEADMASTER, label: 'Kepala Sekolah' },
                { value: SignatureType.TEACHER, label: 'Guru' },
                { value: SignatureType.ADMIN, label: 'Admin' },
                { value: SignatureType.COUNSELOR, label: 'Konselor' },
              ]}
            />

            <Input
              label="Nama Signature"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Dr. Ahmad Hidayat, S.Pd., M.Pd."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Signature Image
              </label>
              <FileUpload
                accept="image/*"
                onUpload={handleFileUpload}
                maxSize={2} // 2MB
                multiple={false}
              />
              {formData.signatureImage && (
                <div className="mt-3">
                  <img
                    src={formData.signatureImage}
                    alt="Preview"
                    className="max-w-[300px] max-h-[150px] border rounded"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valid From (Opsional)"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              />

              <Input
                label="Valid Until (Opsional)"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
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
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Verify Document Modal */}
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          title="Verifikasi Dokumen"
        >
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Document Number</p>
                <p className="text-gray-900">{selectedDocument.documentNumber}</p>
              </div>
              {selectedDocument.student && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Siswa</p>
                  <p className="text-gray-900">{selectedDocument.student.name}</p>
                </div>
              )}
              {selectedDocument.signature && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Signed by</p>
                  <p className="text-gray-900">{selectedDocument.signature.name}</p>
                </div>
              )}
              {selectedDocument.verificationHash && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Verification Hash</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {selectedDocument.verificationHash}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

