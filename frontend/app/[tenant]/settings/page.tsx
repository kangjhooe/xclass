'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loading } from '@/components/ui/Loading';
import { useToastStore } from '@/lib/store/toast';
import { tenantApi, Tenant } from '@/lib/api/tenant';
import { dataPokokApi, DataPokok, DataPokokCreateData } from '@/lib/api/data-pokok';

export default function SettingsPage() {
  const params = useParams();
  const tenantIdentifier = params?.tenant as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [dataPokok, setDataPokok] = useState<DataPokok | null>(null);
  const [formData, setFormData] = useState<DataPokokCreateData>({
    name: '',
    type: '',
    jenjang: '',
    address: '',
    village: '',
    subDistrict: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalNip: '',
    principalPhone: '',
    principalEmail: '',
    description: '',
    vision: '',
    mission: '',
    accreditation: '',
    accreditationDate: '',
    licenseNumber: '',
    licenseDate: '',
    establishedDate: '',
    notes: '',
    kurikulum: '',
    tahunPelajaranAktif: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    if (tenantIdentifier) {
      loadData();
    }
  }, [tenantIdentifier]);

  const loadData = async () => {
    try {
      if (!tenantIdentifier) {
        setLoading(false);
        return;
      }
      setLoading(true);
      
      // Load tenant data
      const tenantData = await tenantApi.getByIdentifier(tenantIdentifier);
      setTenant(tenantData);

      // Load data pokok
      try {
        const dataPokokData = await dataPokokApi.get(tenantData.id);
        setDataPokok(dataPokokData);
        setFormData({
          name: dataPokokData.name || tenantData.name || '',
          type: dataPokokData.type || '',
          jenjang: dataPokokData.jenjang || '',
          address: dataPokokData.address || tenantData.address || '',
          village: dataPokokData.village || '',
          subDistrict: dataPokokData.subDistrict || '',
          district: dataPokokData.district || '',
          city: dataPokokData.city || '',
          province: dataPokokData.province || '',
          postalCode: dataPokokData.postalCode || '',
          phone: dataPokokData.phone || tenantData.phone || '',
          email: dataPokokData.email || tenantData.email || '',
          website: dataPokokData.website || '',
          principalName: dataPokokData.principalName || '',
          principalNip: dataPokokData.principalNip || '',
          principalPhone: dataPokokData.principalPhone || '',
          principalEmail: dataPokokData.principalEmail || '',
          description: dataPokokData.description || '',
          vision: dataPokokData.vision || '',
          mission: dataPokokData.mission || '',
          accreditation: dataPokokData.accreditation || '',
          accreditationDate: dataPokokData.accreditationDate 
            ? new Date(dataPokokData.accreditationDate).toISOString().split('T')[0]
            : '',
          licenseNumber: dataPokokData.licenseNumber || '',
          licenseDate: dataPokokData.licenseDate
            ? new Date(dataPokokData.licenseDate).toISOString().split('T')[0]
            : '',
          establishedDate: dataPokokData.establishedDate
            ? new Date(dataPokokData.establishedDate).toISOString().split('T')[0]
            : '',
          notes: dataPokokData.notes || '',
          kurikulum: dataPokokData.kurikulum || '',
          tahunPelajaranAktif: dataPokokData.tahunPelajaranAktif || '',
        });
      } catch (error: any) {
        // Data pokok belum ada, gunakan data tenant sebagai default
        if (error.response?.status === 404) {
          setFormData({
            name: tenantData.name || '',
            type: '',
            jenjang: '',
            address: tenantData.address || '',
            village: '',
            subDistrict: '',
            district: '',
            city: '',
            province: '',
            postalCode: '',
            phone: tenantData.phone || '',
            email: tenantData.email || '',
            website: '',
            principalName: '',
            principalNip: '',
            principalPhone: '',
            principalEmail: '',
            description: '',
            vision: '',
            mission: '',
            accreditation: '',
            accreditationDate: '',
            licenseNumber: '',
            licenseDate: '',
            establishedDate: '',
            notes: '',
            kurikulum: '',
            tahunPelajaranAktif: '',
          });
        } else {
          console.error('Error loading data pokok:', error);
        }
      }
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
      newErrors.name = 'Nama madrasah wajib diisi';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.principalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.principalEmail)) {
      newErrors.principalEmail = 'Format email kepala madrasah tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      showError('Data instansi tidak ditemukan');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Update tenant basic info
      await tenantApi.update(tenant.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      // Update or create data pokok
      if (dataPokok) {
        await dataPokokApi.update(tenant.id, formData);
      } else {
        await dataPokokApi.create(tenant.id, formData);
      }

      success('Data dasar madrasah berhasil diperbarui');
      loadData();
    } catch (error: any) {
      console.error('Error updating data:', error);
      const errorMessage =
        error.response?.data?.message || 'Gagal memperbarui data dasar madrasah';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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
            <h1 className="text-2xl font-bold text-gray-900">Data Dasar Madrasah</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola informasi lengkap data dasar madrasah Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-8">
            {/* Identitas Madrasah */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Identitas Madrasah
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
                    NPSN tidak dapat diubah. Gunakan menu Perubahan NPSN untuk mengajukan perubahan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nama Madrasah <span className="text-red-500">*</span>
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
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tipe Madrasah
                  </label>
                  <Input
                    id="type"
                    name="type"
                    type="text"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Contoh: MI, MTs, MA"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jenjang"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Jenjang
                  </label>
                  <select
                    id="jenjang"
                    name="jenjang"
                    value={formData.jenjang}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Jenjang</option>
                    <option value="SD/MI">SD/MI</option>
                    <option value="SMP/MTs">SMP/MTs</option>
                    <option value="SMA/MA">SMA/MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="kurikulum"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kurikulum
                  </label>
                  <select
                    id="kurikulum"
                    name="kurikulum"
                    value={formData.kurikulum}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kurikulum</option>
                    <option value="K13">K13</option>
                    <option value="Merdeka">Merdeka</option>
                    <option value="Mandiri">Mandiri</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Kurikulum yang dipilih akan menentukan mata pelajaran yang tersedia
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tahunPelajaranAktif"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tahun Pelajaran Aktif
                  </label>
                  <select
                    id="tahunPelajaranAktif"
                    name="tahunPelajaranAktif"
                    value={formData.tahunPelajaranAktif}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Tahun Pelajaran</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Tahun pelajaran aktif akan memisahkan data dari tahun pelajaran lainnya
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="establishedDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tanggal Berdiri
                  </label>
                  <Input
                    id="establishedDate"
                    name="establishedDate"
                    type="date"
                    value={formData.establishedDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Alamat Lengkap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
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
                    placeholder="Masukkan alamat lengkap madrasah"
                  />
                </div>

                <div>
                  <label
                    htmlFor="village"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Desa/Kelurahan
                  </label>
                  <Input
                    id="village"
                    name="village"
                    type="text"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="subDistrict"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kecamatan
                  </label>
                  <Input
                    id="subDistrict"
                    name="subDistrict"
                    type="text"
                    value={formData.subDistrict}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kabupaten/Kota
                  </label>
                  <Input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kota
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Provinsi
                  </label>
                  <Input
                    id="province"
                    name="province"
                    type="text"
                    value={formData.province}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kode Pos
                  </label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Kontak
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="md:col-span-2">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Kepala Madrasah */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Kepala Madrasah
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="principalName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nama Kepala Madrasah
                  </label>
                  <Input
                    id="principalName"
                    name="principalName"
                    type="text"
                    value={formData.principalName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="principalNip"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    NIP
                  </label>
                  <Input
                    id="principalNip"
                    name="principalNip"
                    type="text"
                    value={formData.principalNip}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="principalPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telepon
                  </label>
                  <Input
                    id="principalPhone"
                    name="principalPhone"
                    type="tel"
                    value={formData.principalPhone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="principalEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="principalEmail"
                    name="principalEmail"
                    type="email"
                    value={formData.principalEmail}
                    onChange={handleChange}
                    error={errors.principalEmail}
                  />
                </div>
              </div>
            </div>

            {/* Visi & Misi */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Visi & Misi
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="vision"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Visi
                  </label>
                  <Textarea
                    id="vision"
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Masukkan visi madrasah"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mission"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Misi
                  </label>
                  <Textarea
                    id="mission"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan misi madrasah"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Deskripsi
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan deskripsi madrasah"
                  />
                </div>
              </div>
            </div>

            {/* Akreditasi & Izin */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Akreditasi & Izin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="accreditation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Akreditasi
                  </label>
                  <Input
                    id="accreditation"
                    name="accreditation"
                    type="text"
                    value={formData.accreditation}
                    onChange={handleChange}
                    placeholder="Contoh: A, B, C"
                  />
                </div>

                <div>
                  <label
                    htmlFor="accreditationDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tanggal Akreditasi
                  </label>
                  <Input
                    id="accreditationDate"
                    name="accreditationDate"
                    type="date"
                    value={formData.accreditationDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nomor Izin Operasional
                  </label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tanggal Izin Operasional
                  </label>
                  <Input
                    id="licenseDate"
                    name="licenseDate"
                    type="date"
                    value={formData.licenseDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Catatan
              </h2>
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Catatan Tambahan
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Masukkan catatan tambahan jika ada"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
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
                loadData();
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
