'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { systemSettingsApi, SystemSetting } from '@/lib/api/system-settings';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [allSettings, setAllSettings] = useState<SystemSetting[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [formData, setFormData] = useState<Partial<SystemSetting>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [branding, setBranding] = useState<{ logo: string | null; favicon: string | null }>({
    logo: null,
    favicon: null,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    loadData();
    loadBranding();
  }, [selectedCategory]);

  // Filter settings
  const filteredSettings = useMemo(() => {
    let filtered = [...allSettings];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((setting) => setting.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (setting) =>
          setting.key?.toLowerCase().includes(query) ||
          setting.value?.toLowerCase().includes(query) ||
          setting.description?.toLowerCase().includes(query) ||
          setting.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allSettings, selectedCategory, searchQuery]);

  // Group settings by category
  const groupedSettings = useMemo(() => {
    return filteredSettings.reduce((acc, setting) => {
      const category = setting.category || 'Lainnya';
      if (!acc[category]) acc[category] = [];
      acc[category].push(setting);
      return acc;
    }, {} as Record<string, SystemSetting[]>);
  }, [filteredSettings]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, categoriesRes] = await Promise.all([
        systemSettingsApi.getAll(),
        systemSettingsApi.getCategories(),
      ]);
      setAllSettings(settingsRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      showError(err?.response?.data?.message || 'Gagal memuat data pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const loadBranding = async () => {
    try {
      const response = await adminApi.getBrandingSettings();
      setBranding(response.data);
    } catch (err: any) {
      console.error('Error loading branding:', err);
      // Don't show error for branding, just use defaults
    }
  };

  const handleLogoUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      setUploadingLogo(true);
      const response = await adminApi.uploadLogo(files[0]);
      setBranding((prev) => ({ ...prev, logo: response.data.url }));
      success('Logo berhasil diunggah');
      loadData(); // Reload settings to update app_logo
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      showError(err?.response?.data?.message || 'Gagal mengunggah logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      setUploadingFavicon(true);
      const response = await adminApi.uploadFavicon(files[0]);
      setBranding((prev) => ({ ...prev, favicon: response.data.url }));
      success('Favicon berhasil diunggah');
      loadData(); // Reload settings to update app_favicon
    } catch (err: any) {
      console.error('Error uploading favicon:', err);
      showError(err?.response?.data?.message || 'Gagal mengunggah favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const getFileUrl = (path: string | null): string => {
    if (!path) return '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return path.startsWith('http') ? path : `${apiUrl}${path}`;
  };

  const handleCreate = () => {
    setEditingSetting(null);
    setFormData({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setFormData(setting);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.key?.trim()) {
      errors.key = 'Key wajib diisi';
    } else if (!/^[a-z0-9_]+$/i.test(formData.key)) {
      errors.key = 'Key hanya boleh mengandung huruf, angka, dan underscore';
    }

    if (formData.value === undefined || formData.value === null || formData.value === '') {
      errors.value = 'Value wajib diisi';
    }

    // Validate JSON if type is json
    if (formData.type === 'json' && formData.value) {
      try {
        JSON.parse(formData.value);
      } catch {
        errors.value = 'Format JSON tidak valid';
      }
    }

    // Validate number if type is number
    if (formData.type === 'number' && formData.value) {
      if (isNaN(Number(formData.value))) {
        errors.value = 'Value harus berupa angka';
      }
    }

    // Validate boolean if type is boolean
    if (formData.type === 'boolean' && formData.value) {
      if (!['true', 'false', '1', '0'].includes(formData.value.toLowerCase())) {
        errors.value = 'Value harus berupa true atau false';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...formData };

      // Parse JSON if type is json
      if (dataToSave.type === 'json' && typeof dataToSave.value === 'string') {
        try {
          JSON.parse(dataToSave.value);
        } catch {
          showError('Format JSON tidak valid');
          setSaving(false);
          return;
        }
      }

      // Convert boolean string to actual boolean
      if (dataToSave.type === 'boolean' && typeof dataToSave.value === 'string') {
        dataToSave.value = ['true', '1'].includes(dataToSave.value.toLowerCase())
          ? 'true'
          : 'false';
      }

      if (editingSetting) {
        await systemSettingsApi.update(editingSetting.key, dataToSave);
        success('Pengaturan berhasil diperbarui');
      } else {
        await systemSettingsApi.create(dataToSave);
        success('Pengaturan berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Error saving setting:', err);
      showError(err?.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Yakin ingin menghapus pengaturan ini?')) return;
    try {
      await systemSettingsApi.delete(key);
      success('Pengaturan berhasil dihapus');
      loadData();
    } catch (err: any) {
      console.error('Error deleting setting:', err);
      showError(err?.response?.data?.message || 'Gagal menghapus pengaturan');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Settings
            </h1>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Pengaturan
            </Button>
          </div>
          <p className="text-gray-600">Kelola pengaturan sistem aplikasi</p>
        </div>

        {/* Branding Section */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Branding</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Logo Aplikasi</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Logo yang ditampilkan di header dan berbagai tempat di aplikasi. Format: PNG, JPG, SVG (Maks: 10MB)
                </p>
              </div>
              
              {branding.logo && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo Saat Ini:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    <img
                      src={getFileUrl(branding.logo)}
                      alt="Logo"
                      className="max-h-32 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <FileUpload
                onUpload={handleLogoUpload}
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                maxSize={10}
                disabled={uploadingLogo}
              />
            </div>

            {/* Favicon Upload */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Favicon</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Icon yang ditampilkan di tab browser. Format: ICO, PNG, SVG (Maks: 10MB)
                </p>
              </div>

              {branding.favicon && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Favicon Saat Ini:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    <img
                      src={getFileUrl(branding.favicon)}
                      alt="Favicon"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <FileUpload
                onUpload={handleFaviconUpload}
                accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                maxSize={10}
                disabled={uploadingFavicon}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex gap-4">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Cari berdasarkan key, value, deskripsi, atau kategori..."
                onSearch={setSearchQuery}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Settings List */}
        {Object.keys(groupedSettings).length === 0 ? (
          <EmptyState
            title="Tidak ada pengaturan"
            description={
              searchQuery || selectedCategory
                ? `Tidak ada pengaturan yang sesuai dengan filter yang dipilih`
                : 'Belum ada pengaturan yang terdaftar. Klik tombol "Tambah Pengaturan" untuk menambahkan pengaturan baru.'
            }
            action={
              !searchQuery && !selectedCategory && (
                <Button onClick={handleCreate}>Tambah Pengaturan Pertama</Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                </div>
                <div className="space-y-3">
                  {categorySettings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{setting.key}</div>
                        {setting.description && (
                          <div className="text-sm text-gray-500 mt-1">{setting.description}</div>
                        )}
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Nilai:</span>{' '}
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {setting.value || '(kosong)'}
                          </span>
                          {setting.type && (
                            <span className="ml-2 text-xs text-gray-400">({setting.type})</span>
                          )}
                        </div>
                        {setting.updatedAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Diperbarui: {formatDate(setting.updatedAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(setting.key)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !saving && setIsModalOpen(false)}
          title={editingSetting ? 'Edit Pengaturan' : 'Tambah Pengaturan'}
        >
          <div className="space-y-4">
            <Input
              label="Key"
              value={formData.key || ''}
              onChange={(e) => {
                setFormData({ ...formData, key: e.target.value });
                if (formErrors.key) {
                  setFormErrors({ ...formErrors, key: '' });
                }
              }}
              disabled={!!editingSetting}
              error={formErrors.key}
              required
              placeholder="contoh: app_name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type || 'string'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </div>
            {formData.type === 'json' ? (
              <Textarea
                label="Value"
                value={formData.value || ''}
                onChange={(e) => {
                  setFormData({ ...formData, value: e.target.value });
                  if (formErrors.value) {
                    setFormErrors({ ...formErrors, value: '' });
                  }
                }}
                error={formErrors.value}
                required
                placeholder='{"key": "value"}'
                rows={6}
              />
            ) : (
              <Input
                label="Value"
                value={formData.value || ''}
                onChange={(e) => {
                  setFormData({ ...formData, value: e.target.value });
                  if (formErrors.value) {
                    setFormErrors({ ...formErrors, value: '' });
                  }
                }}
                error={formErrors.value}
                required
                placeholder={
                  formData.type === 'boolean'
                    ? 'true atau false'
                    : formData.type === 'number'
                    ? '123'
                    : 'Masukkan nilai'
                }
              />
            )}
            <Input
              label="Kategori"
              value={formData.category || ''}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="contoh: General, Email, dll"
            />
            <Textarea
              label="Deskripsi"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
