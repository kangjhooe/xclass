'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  notificationChannelsApi,
  NotificationChannel,
  NotificationChannelCreateData,
  ChannelType,
  ChannelProvider,
} from '@/lib/api/notification-channels';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { Settings, Trash2, Power, PowerOff, Edit, Plus } from 'lucide-react';

export default function NotificationChannelsPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [formData, setFormData] = useState<NotificationChannelCreateData>({
    name: '',
    type: ChannelType.SMS,
    provider: ChannelProvider.TWILIO,
    config: {},
    isActive: true,
    isDefault: false,
    priority: 0,
    description: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-channels', tenantId],
    queryFn: () => notificationChannelsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: NotificationChannelCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return notificationChannelsApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Gagal membuat channel');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NotificationChannelCreateData> }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return notificationChannelsApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Gagal mengupdate channel');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return notificationChannelsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels', tenantId] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return notificationChannelsApi.deactivate(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: ChannelType.SMS,
      provider: ChannelProvider.TWILIO,
      config: {},
      isActive: true,
      isDefault: false,
      priority: 0,
      description: '',
    });
    setEditingChannel(null);
  };

  const handleEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      type: channel.type,
      provider: channel.provider,
      config: channel.config,
      isActive: channel.isActive,
      isDefault: channel.isDefault,
      priority: channel.priority,
      description: channel.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on provider
    if (!formData.name.trim()) {
      alert('Nama channel harus diisi');
      return;
    }

    if (!formData.config || Object.keys(formData.config).length === 0) {
      alert('Konfigurasi channel harus diisi');
      return;
    }

    // Validate config based on provider
    const { type, provider, config } = formData;
    if (type === ChannelType.SMS) {
      if (provider === ChannelProvider.TWILIO) {
        if (!config.accountSid || !config.authToken) {
          alert('Twilio memerlukan Account SID dan Auth Token');
          return;
        }
      } else if (provider === ChannelProvider.RAJA_SMS) {
        if (!config.apiKey) {
          alert('Raja SMS memerlukan API Key');
          return;
        }
      } else if (provider === ChannelProvider.ZENZIVA) {
        if (!config.userKey || !config.passKey) {
          alert('Zenziva memerlukan User Key dan Pass Key');
          return;
        }
      }
    } else if (type === ChannelType.WHATSAPP) {
      if (provider === ChannelProvider.WHATSAPP_CLOUD_API) {
        if (!config.phoneNumberId || !config.accessToken) {
          alert('WhatsApp Cloud API memerlukan Phone Number ID dan Access Token');
          return;
        }
      } else if (provider === ChannelProvider.WHATSAPP_BUSINESS) {
        if (!config.apiUrl || !config.apiKey) {
          alert('WhatsApp Business API memerlukan API URL dan API Key');
          return;
        }
      }
    }

    if (editingChannel) {
      updateMutation.mutate({ id: editingChannel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getProviderConfigFields = () => {
    const { type, provider } = formData;

    if (type === ChannelType.SMS) {
      if (provider === ChannelProvider.TWILIO) {
        return (
          <>
            <Input
              label="Account SID"
              value={formData.config.accountSid || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, accountSid: e.target.value },
                })
              }
              placeholder="AC..."
            />
            <Input
              label="Auth Token"
              type="password"
              value={formData.config.authToken || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, authToken: e.target.value },
                })
              }
              placeholder="xxx"
            />
            <Input
              label="From Number"
              value={formData.config.fromNumber || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, fromNumber: e.target.value },
                })
              }
              placeholder="+1234567890"
            />
          </>
        );
      } else if (provider === ChannelProvider.RAJA_SMS) {
        return (
          <>
            <Input
              label="API Key"
              value={formData.config.apiKey || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiKey: e.target.value },
                })
              }
              placeholder="xxx"
            />
            <Input
              label="API URL"
              value={formData.config.apiUrl || 'https://api.raja-sms.com'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiUrl: e.target.value },
                })
              }
            />
            <Input
              label="Sender ID"
              value={formData.config.senderId || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, senderId: e.target.value },
                })
              }
              placeholder="XCLASS"
            />
          </>
        );
      } else if (provider === ChannelProvider.ZENZIVA) {
        return (
          <>
            <Input
              label="User Key"
              value={formData.config.userKey || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, userKey: e.target.value },
                })
              }
            />
            <Input
              label="Pass Key"
              type="password"
              value={formData.config.passKey || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, passKey: e.target.value },
                })
              }
            />
            <Input
              label="API URL"
              value={formData.config.apiUrl || 'https://console.zenziva.net'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiUrl: e.target.value },
                })
              }
            />
          </>
        );
      }
    } else if (type === ChannelType.WHATSAPP) {
      if (provider === ChannelProvider.WHATSAPP_CLOUD_API) {
        return (
          <>
            <Input
              label="Phone Number ID"
              value={formData.config.phoneNumberId || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, phoneNumberId: e.target.value },
                })
              }
              placeholder="123456789"
            />
            <Input
              label="Access Token"
              type="password"
              value={formData.config.accessToken || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, accessToken: e.target.value },
                })
              }
              placeholder="EAA..."
            />
            <Input
              label="API Version"
              value={formData.config.apiVersion || 'v21.0'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiVersion: e.target.value },
                })
              }
            />
          </>
        );
      } else if (provider === ChannelProvider.WHATSAPP_BUSINESS) {
        return (
          <>
            <Input
              label="API URL"
              value={formData.config.apiUrl || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiUrl: e.target.value },
                })
              }
              placeholder="https://api.whatsapp-business.com"
            />
            <Input
              label="API Key"
              type="password"
              value={formData.config.apiKey || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, apiKey: e.target.value },
                })
              }
            />
          </>
        );
      }
    }

    return null;
  };

  const channels = data?.data || [];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="notifications"
        title="Channel Notifikasi"
        description="Kelola konfigurasi channel untuk pengiriman notifikasi (SMS, WhatsApp, Email, Push)"
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Channel
          </Button>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada channel yang dikonfigurasi</p>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                  Tambah Channel Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{channel.name}</h3>
                          {channel.isDefault && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Default
                            </span>
                          )}
                          {channel.isActive ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                              <Power className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded flex items-center gap-1">
                              <PowerOff className="w-3 h-3" />
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Type:</span> {channel.type} |{' '}
                          <span className="font-medium">Provider:</span> {channel.provider} |{' '}
                          <span className="font-medium">Priority:</span> {channel.priority}
                        </p>
                        {channel.description && (
                          <p className="text-sm text-gray-500">{channel.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(channel)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        {channel.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Nonaktifkan channel ini?')) {
                                deactivateMutation.mutate(channel.id);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <PowerOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateMutation.mutate({
                                id: channel.id,
                                data: { isActive: true },
                              });
                            }}
                            className="flex items-center gap-2"
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('Hapus channel ini? Tindakan ini tidak dapat dibatalkan.')) {
                              deleteMutation.mutate(channel.id);
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingChannel ? 'Edit Channel' : 'Tambah Channel Baru'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Channel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., WhatsApp Production"
            />

            <Select
              label="Tipe Channel"
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as ChannelType;
                setFormData({
                  ...formData,
                  type: newType,
                  // Reset provider based on type
                  provider:
                    newType === ChannelType.SMS
                      ? ChannelProvider.TWILIO
                      : newType === ChannelType.WHATSAPP
                        ? ChannelProvider.WHATSAPP_CLOUD_API
                        : ChannelProvider.SMTP,
                });
              }}
              options={[
                { value: ChannelType.SMS, label: 'SMS' },
                { value: ChannelType.WHATSAPP, label: 'WhatsApp' },
                { value: ChannelType.EMAIL, label: 'Email' },
                { value: ChannelType.PUSH, label: 'Push Notification' },
              ]}
            />

            {formData.type === ChannelType.SMS && (
              <Select
                label="SMS Provider"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value as ChannelProvider })
                }
                options={[
                  { value: ChannelProvider.TWILIO, label: 'Twilio' },
                  { value: ChannelProvider.RAJA_SMS, label: 'Raja SMS' },
                  { value: ChannelProvider.ZENZIVA, label: 'Zenziva' },
                ]}
              />
            )}

            {formData.type === ChannelType.WHATSAPP && (
              <Select
                label="WhatsApp Provider"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value as ChannelProvider })
                }
                options={[
                  { value: ChannelProvider.WHATSAPP_CLOUD_API, label: 'WhatsApp Cloud API' },
                  { value: ChannelProvider.WHATSAPP_BUSINESS, label: 'WhatsApp Business API' },
                ]}
              />
            )}

            <div className="space-y-3">{getProviderConfigFields()}</div>

            <Input
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              min={0}
              helpText="Priority untuk fallback (0 = highest priority)"
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Set sebagai default</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Aktif</span>
              </label>
            </div>

            <Textarea
              label="Deskripsi (Opsional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingChannel ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

