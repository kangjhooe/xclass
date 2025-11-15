'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicPageAdminApi, publicApi } from '@/lib/api/public';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { 
  Download as DownloadIcon, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function PublicDownloadManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const { data: downloads, isLoading } = useQuery({
    queryKey: ['admin-downloads', tenantId, selectedCategory],
    queryFn: () => publicPageAdminApi.getDownloads(tenantId!, selectedCategory || undefined),
    enabled: !!tenantId,
  });

  const { data: categories } = useQuery({
    queryKey: ['public-download-categories', params.tenant],
    queryFn: () => publicApi.getDownloadCategories(params.tenant as string),
    enabled: !!params.tenant,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publicPageAdminApi.deleteDownload(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-downloads', tenantId] });
      success('File berhasil dihapus');
      setDeleteModal({ isOpen: false, id: null });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menghapus file');
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DownloadIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Kelola Download
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola file download untuk website publik
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${params.tenant}/public-page/download/create`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah File
          </Button>
        </div>

        {/* Filter */}
        {categories && categories.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : downloads && downloads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Ukuran</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {download.title}
                          </p>
                          {download.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {download.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {download.category || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{formatFileSize(download.fileSize)}</TableCell>
                    <TableCell>{download.downloadCount || 0}</TableCell>
                    <TableCell>{formatDate(new Date(download.createdAt))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${params.tenant}/public-page/download/${download.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(download.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <DownloadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada file download
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Hapus File"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Apakah Anda yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </TenantLayout>
  );
}

