'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { facilityApi, Facility, FacilityCreateData } from '@/lib/api/facility';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/lib/store/toast';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function FacilityPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<FacilityCreateData>({
    name: '',
    type: 'room',
    description: '',
    location: '',
    capacity: undefined,
    metadata: {},
    isActive: true,
  });
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['facilities', tenantId],
    queryFn: () => facilityApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FacilityCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return facilityApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Fasilitas berhasil ditambahkan');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Gagal menambahkan fasilitas');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FacilityCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return facilityApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', tenantId] });
      setIsModalOpen(false);
      setSelectedFacility(null);
      resetForm();
      success('Fasilitas berhasil diperbarui');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Gagal memperbarui fasilitas');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return facilityApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', tenantId] });
      success('Fasilitas berhasil dihapus');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Gagal menghapus fasilitas');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'room',
      description: '',
      location: '',
      capacity: undefined,
      metadata: {},
      isActive: true,
    });
    setSelectedFacility(null);
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      description: facility.description || '',
      location: facility.location || '',
      capacity: facility.capacity,
      metadata: facility.metadata || {},
      isActive: facility.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedFacility) {
      updateMutation.mutate({ id: selectedFacility.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      building: 'Gedung',
      room: 'Ruangan',
      land: 'Tanah',
      equipment: 'Peralatan',
    };
    return labels[type] || type;
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Fasilitas</h1>
          <Button onClick={() => setIsModalOpen(true)}>Tambah Fasilitas</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((facility) => (
                    <TableRow key={facility.id}>
                      <TableCell className="font-medium">{facility.name}</TableCell>
                      <TableCell>{getTypeLabel(facility.type)}</TableCell>
                      <TableCell>{facility.location || '-'}</TableCell>
                      <TableCell>{facility.capacity || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            facility.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {facility.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(facility)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(facility.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Belum ada data fasilitas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Fasilitas *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setFormData({ 
                    ...formData, 
                    type: newType,
                    metadata: {} // Reset metadata saat ganti tipe
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="building">Gedung</option>
                <option value="room">Ruangan</option>
                <option value="land">Tanah</option>
                <option value="equipment">Peralatan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Field khusus untuk Tanah */}
            {formData.type === 'land' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Luas (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metadata?.area || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            area: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Kepemilikan
                    </label>
                    <select
                      value={formData.metadata?.ownershipStatus || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            ownershipStatus: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Status</option>
                      <option value="owned">Milik Sendiri</option>
                      <option value="rented">Sewa</option>
                      <option value="borrowed">Pinjam</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Panjang (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metadata?.length || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            length: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lebar (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metadata?.width || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            width: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Field khusus untuk Gedung */}
            {formData.type === 'building' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Lantai
                    </label>
                    <input
                      type="number"
                      value={formData.metadata?.floors || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            floors: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Luas Bangunan (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metadata?.buildingArea || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            buildingArea: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Dibangun
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.metadata?.yearBuilt || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            yearBuilt: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Kepemilikan
                    </label>
                    <select
                      value={formData.metadata?.ownershipStatus || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            ownershipStatus: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Status</option>
                      <option value="owned">Milik Sendiri</option>
                      <option value="rented">Sewa</option>
                      <option value="borrowed">Pinjam</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Field khusus untuk Ruangan */}
            {formData.type === 'room' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Luas Ruangan (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metadata?.roomArea || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            roomArea: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lantai
                    </label>
                    <input
                      type="number"
                      value={formData.metadata?.floor || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            floor: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas
                  </label>
                  <input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jumlah orang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fasilitas dalam Ruangan
                  </label>
                  <textarea
                    value={formData.metadata?.roomFacilities || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          roomFacilities: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: AC, Proyektor, Papan Tulis, dll"
                  />
                </div>
              </>
            )}

            {/* Field khusus untuk Peralatan */}
            {formData.type === 'equipment' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merek/Model
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.brand || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            brand: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Seri
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.serialNumber || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            serialNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Pembelian
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.metadata?.purchaseYear || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            purchaseYear: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kondisi
                    </label>
                    <select
                      value={formData.metadata?.condition || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            condition: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kondisi</option>
                      <option value="excellent">Sangat Baik</option>
                      <option value="good">Baik</option>
                      <option value="fair">Cukup</option>
                      <option value="poor">Buruk</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Aktif
              </label>
            </div>

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
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {selectedFacility ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

