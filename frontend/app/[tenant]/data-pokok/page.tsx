'use client';

import { useState, useEffect } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ModuleCard,
  ModuleEmptyState,
  ModuleHeader,
  ModuleLoadingState,
  ModulePage,
  ModuleSection,
} from '@/components/ui/module';
import { dataPokokApi, DataPokok, DataPokokCreateData } from '@/lib/api/data-pokok';
import { cn } from '@/lib/utils/cn';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function DataPokokPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['data-pokok', tenantId],
    queryFn: () => dataPokokApi.get(tenantId!),
    retry: false,
    enabled: !!tenantId,
  });

  const [formData, setFormData] = useState<DataPokokCreateData>({
    npsn: '',
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
  });

  useEffect(() => {
    if (data) {
      setFormData({
        npsn: data.npsn || '',
        name: data.name || '',
        type: data.type || '',
        jenjang: data.jenjang || '',
        address: data.address || '',
        village: data.village || '',
        subDistrict: data.subDistrict || '',
        district: data.district || '',
        city: data.city || '',
        province: data.province || '',
        postalCode: data.postalCode || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        principalName: data.principalName || '',
        principalNip: data.principalNip || '',
        principalPhone: data.principalPhone || '',
        principalEmail: data.principalEmail || '',
        description: data.description || '',
        vision: data.vision || '',
        mission: data.mission || '',
        accreditation: data.accreditation || '',
        accreditationDate: data.accreditationDate || '',
        licenseNumber: data.licenseNumber || '',
        licenseDate: data.licenseDate || '',
        establishedDate: data.establishedDate || '',
        notes: data.notes || '',
      });
      setIsEditMode(true);
    }
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (data: DataPokokCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return dataPokokApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-pokok', tenantId] });
      setIsModalOpen(false);
      success('Data pokok berhasil ditambahkan');
    },
    onError: () => {
      showError('Gagal menambahkan data pokok');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DataPokokCreateData>) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return dataPokokApi.update(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-pokok', tenantId] });
      setIsModalOpen(false);
      success('Data pokok berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate data pokok');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return dataPokokApi.delete(tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-pokok', tenantId] });
      setIsEditMode(false);
      success('Data pokok berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus data pokok');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus data pokok ini?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <TenantLayout>
      <ModulePage variant="blue">
        <ModuleHeader
          title="Data Pokok Instansi"
          description="Kelola informasi dasar instansi/sekolah agar tetap akurat dan mutakhir."
          variant="blue"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7"
              />
            </svg>
          }
          actions={
            <div className="flex items-center gap-2">
              {data ? (
                <>
                  <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
                    Hapus Data
                  </Button>
                  <Button onClick={() => setIsModalOpen(true)}>Edit Data</Button>
                </>
              ) : (
                <Button onClick={() => setIsModalOpen(true)}>Tambah Data Pokok</Button>
              )}
            </div>
          }
        />

        {isLoading ? (
          <ModuleLoadingState description="Mengambil informasi data pokok terbaru." />
        ) : data ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModuleSection
              title="Informasi Dasar"
              description="Detail identitas instansi dan informasi kontak."
            >
              <InfoGrid
                items={[
                  { label: 'NPSN', value: data.npsn },
                  { label: 'Nama Instansi', value: data.name, emphasize: true },
                  {
                    label: 'Tipe',
                    value: data.type,
                    secondaryLabel: 'Jenjang',
                    secondaryValue: data.jenjang,
                  },
                  { label: 'Alamat', value: data.address, fullRow: true },
                  {
                    label: 'Desa/Kelurahan',
                    value: data.village,
                    secondaryLabel: 'Kecamatan',
                    secondaryValue: data.subDistrict,
                  },
                  {
                    label: 'Kabupaten/Kota',
                    value: data.city,
                    secondaryLabel: 'Provinsi',
                    secondaryValue: data.province,
                  },
                  { label: 'Kode Pos', value: data.postalCode },
                  {
                    label: 'Telepon',
                    value: data.phone,
                    secondaryLabel: 'Email',
                    secondaryValue: data.email,
                  },
                  { label: 'Website', value: data.website },
                  {
                    label: 'Tanggal Berdiri',
                    value: data.establishedDate ? formatDate(data.establishedDate) : undefined,
                  },
                ]}
              />
            </ModuleSection>

            <ModuleSection
              title="Informasi Kepala Instansi"
              description="Data kontak pimpinan untuk koordinasi resmi."
            >
              <InfoGrid
                items={[
                  { label: 'Nama Kepala', value: data.principalName, emphasize: true },
                  { label: 'NIP', value: data.principalNip },
                  {
                    label: 'Telepon',
                    value: data.principalPhone,
                    secondaryLabel: 'Email',
                    secondaryValue: data.principalEmail,
                  },
                ]}
              />
            </ModuleSection>

            <ModuleSection
              title="Visi & Misi"
              description="Gambaran arah dan tujuan jangka panjang instansi."
              className="lg:col-span-2"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <ModuleCard tone="subtle">
                  <p className="text-sm font-semibold text-slate-600">Visi</p>
                  <p className="mt-2 text-sm text-slate-800 whitespace-pre-line">{data.vision || '-'}</p>
                </ModuleCard>
                <ModuleCard tone="subtle">
                  <p className="text-sm font-semibold text-slate-600">Misi</p>
                  <p className="mt-2 text-sm text-slate-800 whitespace-pre-line">{data.mission || '-'}</p>
                </ModuleCard>
              </div>
            </ModuleSection>

            <ModuleSection
              title="Akreditasi & Lisensi"
              description="Status perizinan dan kualitas instansi."
            >
              <InfoGrid
                items={[
                  { label: 'Akreditasi', value: data.accreditation, emphasize: true },
                  {
                    label: 'Tanggal Akreditasi',
                    value: data.accreditationDate ? formatDate(data.accreditationDate) : undefined,
                  },
                  { label: 'Nomor Lisensi', value: data.licenseNumber },
                  {
                    label: 'Tanggal Lisensi',
                    value: data.licenseDate ? formatDate(data.licenseDate) : undefined,
                  },
                ]}
              />
            </ModuleSection>

            {(data.description || data.notes) && (
              <ModuleSection
                title="Deskripsi & Catatan"
                description="Informasi tambahan terkait instansi."
                className="lg:col-span-2"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {data.description && (
                    <ModuleCard tone="subtle">
                      <p className="text-sm font-semibold text-slate-600">Deskripsi</p>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{data.description}</p>
                    </ModuleCard>
                  )}
                  {data.notes && (
                    <ModuleCard tone="subtle">
                      <p className="text-sm font-semibold text-slate-600">Catatan</p>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{data.notes}</p>
                    </ModuleCard>
                  )}
                </div>
              </ModuleSection>
            )}
          </div>
        ) : (
          <ModuleEmptyState
            title="Belum ada data pokok"
            description="Lengkapi data pokok instansi untuk memudahkan proses administrasi dan pelaporan."
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                Tambah Data Pokok
              </Button>
            }
          />
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditMode ? 'Edit Data Pokok' : 'Tambah Data Pokok'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Informasi Dasar
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NPSN</label>
                      <input
                        type="text"
                        value={formData.npsn}
                        onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Instansi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Tipe</option>
                        <option value="sd">SD</option>
                        <option value="smp">SMP</option>
                        <option value="sma">SMA</option>
                        <option value="smk">SMK</option>
                        <option value="ma">MA</option>
                        <option value="mts">MTs</option>
                        <option value="mi">MI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
                      <input
                        type="text"
                        value={formData.jenjang}
                        onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SD, SMP, SMA, SMK, dll"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desa/Kelurahan</label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                      <input
                        type="text"
                        value={formData.subDistrict}
                        onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berdiri</label>
                      <input
                        type="date"
                        value={formData.establishedDate}
                        onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Principal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Informasi Kepala Instansi
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala</label>
                      <input
                        type="text"
                        value={formData.principalName}
                        onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                      <input
                        type="text"
                        value={formData.principalNip}
                        onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                      <input
                        type="tel"
                        value={formData.principalPhone}
                        onChange={(e) => setFormData({ ...formData, principalPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.principalEmail}
                        onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision & Mission */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Visi & Misi
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
                    <textarea
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Accreditation & License */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Akreditasi & Lisensi
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Akreditasi</label>
                      <input
                        type="text"
                        value={formData.accreditation}
                        onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A, B, C, dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akreditasi</label>
                      <input
                        type="date"
                        value={formData.accreditationDate}
                        onChange={(e) => setFormData({ ...formData, accreditationDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Lisensi</label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lisensi</label>
                      <input
                        type="date"
                        value={formData.licenseDate}
                        onChange={(e) => setFormData({ ...formData, licenseDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Deskripsi & Catatan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {isEditMode ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </ModulePage>
    </TenantLayout>
  );
}

interface InfoItem {
  label: string;
  value?: string | null;
  secondaryLabel?: string;
  secondaryValue?: string | null;
  emphasize?: boolean;
  fullRow?: boolean;
}

interface InfoGridProps {
  items: InfoItem[];
}

function InfoGrid({ items }: InfoGridProps) {
  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const primaryValue = item.value ?? '-';
        const secondaryValue = item.secondaryValue ?? '-';

        if (item.secondaryLabel) {
          return (
            <div key={index} className="grid gap-4 md:grid-cols-2">
              <InfoField label={item.label} value={primaryValue} emphasize={item.emphasize} />
              <InfoField label={item.secondaryLabel} value={secondaryValue} />
            </div>
          );
        }

        return (
          <InfoField
            key={index}
            label={item.label}
            value={primaryValue}
            emphasize={item.emphasize}
            fullRow={item.fullRow}
          />
        );
      })}
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  emphasize?: boolean;
  fullRow?: boolean;
}

function InfoField({ label, value, emphasize, fullRow }: InfoFieldProps) {
  return (
    <div className={cn(fullRow ? 'md:col-span-2' : undefined, 'rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-100')}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-2 text-sm text-slate-800',
          emphasize ? 'text-base font-semibold text-slate-900' : undefined,
        )}
      >
        {value || '-'}
      </p>
    </div>
  );
}
