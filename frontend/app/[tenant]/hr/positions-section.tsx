'use client';

import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { hrApi, Position, PositionCreateData, PositionModule, PositionModuleCreateData, AVAILABLE_MODULES } from '@/lib/api/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export function PositionsSection() {
  const tenantId = useTenantId();
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedPositionForModule, setSelectedPositionForModule] = useState<Position | null>(null);
  const [positionFormData, setPositionFormData] = useState<PositionCreateData>({
    name: '',
    description: '',
    isActive: true,
  });
  const [moduleFormData, setModuleFormData] = useState<PositionModuleCreateData>({
    positionId: 0,
    moduleKey: '',
    moduleName: '',
    canView: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    description: '',
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['hr-positions', tenantId],
    queryFn: () => hrApi.getAllPositions(tenantId!),
    enabled: !!tenantId,
  });

  const { data: positionModules, isLoading: modulesLoading } = useQuery({
    queryKey: ['hr-position-modules', tenantId, selectedPositionForModule?.id],
    queryFn: () => hrApi.getModulesByPosition(tenantId!, selectedPositionForModule!.id),
    enabled: !!tenantId && !!selectedPositionForModule?.id,
  });

  const createPositionMutation = useMutation({
    mutationFn: (data: PositionCreateData) => hrApi.createPosition(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-positions'] });
      setIsPositionModalOpen(false);
      resetPositionForm();
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PositionCreateData> }) =>
      hrApi.updatePosition(tenantId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-positions'] });
      setIsPositionModalOpen(false);
      resetPositionForm();
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: (id: number) => hrApi.deletePosition(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-positions'] });
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: ({ positionId, data }: { positionId: number; data: PositionModuleCreateData }) =>
      hrApi.createPositionModule(tenantId!, positionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-position-modules'] });
      setIsModuleModalOpen(false);
      resetModuleForm();
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PositionModuleCreateData> }) =>
      hrApi.updatePositionModule(tenantId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-position-modules'] });
      setIsModuleModalOpen(false);
      resetModuleForm();
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: number) => hrApi.deletePositionModule(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-position-modules'] });
    },
  });

  const resetPositionForm = () => {
    setPositionFormData({ name: '', description: '', isActive: true });
    setSelectedPosition(null);
  };

  const resetModuleForm = () => {
    setModuleFormData({
      positionId: 0,
      moduleKey: '',
      moduleName: '',
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      description: '',
      isActive: true,
    });
  };

  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position);
    setPositionFormData({
      name: position.name,
      description: position.description || '',
      isActive: position.isActive,
    });
    setIsPositionModalOpen(true);
  };

  const handleAddModule = (position: Position) => {
    setSelectedPositionForModule(position);
    setModuleFormData({
      positionId: position.id,
      moduleKey: '',
      moduleName: '',
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      description: '',
      isActive: true,
    });
    setIsModuleModalOpen(true);
  };

  const handleModuleKeyChange = (moduleKey: string) => {
    const module = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
    setModuleFormData({
      ...moduleFormData,
      moduleKey,
      moduleName: module?.name || '',
    });
  };

  if (positionsLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Jabatan (Position)</h2>
        <Button
          onClick={() => {
            resetPositionForm();
            setIsPositionModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jabatan
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Jabatan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions && positions.length > 0 ? (
                positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-semibold">{position.name}</TableCell>
                    <TableCell>{position.description || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          position.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {position.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAddModule(position)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        variant="ghost"
                      >
                        Kelola Modul
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEditPosition(position)}
                          className="text-blue-600 hover:text-blue-800"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus jabatan ini?')) {
                              deletePositionMutation.mutate(position.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          variant="ghost"
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Belum ada jabatan. Klik "Tambah Jabatan" untuk menambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Position Modal */}
      <Modal
        isOpen={isPositionModalOpen}
        onClose={() => {
          setIsPositionModalOpen(false);
          resetPositionForm();
        }}
        title={selectedPosition ? 'Edit Jabatan' : 'Tambah Jabatan'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedPosition) {
              updatePositionMutation.mutate({ id: selectedPosition.id, data: positionFormData });
            } else {
              createPositionMutation.mutate(positionFormData);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan *</label>
            <Input
              value={positionFormData.name}
              onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
              required
              placeholder="Contoh: Guru BK, Bendahara, Staff"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={positionFormData.description}
              onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Deskripsi jabatan..."
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={positionFormData.isActive}
                onChange={(e) => setPositionFormData({ ...positionFormData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsPositionModalOpen(false);
                resetPositionForm();
              }}
              variant="ghost"
            >
              Batal
            </Button>
            <Button type="submit" disabled={createPositionMutation.isPending || updatePositionMutation.isPending}>
              {selectedPosition ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Module Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => {
          setIsModuleModalOpen(false);
          resetModuleForm();
        }}
        title={`Kelola Modul - ${selectedPositionForModule?.name || ''}`}
        size="lg"
      >
        {selectedPositionForModule && (
          <div className="space-y-6">
            {/* List existing modules */}
            {modulesLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Modul yang Sudah Dikonfigurasi</h3>
                {positionModules && positionModules.length > 0 ? (
                  <div className="space-y-2">
                    {positionModules.map((pm) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{pm.moduleName}</p>
                          <p className="text-sm text-gray-600">
                            {pm.canView && 'View'} {pm.canCreate && 'Create'}{' '}
                            {pm.canUpdate && 'Update'} {pm.canDelete && 'Delete'}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus modul ini?')) {
                              deleteModuleMutation.mutate(pm.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          variant="ghost"
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Belum ada modul yang dikonfigurasi</p>
                )}
              </div>
            )}

            {/* Add new module form */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Tambah Modul Baru</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createModuleMutation.mutate({
                    positionId: selectedPositionForModule.id,
                    data: moduleFormData,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modul *</label>
                  <select
                    value={moduleFormData.moduleKey}
                    onChange={(e) => handleModuleKeyChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Modul</option>
                    {AVAILABLE_MODULES.map((module) => (
                      <option key={module.key} value={module.key}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permission</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleFormData.canView}
                        onChange={(e) =>
                          setModuleFormData({ ...moduleFormData, canView: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">View (Lihat)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleFormData.canCreate}
                        onChange={(e) =>
                          setModuleFormData({ ...moduleFormData, canCreate: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Create (Tambah)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleFormData.canUpdate}
                        onChange={(e) =>
                          setModuleFormData({ ...moduleFormData, canUpdate: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Update (Edit)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleFormData.canDelete}
                        onChange={(e) =>
                          setModuleFormData({ ...moduleFormData, canDelete: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Delete (Hapus)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) =>
                      setModuleFormData({ ...moduleFormData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Deskripsi akses modul..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsModuleModalOpen(false);
                      resetModuleForm();
                    }}
                    variant="ghost"
                  >
                    Tutup
                  </Button>
                  <Button type="submit" disabled={createModuleMutation.isPending}>
                    Tambah Modul
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

