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

export default function EditGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const galleryId = parseInt(params.id as string);
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['admin-gallery-detail', tenantId, galleryId],
    queryFn: () => publicPageAdminApi.getGalleryById(tenantId!, galleryId),
    enabled: !!tenantId && !isNaN(galleryId),
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (gallery) {
      setFormData({
        title: gallery.title || '',
        description: gallery.description || '',
        order: gallery.order || 0,
        isActive: gallery.isActive ?? true,
      });
      if (gallery.image) {
        setPreviewImage(gallery.image);
      }
    }
  }, [gallery]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return publicPageAdminApi.updateGallery(tenantId!, galleryId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-detail', tenantId, galleryId] });
      success('Foto berhasil diupdate');
      router.push(`/${params.tenant}/public-page/gallery`);
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupdate foto');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    
    if (image) {
      data.append('image', image);
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

  if (!gallery) {
    return (
      <TenantLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Foto tidak ditemukan</p>
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
            Edit Foto
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 space-y-6">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foto
            </label>
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-12 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Klik untuk upload foto baru
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
              Update Foto
            </Button>
          </div>
        </form>
      </div>
    </TenantLayout>
  );
}

