'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export default function CreateGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return publicPageAdminApi.createGallery(tenantId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries', tenantId] });
      success('Foto berhasil ditambahkan');
      router.push(`/${params.tenant}/public-page/gallery`);
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menambahkan foto');
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
    
    if (!formData.title || !image) {
      showError('Judul dan gambar wajib diisi');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });
    
    data.append('image', image);

    createMutation.mutate(data);
  };

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
            Tambah Foto ke Galeri
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 space-y-6">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foto <span className="text-red-500">*</span>
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
                  required
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Klik untuk upload foto
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
              placeholder="Masukkan judul foto"
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
              placeholder="Deskripsi foto (opsional)"
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
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">Urutan tampil di galeri (angka lebih kecil muncul lebih dulu)</p>
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
              Aktif (tampilkan di website publik)
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
              loading={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Foto
            </Button>
          </div>
        </form>
      </div>
    </TenantLayout>
  );
}

