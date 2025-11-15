'use client';

import { useState, useRef } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { storageApi, StorageFile, StorageFileCreateData, storageQuotaApi, StorageQuota, StorageUpgradePackage, StorageUpgradeType, CreateStorageUpgradeRequest } from '@/lib/api/storage';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { AlertCircle, HardDrive, TrendingUp, Package, Zap } from 'lucide-react';

export default function StoragePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'package' | 'custom'>('package');
  const [selectedPackage, setSelectedPackage] = useState<StorageUpgradePackage | null>(null);
  const [customGB, setCustomGB] = useState<number>(10);
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [uploadData, setUploadData] = useState<StorageFileCreateData>({
    category: '',
    folder: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['storage', tenantId],
    queryFn: () => storageApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: quota, isLoading: quotaLoading } = useQuery({
    queryKey: ['storage-quota', tenantId],
    queryFn: () => storageQuotaApi.getQuota(tenantId!),
    enabled: !!tenantId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: upgradePackages } = useQuery({
    queryKey: ['storage-upgrade-packages', tenantId],
    queryFn: () => storageQuotaApi.getUpgradePackages(tenantId!),
    enabled: !!tenantId,
  });

  const upgradeMutation = useMutation({
    mutationFn: (data: CreateStorageUpgradeRequest) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return storageQuotaApi.createUpgrade(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-quota', tenantId] });
      setIsUpgradeModalOpen(false);
      setSelectedPackage(null);
      setCustomGB(10);
      setUpgradeType('package');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, data }: { file: File; data?: StorageFileCreateData }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return storageApi.upload(tenantId, file, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', tenantId] });
      setIsModalOpen(false);
      setUploadData({ category: '', folder: '', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StorageFileCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return storageApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', tenantId] });
      setIsModalOpen(false);
      setSelectedFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return storageApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', tenantId] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!tenantId) {
        alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
        return;
      }
      uploadMutation.mutate({ file, data: uploadData });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredData = data?.data?.filter((file) => {
    if (filterCategory !== 'all' && file.category !== filterCategory) return false;
    return true;
  }) || [];

  const totalFiles = data?.data?.length || 0;
  const totalSize = data?.data?.reduce((sum, file) => sum + file.size, 0) || 0;
  const categories = Array.from(new Set(data?.data?.map((f) => f.category).filter(Boolean) || []));

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Storage
              </h1>
              <p className="text-gray-600">Manajemen file dan dokumen</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload File
            </Button>
          </div>
        </div>

        {/* Storage Quota Section */}
        {quota && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HardDrive className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Storage Quota</h2>
                  <p className="text-sm text-gray-600">
                    {quota.usageGB.toFixed(2)} GB / {quota.limitGB.toFixed(2)} GB digunakan
                    {quota.upgradeGB > 0 && ` (+${quota.upgradeGB.toFixed(2)} GB upgrade)`}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Storage
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {quota.availableGB.toFixed(2)} GB tersedia
                </span>
                <span className={`text-sm font-bold ${
                  quota.isCritical ? 'text-red-600' : 
                  quota.isWarning ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {quota.usagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    quota.isFull ? 'bg-red-500' :
                    quota.isCritical ? 'bg-red-400' :
                    quota.isWarning ? 'bg-yellow-400' :
                    'bg-gradient-to-r from-blue-500 to-green-500'
                  }`}
                  style={{ width: `${Math.min(quota.usagePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Warning Messages */}
            {quota.isFull && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Storage Penuh</p>
                  <p className="text-sm text-red-600 mt-1">
                    Storage quota Anda sudah penuh. Silakan upgrade storage atau hapus file yang tidak diperlukan.
                  </p>
                </div>
              </div>
            )}
            {quota.isCritical && !quota.isFull && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Storage Hampir Penuh</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Storage quota Anda sudah mencapai {quota.usagePercent.toFixed(1)}%. Pertimbangkan untuk upgrade storage.
                  </p>
                </div>
              </div>
            )}
            {quota.isWarning && !quota.isCritical && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Storage Mencapai 80%</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Storage quota Anda sudah mencapai {quota.usagePercent.toFixed(1)}%.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total File</p>
                <p className="text-3xl font-bold text-blue-600">{totalFiles}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Ukuran</p>
                <p className="text-3xl font-bold text-green-600">{formatFileSize(totalSize)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
                    <TableHead className="font-semibold text-gray-700">Nama File</TableHead>
                    <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                    <TableHead className="font-semibold text-gray-700">Folder</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ukuran</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((file) => (
                    <TableRow key={file.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{file.original_name || file.filename}</TableCell>
                      <TableCell>{file.category || '-'}</TableCell>
                      <TableCell>{file.folder || '-'}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell className="text-sm">{file.mime_type || '-'}</TableCell>
                      <TableCell>{formatDate(file.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Download
                          </a>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada file</p>
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
            setUploadData({ category: '', folder: '', description: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          title="Upload File"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Dokumen, Foto, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
              <input
                type="text"
                value={uploadData.folder}
                onChange={(e) => setUploadData({ ...uploadData, folder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: /dokumen/2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {uploadMutation.isPending && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Mengupload file...</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadData({ category: '', folder: '', description: '' });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>

        {/* Upgrade Storage Modal */}
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => {
            setIsUpgradeModalOpen(false);
            setSelectedPackage(null);
            setCustomGB(10);
            setUpgradeType('package');
          }}
          title="Upgrade Storage"
          size="lg"
        >
          <div className="space-y-6">
            {/* Upgrade Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Tipe Upgrade
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUpgradeType('package')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    upgradeType === 'package'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Paket (Lebih Hemat)</p>
                  <p className="text-xs text-gray-600 mt-1">Harga lebih murah per GB</p>
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeType('custom')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    upgradeType === 'custom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Custom (Fleksibel)</p>
                  <p className="text-xs text-gray-600 mt-1">Pilih jumlah GB sendiri</p>
                </button>
              </div>
            </div>

            {/* Package Selection */}
            {upgradeType === 'package' && upgradePackages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pilih Paket
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {upgradePackages.map((pkg) => (
                    <button
                      key={pkg.gb}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPackage?.gb === pkg.gb
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">+{pkg.gb} GB</span>
                        {selectedPackage?.gb === pkg.gb && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Rp {pkg.pricePerGB.toLocaleString('id-ID')}/GB/tahun
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom GB Input */}
            {upgradeType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah GB Tambahan
                </label>
                <input
                  type="number"
                  min={10}
                  step={1}
                  value={customGB}
                  onChange={(e) => setCustomGB(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Minimal 10 GB. Harga: Rp {(customGB * 5000).toLocaleString('id-ID')}/tahun
                  (Rp 5.000/GB/tahun)
                </p>
              </div>
            )}

            {/* Summary */}
            {(selectedPackage || (upgradeType === 'custom' && customGB >= 10)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ringkasan Upgrade</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tambahan Storage:</span>
                    <span className="font-medium">
                      +{upgradeType === 'package' ? selectedPackage?.gb : customGB} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga per Tahun:</span>
                    <span className="font-medium">
                      Rp{' '}
                      {(
                        upgradeType === 'package'
                          ? selectedPackage?.price || 0
                          : customGB * 5000
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between font-bold">
                      <span>Total (Pro-rated):</span>
                      <span className="text-blue-600">
                        Rp{' '}
                        {(
                          upgradeType === 'package'
                            ? selectedPackage?.price || 0
                            : customGB * 5000
                        ).toLocaleString('id-ID')}
                        /tahun
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      * Harga akan dihitung pro-rated untuk sisa periode subscription
                    </p>
                  </div>
                </div>
              </div>
            )}

            {upgradeMutation.isPending && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Memproses upgrade...</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  setSelectedPackage(null);
                  setCustomGB(10);
                  setUpgradeType('package');
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (upgradeType === 'package' && selectedPackage) {
                    upgradeMutation.mutate({
                      upgradeType: StorageUpgradeType.PACKAGE,
                      additionalGB: selectedPackage.gb,
                    });
                  } else if (upgradeType === 'custom' && customGB >= 10) {
                    upgradeMutation.mutate({
                      upgradeType: StorageUpgradeType.CUSTOM,
                      additionalGB: customGB,
                    });
                  }
                }}
                disabled={
                  (upgradeType === 'package' && !selectedPackage) ||
                  (upgradeType === 'custom' && customGB < 10) ||
                  upgradeMutation.isPending
                }
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Upgrade Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </TenantLayout>
  );
}
