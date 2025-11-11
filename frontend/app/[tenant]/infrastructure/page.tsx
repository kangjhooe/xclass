'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import {
  Building,
  BuildingPayload,
  Land,
  LandPayload,
  Room,
  RoomPayload,
  RoomCondition,
  RoomUsageType,
  infrastructureApi,
} from '@/lib/api/infrastructure';
import { storageApi } from '@/lib/api/storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LandForm } from '@/components/forms/LandForm';
import { BuildingForm } from '@/components/forms/BuildingForm';
import { RoomForm } from '@/components/forms/RoomForm';
import { useToastStore } from '@/lib/store/toast';

interface LandMutationInput {
  payload: LandPayload;
  documentFile?: File | null;
  landId?: number;
}

interface BuildingMutationInput {
  payload: BuildingPayload;
  buildingId?: number;
}

interface RoomMutationInput {
  payload: RoomPayload;
  roomId?: number;
}

const ownershipLabels: Record<string, string> = {
  milik_sendiri: 'Milik Sendiri',
  sewa: 'Sewa',
  hibah: 'Hibah',
  lainnya: 'Lainnya',
};

const usageLabels: Record<RoomUsageType, string> = {
  ruang_kelas: 'Ruang Kelas',
  kantor: 'Kantor',
  laboratorium: 'Laboratorium',
  perpustakaan: 'Perpustakaan',
  gudang: 'Gudang',
  aula: 'Ruang Serbaguna / Aula',
  lainnya: 'Lainnya',
};

const conditionLabels: Record<RoomCondition, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_sedang: 'Rusak Sedang',
  rusak_berat: 'Rusak Berat',
  rusak_total: 'Rusak Total',
};

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('id-ID', options).format(value);
}

function formatArea(value: number) {
  return `${formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} m²`;
}

