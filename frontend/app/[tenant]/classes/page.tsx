'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { classesApi, ClassRoom, ClassRoomCreateData } from '@/lib/api/classes';
import { teachersApi } from '@/lib/api/teachers';
import { infrastructureApi } from '@/lib/api/infrastructure';
import { dataPokokApi } from '@/lib/api/data-pokok';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useActiveAcademicYear } from '@/lib/hooks/useAcademicYear';

export default function ClassesPage() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const tenantId = useTenantId(); // Numeric ID for API calls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [formData, setFormData] = useState<ClassRoomCreateData>({
    name: '',
    level: '',
    roomNumber: '',
    roomId: undefined,
    capacity: undefined,
    homeroomTeacherId: undefined,
    isActive: true,
    academicYear: '',
  });

  const queryClient = useQueryClient();
  const isTenantReady = !!tenantId;
  const {
    data: activeAcademicYear,
    isLoading: academicYearLoading,
  } = useActiveAcademicYear(tenantId, { enabled: isTenantReady });
  const activeAcademicYearName = activeAcademicYear?.name || '';

  useEffect(() => {
    if (!activeAcademicYearName) {
      return;
    }

    setFormData((prev) => {
      if (prev.academicYear && prev.academicYear.length > 0) {
        return prev;
      }

      return {
        ...prev,
        academicYear: activeAcademicYearName,
      };
    });
  }, [activeAcademicYearName]);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', tenantId, activeAcademicYearName || 'all'],
    queryFn: () =>
      classesApi.getAll(tenantId!, {
        academicYear: activeAcademicYearName || undefined,
      }),
    enabled: !!tenantId && !academicYearLoading,
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak ditemukan');
      }
      const response = await teachersApi.getAll(tenantId);
      
      // Handle both array response and object response format
      // Backend might return array directly or { data, total }
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
        };
      }
      
      // If response already has data property, use it
      if (response && typeof response === 'object' && 'data' in response) {
        return response;
      }
      
      // Fallback: wrap in object
      return {
        data: [],
        total: 0,
      };
    },
    enabled: !!tenantId,
  });

  const { data: roomsData = [] } = useQuery({
    queryKey: ['infrastructure', 'rooms', tenantId],
    queryFn: () => infrastructureApi.rooms.getAll(tenantId!, { usageType: 'ruang_kelas' }),
    enabled: !!tenantId,
  });

  const { data: dataPokok } = useQuery({
    queryKey: ['data-pokok', tenantId],
    queryFn: () => dataPokokApi.get(tenantId!),
    enabled: !!tenantId,
  });

  // Helper function to get level options based on jenjang
  const getLevelOptions = () => {
    const jenjang = dataPokok?.jenjang?.toUpperCase() || '';
    
    if (jenjang.includes('SD') || jenjang.includes('MI')) {
      return ['I', 'II', 'III', 'IV', 'V', 'VI'];
    } else if (jenjang.includes('SMP') || jenjang.includes('MTS')) {
      return ['VII', 'VIII', 'IX'];
    } else if (jenjang.includes('SMA') || jenjang.includes('SMK') || jenjang.includes('MA') || jenjang.includes('MAK')) {
      return ['X', 'XI', 'XII'];
    }
    
    // Default: return all options if jenjang not found
    return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  };

  const levelOptions = getLevelOptions();

  const createMutation = useMutation({
    mutationFn: (data: ClassRoomCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      const payload: ClassRoomCreateData = {
        ...data,
        academicYear: data.academicYear || activeAcademicYearName || undefined,
      };
      return classesApi.create(tenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', tenantId, activeAcademicYearName || 'all'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClassRoomCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      const payload: Partial<ClassRoomCreateData> = {
        ...data,
      };
      if (data.academicYear !== undefined) {
        payload.academicYear = data.academicYear;
      }
      return classesApi.update(tenantId, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', tenantId, activeAcademicYearName || 'all'] });
      setIsModalOpen(false);
      setSelectedClass(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return classesApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', tenantId, activeAcademicYearName || 'all'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      level: '',
      roomNumber: '',
      roomId: undefined,
      capacity: undefined,
      homeroomTeacherId: undefined,
      isActive: true,
      academicYear: activeAcademicYearName || '',
    });
    setSelectedClass(null);
  };

  const handleEdit = (classRoom: ClassRoom) => {
    setSelectedClass(classRoom);
    setFormData({
      name: classRoom.name,
      level: classRoom.level || '',
      roomNumber: classRoom.roomNumber || '',
      roomId: classRoom.roomId,
      capacity: classRoom.capacity,
      homeroomTeacherId: classRoom.homeroomTeacherId,
      isActive: classRoom.isActive ?? true,
      academicYear: classRoom.academicYear || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalClasses = data?.data?.length || 0;
  const activeClasses = data?.data?.filter((c) => c.isActive).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="classes"
        title="Data Kelas"
        description="Atur struktur kelas, wali kelas, dan kapasitas ruang belajar"
        actions={({ themeConfig }) => (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className={themeConfig.primaryButton}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kelas
          </Button>
        )}
        stats={[
          {
            label: 'Total Kelas',
            value: totalClasses,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            ),
          },
          {
            label: 'Kelas Aktif',
            value: activeClasses,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            footer: (
              <span className="text-green-600 font-medium">
                {((activeClasses / (totalClasses || 1)) * 100).toFixed(1)}% aktif
              </span>
            ),
          },
          {
            label: 'Tidak Aktif',
            value: totalClasses - activeClasses,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 border-b-2 border-white/20">
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Nama Kelas</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Level</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Ruangan</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Kapasitas</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Wali Kelas</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((classRoom, index) => (
                        <TableRow 
                          key={classRoom.id} 
                          className={`transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                          } hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                        >
                          <TableCell className="font-medium text-gray-800">{classRoom.name}</TableCell>
                          <TableCell>{classRoom.level || '-'}</TableCell>
                          <TableCell>
                            {classRoom.room?.name 
                              ? `${classRoom.room.name}${classRoom.room.building ? ` (${classRoom.room.building.name})` : ''}`
                              : classRoom.roomNumber || '-'}
                          </TableCell>
                          <TableCell>{classRoom.capacity || '-'}</TableCell>
                          <TableCell>{classRoom.homeroomTeacher?.name || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              classRoom.isActive 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {classRoom.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(classRoom)}
                                className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(classRoom.id)}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {data?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data kelas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              title={selectedClass ? 'Edit Kelas' : 'Tambah Kelas'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Level</option>
                        {levelOptions.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                      <select
                        value={formData.roomId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            roomId: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Ruangan</option>
                        {roomsData.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}{room.building ? ` - ${room.building.name}` : ''}
                          </option>
                        ))}
                      </select>
                      {roomsData.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Belum ada ruangan. Tambahkan ruangan di halaman Infrastruktur terlebih dahulu.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                      <input
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capacity: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
                      <select
                        value={formData.homeroomTeacherId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            homeroomTeacherId: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={teachersLoading}
                      >
                        <option value="">Pilih Wali Kelas</option>
                        {teachersLoading ? (
                          <option value="">Memuat data guru...</option>
                        ) : (
                          teachersData?.data?.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))
                        )}
                      </select>
                      {!teachersLoading && (!teachersData?.data || teachersData.data.length === 0) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Belum ada data guru. Tambahkan guru di halaman Guru terlebih dahulu.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createMutation.isPending || updateMutation.isPending}
                    className={themeConfig.primaryButton}
                  >
                    {selectedClass ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

