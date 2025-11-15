'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicPageAdminApi } from '@/lib/api/public';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Save,
  Upload,
  X
} from 'lucide-react';

export default function PublicProfileManagementPage() {
  const params = useParams();
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile', tenantId],
    queryFn: () => publicPageAdminApi.getProfile(tenantId!),
    enabled: !!tenantId,
  });

  const [formData, setFormData] = useState({
    description: '',
    vision: '',
    mission: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    isActive: true,
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        description: profile.description || '',
        vision: profile.vision || '',
        mission: profile.mission || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        isActive: profile.isActive ?? true,
      });
      if (profile.logo) {
        setPreviewLogo(profile.logo);
      }
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return publicPageAdminApi.updateProfile(tenantId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['public-profile', params.tenant] });
      success('Profil berhasil diupdate');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupdate profil');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });

    if (logo) {
      data.append('logo', logo);
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

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Kelola Profil Sekolah
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Kelola informasi profil sekolah untuk website publik
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo Sekolah
            </label>
            {previewLogo ? (
              <div className="relative inline-block">
                <img
                  src={previewLogo}
                  alt="Logo"
                  className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLogo(null);
                    setLogo(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center w-64">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Upload Logo
                </label>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi Sekolah
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Deskripsi singkat tentang sekolah"
            />
          </div>

          {/* Vision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visi
            </label>
            <textarea
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Visi sekolah"
            />
          </div>

          {/* Mission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Misi
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Misi sekolah (satu per baris)"
            />
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telepon
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Profil
            </Button>
          </div>
        </form>
      </div>
    </TenantLayout>
  );
}

