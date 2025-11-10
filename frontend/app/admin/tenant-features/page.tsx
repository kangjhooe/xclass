'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  tenantFeaturesApi,
  TenantFeature,
  TenantModule,
} from '@/lib/api/tenant-features';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';

export default function TenantFeaturesPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [features, setFeatures] = useState<TenantFeature[]>([]);
  const [modules, setModules] = useState<TenantModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'features' | 'modules'>('features');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    TenantFeature | TenantModule | null
  >(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      loadData();
    }
  }, [selectedTenantId, activeTab]);

  const loadTenants = async () => {
    try {
      const response = await adminApi.getAllTenants();
      setTenants(response.data.data);
      if (response.data.data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedTenantId) return;
    try {
      setLoading(true);
      if (activeTab === 'features') {
        const response = await tenantFeaturesApi.getTenantFeatures(
          selectedTenantId,
        );
        setFeatures(response.data);
      } else {
        const response = await tenantFeaturesApi.getTenantModules(
          selectedTenantId,
        );
        setModules(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    if (!selectedTenantId) return;
    try {
      if (activeTab === 'features') {
        await tenantFeaturesApi.toggleTenantFeature(selectedTenantId, key);
      } else {
        await tenantFeaturesApi.toggleTenantModule(selectedTenantId, key);
      }
      loadData();
    } catch (error) {
      console.error('Error toggling:', error);
      alert('Gagal mengubah status');
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (item: TenantFeature | TenantModule) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTenantId) return;
    try {
      if (activeTab === 'features') {
        if (editingItem) {
          await tenantFeaturesApi.updateTenantFeature(
            selectedTenantId,
            editingItem.featureKey || formData.featureKey,
            formData,
          );
        } else {
          await tenantFeaturesApi.createTenantFeature(selectedTenantId, formData);
        }
      } else {
        if (editingItem) {
          await tenantFeaturesApi.updateTenantModule(
            selectedTenantId,
            editingItem.moduleKey || formData.moduleKey,
            formData,
          );
        } else {
          await tenantFeaturesApi.createTenantModule(selectedTenantId, formData);
        }
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan');
    }
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  if (loading && !selectedTenantId) {
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
              Tenant Features Management
            </h1>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah {activeTab === 'features' ? 'Feature' : 'Module'}
            </Button>
          </div>
          <p className="text-gray-600">Kelola fitur dan modul untuk setiap tenant</p>
        </div>

        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pilih Tenant
          </label>
          <select
            value={selectedTenantId || ''}
            onChange={(e) => setSelectedTenantId(Number(e.target.value))}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} ({tenant.npsn})
              </option>
            ))}
          </select>
        </div>

        {selectedTenantId && (
          <>
            {/* Tabs */}
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'features'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('modules')}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'modules'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Modules
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6">
                {activeTab === 'features' ? (
                  <div className="space-y-3">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {feature.featureName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {feature.featureKey}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={feature.isEnabled}
                              onChange={() => handleToggle(feature.featureKey)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {feature.isEnabled ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(feature)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    {features.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        Belum ada features untuk tenant ini
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {module.moduleName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {module.moduleKey}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={module.isEnabled}
                              onChange={() => handleToggle(module.moduleKey)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {module.isEnabled ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(module)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    {modules.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        Belum ada modules untuk tenant ini
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${editingItem ? 'Edit' : 'Tambah'} ${activeTab === 'features' ? 'Feature' : 'Module'}`}
        >
          <div className="space-y-4">
            <Input
              label={activeTab === 'features' ? 'Feature Key' : 'Module Key'}
              value={formData.featureKey || formData.moduleKey || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [activeTab === 'features' ? 'featureKey' : 'moduleKey']:
                    e.target.value,
                })
              }
              disabled={!!editingItem}
              required
            />
            <Input
              label={activeTab === 'features' ? 'Feature Name' : 'Module Name'}
              value={formData.featureName || formData.moduleName || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [activeTab === 'features' ? 'featureName' : 'moduleName']:
                    e.target.value,
                })
              }
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isEnabled || false}
                onChange={(e) =>
                  setFormData({ ...formData, isEnabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Aktif</label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

