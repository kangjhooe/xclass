'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicPageAdminApi } from '@/lib/api/public';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function PublicGalleryManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['admin-galleries', tenantId],
    queryFn: () => publicPageAdminApi.getGalleries(tenantId!),
    enabled: !!tenantId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publicPageAdminApi.deleteGallery(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries', tenantId] });
      success('Galeri berhasil dihapus');
      setDeleteModal({ isOpen: false, id: null });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menghapus galeri');
    },
  });

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
              <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Kelola Galeri
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola galeri foto untuk website publik
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${params.tenant}/public-page/gallery/create`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Foto
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700"
                >
                  <img
                    src={gallery.image}
                    alt={gallery.title || 'Galeri foto'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/${params.tenant}/public-page/gallery/${gallery.id}/edit`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(gallery.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {gallery.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-sm font-medium line-clamp-1">{gallery.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada foto di galeri
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Hapus Foto"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
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

