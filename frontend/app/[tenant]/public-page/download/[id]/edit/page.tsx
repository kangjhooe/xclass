'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicPageAdminApi } from '@/lib/api/public';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Save,
  Upload,
  X
} from 'lucide-react';

export default function EditDownloadPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const downloadId = parseInt(params.id as string);
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();

  const { data: download, isLoading } = useQuery({
    queryKey: ['admin-download-detail', tenantId, downloadId],
    queryFn: () => publicPageAdminApi.getDownloadById(tenantId!, downloadId),
    enabled: !!tenantId && !isNaN(downloadId),
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    order: 0,
    isActive: true,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (download) {
      setFormData({
        title: download.title || '',
        description: download.description || '',
        category: download.category || '',
        order: download.order || 0,
        isActive: download.isActive ?? true,
      });
    }
  }, [download]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return publicPageAdminApi.updateDownload(tenantId!, downloadId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-downloads', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['admin-download-detail', tenantId, downloadId] });
      success('File berhasil diupdate');
      router.push(`/${params.tenant}/public-page/download`);
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupdate file');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      showError('Judul wajib diisi');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });
    
    if (file) {
      data.append('file', file);
    }

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TenantLayout>
    );
  }

  if (!download) {
    return (
      <TenantLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">File tidak ditemukan</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit File Download
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 space-y-6">
          {/* Current File */}
          {download.fileUrl && !file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File Saat Ini
              </label>
              <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{download.fileName}</p>
                    <p className="text-sm text-gray-500">{(download.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <a
                  href={download.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Download
                </a>
              </div>
            </div>
          )}

          {/* New File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {download.fileUrl ? 'Ganti File' : 'File'} <span className="text-red-500">*</span>
            </label>
            {file ? (
              <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  {download.fileUrl ? 'Klik untuk ganti file' : 'Klik untuk upload file'}
                </label>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urutan
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktif
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Update File
            </Button>
          </div>
        </form>
      </div>
    </TenantLayout>
  );
}

