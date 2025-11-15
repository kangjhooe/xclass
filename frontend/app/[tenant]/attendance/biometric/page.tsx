'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  biometricApi,
  BiometricDevice,
  DeviceType,
  DeviceStatus,
  BiometricEnrollment,
} from '@/lib/api/biometric';
import { studentsApi } from '@/lib/api/students';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { Fingerprint, Plus, Edit, Trash2, Power, PowerOff, Users, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function BiometricPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    type: DeviceType.FINGERPRINT,
    location: '',
    ipAddress: '',
    port: '',
    apiUrl: '',
    apiKey: '',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['biometric-devices', tenantId],
    queryFn: () => biometricApi.getDevices(tenantId!),
    enabled: !!tenantId,
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ['biometric-enrollments', tenantId, selectedDevice?.id],
    queryFn: () => biometricApi.getEnrollments(tenantId!, selectedDevice!.id),
    enabled: !!tenantId && !!selectedDevice,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return biometricApi.createDevice(tenantId, {
        ...data,
        port: data.port ? parseInt(data.port) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return biometricApi.updateDevice(tenantId, id, {
        ...data,
        port: data.port ? parseInt(data.port) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return biometricApi.deleteDevice(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      deviceId: '',
      type: DeviceType.FINGERPRINT,
      location: '',
      ipAddress: '',
      port: '',
      apiUrl: '',
      apiKey: '',
      description: '',
    });
    setEditingDevice(null);
  };

  const handleEdit = (device: BiometricDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      deviceId: device.deviceId,
      type: device.type,
      location: device.location || '',
      ipAddress: device.ipAddress || '',
      port: device.port?.toString() || '',
      apiUrl: device.apiUrl || '',
      apiKey: device.apiKey || '',
      description: device.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDevice) {
      updateMutation.mutate({ id: editingDevice.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const devices = data?.data || [];
  const enrollments = enrollmentsData?.data || [];
  const students = studentsData?.data || [];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="attendance"
        title="Absensi Biometrik"
        description="Kelola perangkat biometrik dan enrollment siswa"
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Device
          </Button>
        }
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Devices List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Daftar Device</h2>
              {devices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada device yang terdaftar</p>
                  <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                    Tambah Device Pertama
                  </Button>
                </div>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Fingerprint className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{device.name}</h3>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                            {device.type.replace('_', ' ')}
                          </span>
                          {device.status === DeviceStatus.ACTIVE ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {device.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Device ID:</span> {device.deviceId}
                        </p>
                        {device.location && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Lokasi:</span> {device.location}
                          </p>
                        )}
                        {device.lastSyncAt && (
                          <p className="text-sm text-gray-500">
                            Last sync: {formatDate(device.lastSyncAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(device);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Hapus device ini?')) {
                              deleteMutation.mutate(device.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Enrollments for Selected Device */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Enrollment</h2>
                {selectedDevice && (
                  <Button
                    onClick={() => setIsEnrollmentModalOpen(true)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Users className="w-4 h-4" />
                    Enroll Siswa
                  </Button>
                )}
              </div>
              {!selectedDevice ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Pilih device untuk melihat enrollment</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada siswa yang ter-enroll</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-white border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{enrollment.student?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          NISN: {enrollment.student?.nisn || '-'} | ID: {enrollment.biometricId}
                        </p>
                        {enrollment.enrolledAt && (
                          <p className="text-xs text-gray-500">
                            Enrolled: {formatDate(enrollment.enrolledAt)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Hapus enrollment ini?')) {
                            if (!tenantId) return;
                            try {
                              await biometricApi.deleteEnrollment(tenantId, enrollment.id);
                              queryClient.invalidateQueries({
                                queryKey: ['biometric-enrollments', tenantId, selectedDevice?.id],
                              });
                            } catch (error) {
                              alert('Gagal menghapus enrollment');
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingDevice ? 'Edit Device' : 'Tambah Device Baru'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Device"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Fingerprint Device 1"
            />

            <Input
              label="Device ID"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              required
              placeholder="Unique device identifier"
              helpText="ID unik dari device (dari hardware)"
            />

            <Select
              label="Tipe Device"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
              options={[
                { value: DeviceType.FINGERPRINT, label: 'Fingerprint' },
                { value: DeviceType.FACE_RECOGNITION, label: 'Face Recognition' },
                { value: DeviceType.CARD_READER, label: 'Card Reader' },
              ]}
            />

            <Input
              label="Lokasi"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Ruang Kelas 1A"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IP Address"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
              />

              <Input
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="8080"
              />
            </div>

            <Input
              label="API URL"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              placeholder="https://api.device.com"
            />

            <Input
              label="API Key"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="API key untuk autentikasi"
            />

            <Textarea
              label="Deskripsi"
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
                {editingDevice ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Enrollment Modal */}
        <Modal
          isOpen={isEnrollmentModalOpen}
          onClose={() => setIsEnrollmentModalOpen(false)}
          title="Enroll Siswa ke Device"
        >
          <EnrollmentForm
            device={selectedDevice}
            students={students}
            tenantId={tenantId!}
            onSuccess={() => {
              setIsEnrollmentModalOpen(false);
              queryClient.invalidateQueries({
                queryKey: ['biometric-enrollments', tenantId, selectedDevice?.id],
              });
            }}
          />
        </Modal>
      </ModulePageShell>
    </TenantLayout>
  );
}

function EnrollmentForm({
  device,
  students,
  tenantId,
  onSuccess,
}: {
  device: BiometricDevice | null;
  students: any[];
  tenantId: number;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    biometricId: '',
  });

  const enrollMutation = useMutation({
    mutationFn: (data: any) => {
      if (!device) throw new Error('Device tidak dipilih');
      return biometricApi.enrollStudent(tenantId, device.id, {
        studentId: parseInt(data.studentId),
        biometricId: data.biometricId,
      });
    },
    onSuccess: () => {
      onSuccess();
      setFormData({ studentId: '', biometricId: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.biometricId) {
      alert('Siswa dan Biometric ID harus diisi');
      return;
    }
    enrollMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Pilih Siswa"
        value={formData.studentId}
        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
        required
        options={[
          { value: '', label: 'Pilih Siswa' },
          ...(students || []).map((student) => ({
            value: student.id.toString(),
            label: `${student.name} (${student.nisn || student.nis || '-'})`,
          })),
        ]}
      />

      <Input
        label="Biometric ID"
        value={formData.biometricId}
        onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
        required
        placeholder="ID dari device (fingerprint ID, face ID, dll)"
        helpText="Masukkan ID biometrik dari device"
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Batal
        </Button>
        <Button type="submit" loading={enrollMutation.isPending}>
          Enroll
        </Button>
      </div>
    </form>
  );
}

