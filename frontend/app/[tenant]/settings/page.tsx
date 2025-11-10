'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loading } from '@/components/ui/Loading';
import { useToastStore } from '@/lib/store/toast';
import { tenantApi, Tenant, TenantUpdateData } from '@/lib/api/tenant';

export default function SettingsPage() {
  const params = useParams();
  const tenantId = parseInt(params?.tenant as string);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantUpdateData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const data = await tenantApi.getById(tenantId);
      setTenant(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      showError('Gagal memuat data instansi');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nama instansi wajib diisi';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await tenantApi.update(tenantId, formData);
      success('Profil instansi berhasil diperbarui');
      loadTenant();
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      const errorMessage =
        error.response?.data?.message || 'Gagal memperbarui profil instansi';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </TenantLayout>
    );
  }

  if (!tenant) {
    return (
      <TenantLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Data instansi tidak ditemukan.</p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Instansi</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola informasi dan pengaturan instansi Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Informasi Dasar */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="npsn"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    NPSN
                  </label>
                  <Input
                    id="npsn"
                    type="text"
                    value={tenant.npsn}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    NPSN tidak dapat diubah. Gunakan menu Perubahan NPSN untuk
                    mengajukan perubahan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nama Instansi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telepon
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Alamat
              </h2>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alamat Lengkap
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Masukkan alamat lengkap instansi"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h2>
              <div className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tenant.isActive ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: tenant.name || '',
                  email: tenant.email || '',
                  phone: tenant.phone || '',
                  address: tenant.address || '',
                });
                setErrors({});
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </TenantLayout>
  );
}