function formatDimension(length: number, width: number) {
  return `${formatNumber(length, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} m × ${formatNumber(width, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} m`;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InfrastructurePage() {
  const params = useParams();
  const tenantId = Number(params.tenant);
  const queryClient = useQueryClient();
  const { success, error: showError } = useToastStore();

  const [isLandModalOpen, setIsLandModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data: lands = [], isLoading: isLoadingLands } = useQuery({
    queryKey: ['infrastructure', 'lands', tenantId],
    queryFn: () => infrastructureApi.lands.getAll(tenantId),
  });

  const { data: buildings = [], isLoading: isLoadingBuildings } = useQuery({
    queryKey: ['infrastructure', 'buildings', tenantId],
    queryFn: () => infrastructureApi.buildings.getAll(tenantId),
  });

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['infrastructure', 'rooms', tenantId],
    queryFn: () => infrastructureApi.rooms.getAll(tenantId),
  });

  const landMutation = useMutation({
    mutationFn: async ({ payload, documentFile, landId }: LandMutationInput) => {
      let ownershipDocumentPath: string | undefined;

      if (documentFile) {
        const uploadResult = await storageApi.upload(tenantId, documentFile, {
          folder: 'infrastruktur/lahan',
          description: `Bukti kepemilikan ${payload.name}`,
        });
        ownershipDocumentPath = uploadResult.data.path;
      }

      const baseData: Partial<LandPayload> = {
        name: payload.name,
        areaM2: payload.areaM2,
        ownershipStatus: payload.ownershipStatus,
        address: payload.address ?? null,
        notes: payload.notes ?? null,
      };

      if (ownershipDocumentPath) {
        baseData.ownershipDocumentPath = ownershipDocumentPath;
      }

      if (landId) {
        return infrastructureApi.lands.update(tenantId, landId, baseData);
      }

      const createData: LandPayload = {
        name: payload.name,
        areaM2: payload.areaM2,
        ownershipStatus: payload.ownershipStatus,
        address: payload.address ?? null,
        notes: payload.notes ?? null,
        ...(ownershipDocumentPath ? { ownershipDocumentPath } : {}),
      };

      return infrastructureApi.lands.create(tenantId, createData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'lands', tenantId] });
      setIsLandModalOpen(false);
      setEditingLand(null);
      success(`Data lahan ${variables.landId ? 'berhasil diperbarui' : 'berhasil ditambahkan'}`);
    },
    onError: () => {
      showError('Terjadi kesalahan saat menyimpan data lahan');
    },
  });

  const deleteLandMutation = useMutation({
    mutationFn: (landId: number) => infrastructureApi.lands.delete(tenantId, landId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'lands', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'buildings', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'rooms', tenantId] });
      success('Data lahan berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus data lahan. Pastikan tidak ada gedung terkait.');
    },
  });

  const buildingMutation = useMutation({
    mutationFn: ({ payload, buildingId }: BuildingMutationInput) => {
      const baseData: Partial<BuildingPayload> = {
        landId: payload.landId,
        name: payload.name,
        floorCount: payload.floorCount,
        lengthM: payload.lengthM,
        widthM: payload.widthM,
        builtYear: payload.builtYear,
        notes: payload.notes ?? null,
      };

      if (buildingId) {
        return infrastructureApi.buildings.update(tenantId, buildingId, baseData);
      }

      const createData: BuildingPayload = {
        landId: payload.landId,
        name: payload.name,
        floorCount: payload.floorCount,
        lengthM: payload.lengthM,
        widthM: payload.widthM,
        builtYear: payload.builtYear,
        notes: payload.notes ?? null,
      };

      return infrastructureApi.buildings.create(tenantId, createData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'buildings', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'rooms', tenantId] });
      setIsBuildingModalOpen(false);
      setEditingBuilding(null);
      success(`Data gedung ${variables.buildingId ? 'berhasil diperbarui' : 'berhasil ditambahkan'}`);
    },
    onError: () => {
      showError('Terjadi kesalahan saat menyimpan data gedung');
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: (buildingId: number) => infrastructureApi.buildings.delete(tenantId, buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'buildings', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'rooms', tenantId] });
      success('Data gedung berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus gedung. Pastikan tidak ada ruangan terkait.');
    },
  });

  const roomMutation = useMutation({
    mutationFn: ({ payload, roomId }: RoomMutationInput) => {
      const baseData: Partial<RoomPayload> = {
        buildingId: payload.buildingId,
        name: payload.name,
        usageType: payload.usageType,
        areaM2: payload.areaM2,
        condition: payload.condition,
        floorNumber: payload.floorNumber,
        capacity: payload.capacity,
        notes: payload.notes ?? null,
      };

      if (roomId) {
        return infrastructureApi.rooms.update(tenantId, roomId, baseData);
      }

      const createData: RoomPayload = {
        buildingId: payload.buildingId,
        name: payload.name,
        usageType: payload.usageType,
        areaM2: payload.areaM2,
        condition: payload.condition,
        floorNumber: payload.floorNumber,
        capacity: payload.capacity,
        notes: payload.notes ?? null,
      };

      return infrastructureApi.rooms.create(tenantId, createData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'rooms', tenantId] });
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      success(`Data ruangan ${variables.roomId ? 'berhasil diperbarui' : 'berhasil ditambahkan'}`);
    },
    onError: () => {
      showError('Terjadi kesalahan saat menyimpan data ruangan');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: number) => infrastructureApi.rooms.delete(tenantId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', 'rooms', tenantId] });
      success('Data ruangan berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus data ruangan');
    },
  });

  const landStats = useMemo(
    () => ({
      total: lands.length,
      totalArea: lands.reduce((acc, land) => acc + Number(land.areaM2 || 0), 0),
    }),
    [lands],
  );

  const buildingStats = useMemo(
    () => ({
      total: buildings.length,
      totalFloors: buildings.reduce((acc, building) => acc + Number(building.floorCount || 0), 0),
    }),
    [buildings],
  );

  const roomStats = useMemo(
    () => ({
      total: rooms.length,
      totalCapacity: rooms.reduce((acc, room) => acc + Number(room.capacity || 0), 0),
    }),
    [rooms],
  );

  const currentStats = [
    {
      label: 'Total Lahan',
      value: landStats.total,
      footer: landStats.totalArea > 0 ? `Akumulasi luas ${formatArea(landStats.totalArea)}` : undefined,
    },
    {
      label: 'Total Gedung',
      value: buildingStats.total,
      footer:
        buildingStats.totalFloors > 0
          ? `Total lantai ${formatNumber(buildingStats.totalFloors)}`
          : undefined,
    },
    {
      label: 'Total Ruangan',
      value: roomStats.total,
      footer:
        roomStats.totalCapacity > 0
          ? `Perkiraan kapasitas ${formatNumber(roomStats.totalCapacity)} orang`
          : undefined,
    },
  ];

  const openLandModal = (land?: Land) => {
    setEditingLand(land ?? null);
    setIsLandModalOpen(true);
  };

  const openBuildingModal = (building?: Building) => {
    setEditingBuilding(building ?? null);
    setIsBuildingModalOpen(true);
  };

  const openRoomModal = (room?: Room) => {
    setEditingRoom(room ?? null);
    setIsRoomModalOpen(true);
  };

  const handleSubmitLand = async (payload: LandPayload, documentFile?: File | null) => {
    await landMutation.mutateAsync({
      payload,
      documentFile,
      landId: editingLand?.id,
    });
  };

  const handleSubmitBuilding = async (payload: BuildingPayload) => {
    await buildingMutation.mutateAsync({
      payload,
      buildingId: editingBuilding?.id,
    });
  };

  const handleSubmitRoom = async (payload: RoomPayload) => {
    await roomMutation.mutateAsync({
      payload,
      roomId: editingRoom?.id,
    });
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="infrastructure"
        title="Infrastruktur Sekolah"
        description="Kelola hierarki lahan, gedung, dan ruangan agar data fasilitas pendidikan terdokumentasi dengan baik."
        stats={currentStats}
      >
        <div className="space-y-8 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Data Lahan</CardTitle>
                  <CardDescription>
                    Catat setiap bidang lahan dengan status kepemilikan serta dokumen pendukungnya.
                  </CardDescription>
                </div>
                <Button onClick={() => openLandModal()} size="sm">
                  Tambah Lahan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLands ? (
                <p className="text-sm text-gray-500">Memuat data lahan...</p>
              ) : lands.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data lahan. Tambahkan lahan pertama Anda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Lahan</TableHead>
                      <TableHead>Luas</TableHead>
                      <TableHead>Status Kepemilikan</TableHead>
                      <TableHead>Alamat / Catatan</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Terakhir Diperbarui</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lands.map((land) => (
                      <TableRow key={land.id}>
                        <TableCell className="font-medium text-gray-900">{land.name}</TableCell>
                        <TableCell>{formatArea(Number(land.areaM2))}</TableCell>
                        <TableCell>{ownershipLabels[land.ownershipStatus] ?? land.ownershipStatus}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900">{land.address || '-'}</p>
                            {land.notes && <p className="text-xs text-gray-500">{land.notes}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {land.ownershipDocumentPath ? (
                            <a
                              href={storageApi.getFileUrl(land.ownershipDocumentPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Lihat Dokumen
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">Tidak ada</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(land.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openLandModal(land)}>
                              Ubah
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteLandMutation.mutate(land.id)}
                              loading={deleteLandMutation.isPending}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Data Gedung</CardTitle>
                  <CardDescription>
                    Setiap gedung harus dikaitkan dengan lahan tempat gedung tersebut berdiri.
                  </CardDescription>
                </div>
                <Button onClick={() => openBuildingModal()} size="sm" disabled={lands.length === 0}>
                  Tambah Gedung
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lands.length === 0 ? (
                <p className="text-sm text-blue-600">
                  Tambahkan lahan terlebih dahulu sebelum mendata gedung.
                </p>
              ) : isLoadingBuildings ? (
                <p className="text-sm text-gray-500">Memuat data gedung...</p>
              ) : buildings.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada gedung tercatat. Gunakan tombol &quot;Tambah Gedung&quot; untuk mulai mendata.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Gedung</TableHead>
                      <TableHead>Lahan</TableHead>
                      <TableHead>Jumlah Lantai</TableHead>
                      <TableHead>Ukuran (P × L)</TableHead>
                      <TableHead>Tahun Dibangun</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildings.map((building) => {
                      const land = lands.find((l) => l.id === building.landId);
                      return (
                        <TableRow key={building.id}>
                          <TableCell className="font-medium text-gray-900">{building.name}</TableCell>
                          <TableCell>{land?.name ?? '-'}</TableCell>
                          <TableCell>{formatNumber(Number(building.floorCount))}</TableCell>
                          <TableCell>{formatDimension(Number(building.lengthM), Number(building.widthM))}</TableCell>
                          <TableCell>{building.builtYear}</TableCell>
                          <TableCell className="max-w-xs">
                            {building.notes ? (
                              <p className="text-sm text-gray-900">{building.notes}</p>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openBuildingModal(building)}>
                                Ubah
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteBuildingMutation.mutate(building.id)}
                                loading={deleteBuildingMutation.isPending}
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Data Ruangan</CardTitle>
                  <CardDescription>
                    Ruangan wajib menunjuk gedung dan mencatat lantai agar penempatan lebih jelas.
                  </CardDescription>
                </div>
                <Button onClick={() => openRoomModal()} size="sm" disabled={buildings.length === 0}>
                  Tambah Ruangan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {buildings.length === 0 ? (
                <p className="text-sm text-blue-600">
                  Tambahkan gedung terlebih dahulu sebelum mendata ruangan.
                </p>
              ) : isLoadingRooms ? (
                <p className="text-sm text-gray-500">Memuat data ruangan...</p>
              ) : rooms.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada ruangan tercatat. Gunakan tombol &quot;Tambah Ruangan&quot; untuk menambahkan.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Ruangan</TableHead>
                      <TableHead>Gedung</TableHead>
                      <TableHead>Lantai</TableHead>
                      <TableHead>Fungsi</TableHead>
                      <TableHead>Luas</TableHead>
                      <TableHead>Kondisi</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => {
                      const building = buildings.find((b) => b.id === room.buildingId);
                      return (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium text-gray-900">{room.name}</TableCell>
                          <TableCell>{building?.name ?? '-'}</TableCell>
                          <TableCell>{formatNumber(Number(room.floorNumber))}</TableCell>
                          <TableCell>{usageLabels[room.usageType]}</TableCell>
                          <TableCell>{formatArea(Number(room.areaM2))}</TableCell>
                          <TableCell>{conditionLabels[room.condition]}</TableCell>
                          <TableCell>
                            {room.capacity ? `${formatNumber(Number(room.capacity))} org` : '-'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {room.notes ? (
                              <p className="text-sm text-gray-900">{room.notes}</p>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openRoomModal(room)}>
                                Ubah
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteRoomMutation.mutate(room.id)}
                                loading={deleteRoomMutation.isPending}
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </ModulePageShell>

      <Modal
        isOpen={isLandModalOpen}
        onClose={() => {
          if (!landMutation.isPending) {
            setIsLandModalOpen(false);
            setEditingLand(null);
          }
        }}
        title={editingLand ? 'Ubah Data Lahan' : 'Tambah Data Lahan'}
        size="lg"
      >
        <LandForm
          initialData={editingLand}
          onSubmit={handleSubmitLand}
          onCancel={() => {
            if (!landMutation.isPending) {
              setIsLandModalOpen(false);
              setEditingLand(null);
            }
          }}
          isSubmitting={landMutation.isPending}
          submitLabel={editingLand ? 'Simpan Perubahan' : 'Simpan'}
        />
      </Modal>

      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => {
          if (!buildingMutation.isPending) {
            setIsBuildingModalOpen(false);
            setEditingBuilding(null);
          }
        }}
        title={editingBuilding ? 'Ubah Data Gedung' : 'Tambah Data Gedung'}
        size="lg"
      >
        <BuildingForm
          lands={lands}
          initialData={editingBuilding}
          onSubmit={handleSubmitBuilding}
          onCancel={() => {
            if (!buildingMutation.isPending) {
              setIsBuildingModalOpen(false);
              setEditingBuilding(null);
            }
          }}
          isSubmitting={buildingMutation.isPending}
          submitLabel={editingBuilding ? 'Simpan Perubahan' : 'Simpan'}
        />
      </Modal>

      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => {
          if (!roomMutation.isPending) {
            setIsRoomModalOpen(false);
            setEditingRoom(null);
          }
        }}
        title={editingRoom ? 'Ubah Data Ruangan' : 'Tambah Data Ruangan'}
        size="lg"
      >
        <RoomForm
          buildings={buildings}
          initialData={editingRoom}
          onSubmit={handleSubmitRoom}
          onCancel={() => {
            if (!roomMutation.isPending) {
              setIsRoomModalOpen(false);
              setEditingRoom(null);
            }
          }}
          isSubmitting={roomMutation.isPending}
          submitLabel={editingRoom ? 'Simpan Perubahan' : 'Simpan'}
        />
      </Modal>
    </TenantLayout>
  );
}


