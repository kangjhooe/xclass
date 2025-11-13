'use client';

import { useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { teachersApi, Teacher, TeacherCreateData } from '@/lib/api/teachers';
import { subjectsApi, Subject } from '@/lib/api/subjects';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantIdState } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import { useDebounce } from '@/lib/hooks/useDebounce';

// Subject Assignment Form Component
function SubjectAssignmentForm({
  teacher,
  subjects,
  onSubmit,
  onCancel,
  isLoading,
}: {
  teacher: Teacher;
  subjects: Subject[];
  onSubmit: (subjectIds: number[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>(
    teacher.subjects?.map((s) => s.id) || []
  );

  const handleToggle = (subjectId: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedSubjectIds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada mata pelajaran tersedia</p>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <label
                key={subject.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSubjectIds.includes(subject.id)}
                  onChange={() => handleToggle(subject.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{subject.name}</span>
                  {subject.code && (
                    <span className="ml-2 text-sm text-gray-500">({subject.code})</span>
                  )}
                </div>
                {!subject.isActive && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    Tidak Aktif
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-gray-600">
          {selectedSubjectIds.length} mata pelajaran dipilih
        </p>
        <div className="flex space-x-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" loading={isLoading}>
            Simpan
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function TeachersPage() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const { tenantId, loading: tenantLoading, error: tenantError } = useTenantIdState(); // Numeric ID for API calls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError, warning } = useToastStore();
  const [formData, setFormData] = useState<TeacherCreateData>({
    name: '',
    email: '',
    phone: '',
    employeeNumber: '',
    nip: '',
    nik: '',
    nuptk: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    education: '',
    specialization: '',
    isActive: true,
  });

  const queryClient = useQueryClient();

  // Fetch teachers with filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['teachers', tenantId, currentPage, pageSize, debouncedSearchTerm, filterStatus, filterGender],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak ditemukan');
      }
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterStatus !== 'all') params.isActive = filterStatus === 'active';
      if (filterGender !== 'all') params.gender = filterGender;
      
      const response = await teachersApi.getAll(tenantId, params);
      
      // Handle both array response and object response format
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: pageSize,
          totalPages: Math.ceil(response.length / pageSize),
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
        page: 1,
        limit: pageSize,
        totalPages: 0,
      };
    },
    enabled: !!tenantId && !tenantLoading,
  });

  // Fetch subjects for assignment
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: async () => {
      if (!tenantId) return { data: [], total: 0 };
      return subjectsApi.getAll(tenantId);
    },
    enabled: !!tenantId && !tenantLoading,
  });

  const createMutation = useMutation({
    mutationFn: (data: TeacherCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['teachers-stats', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Guru berhasil ditambahkan');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal menambahkan guru');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TeacherCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['teachers-stats', tenantId] });
      setIsModalOpen(false);
      setSelectedTeacher(null);
      resetForm();
      success('Data guru berhasil diperbarui');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal memperbarui data guru');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['teachers-stats', tenantId] });
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
      success('Guru berhasil dihapus');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal menghapus guru');
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    },
  });

  const exportPDFMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      await teachersApi.exportPDF(tenantId);
    },
    onSuccess: () => {
      success('Export PDF berhasil');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal mengekspor PDF');
    },
  });

  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      await teachersApi.exportExcel(tenantId);
    },
    onSuccess: () => {
      success('Export Excel berhasil');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal mengekspor Excel');
    },
  });

  const importExcelMutation = useMutation({
    mutationFn: async ({ file, sheetIndex, startRow }: { file: File; sheetIndex?: number; startRow?: number }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.importExcel(tenantId, file, sheetIndex, startRow);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['teachers-stats', tenantId] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (result.failed > 0) {
        warning(`Import selesai: ${result.imported} berhasil, ${result.failed} gagal dari ${result.total} total`);
      } else {
        success(`Import berhasil! ${result.imported} data berhasil diimpor`);
      }
    },
    onError: (error: any) => {
      showError(error.message || 'Terjadi kesalahan saat mengimpor data');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeNumber: '',
      nip: '',
      nik: '',
      nuptk: '',
      gender: '',
      birthDate: '',
      birthPlace: '',
      address: '',
      education: '',
      specialization: '',
      isActive: true,
    });
    setSelectedTeacher(null);
    setFormErrors({});
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      employeeNumber: teacher.employeeNumber || '',
      nip: teacher.nip || '',
      nik: teacher.nik || '',
      nuptk: teacher.nuptk || '',
      gender: teacher.gender || '',
      birthDate: teacher.birthDate || '',
      birthPlace: teacher.birthPlace || '',
      address: teacher.address || '',
      education: teacher.education || '',
      specialization: teacher.specialization || '',
      isActive: teacher.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nama wajib diisi';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Format nomor telepon tidak valid';
    }
    
    if (formData.nik && !/^[0-9]{16}$/.test(formData.nik.replace(/\s/g, ''))) {
      errors.nik = 'NIK harus 16 digit angka';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (!validateForm()) {
      showError('Mohon perbaiki kesalahan pada form');
      return;
    }

    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!teacherToDelete || !tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    deleteMutation.mutate(teacherToDelete.id);
  };

  const handleExportPDF = () => {
    if (!tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    exportPDFMutation.mutate();
  };

  const handleExportExcel = () => {
    if (!tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    exportExcelMutation.mutate();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(file.type)) {
      showError('File harus berformat Excel (.xlsx atau .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Ukuran file maksimal 10MB');
      return;
    }

    importExcelMutation.mutate({ file });
  };

  const handleMutasi = () => {
    setIsMutasiModalOpen(true);
  };

  const handleViewDetail = async (teacher: Teacher) => {
    if (!tenantId) return;
    try {
      const fullTeacher = await teachersApi.getById(tenantId, teacher.id);
      setSelectedTeacher(fullTeacher);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      setSelectedTeacher(teacher);
      setIsDetailModalOpen(true);
    }
  };

  const handleAssignSubjects = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsSubjectModalOpen(true);
  };

  const updateSubjectsMutation = useMutation({
    mutationFn: ({ id, subjectIds }: { id: number; subjectIds: number[] }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return teachersApi.updateSubjects(tenantId, id, subjectIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', tenantId] });
      setIsSubjectModalOpen(false);
      setSelectedTeacher(null);
      success('Mata pelajaran berhasil di-assign');
    },
    onError: (error: any) => {
      showError(error.message || 'Gagal meng-assign mata pelajaran');
    },
  });

  const handleSubjectSubmit = (subjectIds: number[]) => {
    if (!selectedTeacher) return;
    updateSubjectsMutation.mutate({ id: selectedTeacher.id, subjectIds });
  };

  // Calculate stats from all data (not just current page)
  const statsQuery = useQuery({
    queryKey: ['teachers-stats', tenantId],
    queryFn: async () => {
      if (!tenantId) return { total: 0, active: 0 };
      const response = await teachersApi.getAll(tenantId, { limit: 1000 });
      const allTeachers = Array.isArray(response) ? response : response?.data || [];
      return {
        total: allTeachers.length,
        active: allTeachers.filter((t) => t.isActive).length,
      };
    },
    enabled: !!tenantId && !tenantLoading,
  });

  const totalTeachers = statsQuery.data?.total || 0;
  const activeTeachers = statsQuery.data?.active || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="teachers"
        title="Data Guru"
        description="Kelola data guru dan tenaga pendidik"
        actions={({ themeConfig }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className={themeConfig.primaryButton}
            >
              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="ml-2">Tambah Guru</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleMutasi}
            >
              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="ml-2">Mutasi</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleImportClick}
              disabled={importExcelMutation.isPending}
              loading={importExcelMutation.isPending}
            >
              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v4H4zM4 12h16v8H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12v8M16 12v8" />
              </svg>
              <span className="ml-2">Import (Excel)</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending}
              loading={exportPDFMutation.isPending}
            >
              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V3l8 4v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15h16v6H4z" />
              </svg>
              <span className="ml-2">Export (PDF)</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={exportExcelMutation.isPending}
              loading={exportExcelMutation.isPending}
            >
              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8l8 8M16 8l-8 8" />
              </svg>
              <span className="ml-2">Export (Excel)</span>
            </Button>
          </div>
        )}
        stats={[
          {
            label: 'Total Guru',
            value: totalTeachers,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-3-3h-4M9 20H4v-2a3 3 0 013-3h4m1-3a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            ),
          },
          {
            label: 'Guru Aktif',
            value: activeTeachers,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Tidak Aktif',
            value: totalTeachers - activeTeachers,
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
            {tenantLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat informasi tenant...</p>
              </div>
            ) : tenantError ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 p-12 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold mb-2">Error Memuat Tenant</p>
                <p className="text-gray-600 text-sm">{tenantError.message || 'Gagal memuat informasi tenant'}</p>
              </div>
            ) : isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data guru...</p>
              </div>
            ) : error ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 p-12 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold mb-2">Error Memuat Data</p>
                <p className="text-gray-600 text-sm">{error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data guru'}</p>
                {!tenantId && (
                  <p className="mt-2 text-sm text-yellow-600">Tenant ID: {tenantId || 'Belum tersedia'}</p>
                )}
              </div>
            ) : (
              <>
                {/* Search and Filters */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        placeholder="Cari nama, NIP, email, atau NUPTK..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={filterGender}
                        onChange={(e) => {
                          setFilterGender(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Semua Jenis Kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-b-2 border-white/20">
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Nama</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Email</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Telepon</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">NUPTK</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Mata Pelajaran</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Jenis Kelamin</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.data?.map((teacher, index) => (
                          <TableRow 
                            key={teacher.id} 
                            className={`transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                            } hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                          >
                            <TableCell className="font-medium text-gray-800">{teacher.name}</TableCell>
                            <TableCell>{teacher.email || '-'}</TableCell>
                            <TableCell>{teacher.phone || '-'}</TableCell>
                            <TableCell>{teacher.nuptk || '-'}</TableCell>
                            <TableCell>
                              {teacher.subjects && teacher.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {teacher.subjects.slice(0, 2).map((subject) => (
                                    <span key={subject.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      {subject.name}
                                    </span>
                                  ))}
                                  {teacher.subjects.length > 2 && (
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                      +{teacher.subjects.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{teacher.gender === 'L' ? 'Laki-laki' : teacher.gender === 'P' ? 'Perempuan' : '-'}</TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                teacher.isActive 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {teacher.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetail(teacher)}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                  title="Lihat Detail"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(teacher)}
                                  className="hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignSubjects(teacher)}
                                  className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                                  title="Assign Mata Pelajaran"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(teacher)}
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
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Belum ada data guru</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {data && data.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={data.totalPages || 1}
                      totalItems={data.total || 0}
                      itemsPerPage={pageSize}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  title={selectedTeacher ? 'Edit Guru' : 'Tambah Guru'}
                  size="lg"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (formErrors.name) {
                                setFormErrors({ ...formErrors, name: '' });
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              formErrors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            required
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                        <input
                          type="text"
                          value={formData.nip}
                          onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                        <input
                          type="text"
                          value={formData.nik}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setFormData({ ...formData, nik: value });
                            if (formErrors.nik) {
                              setFormErrors({ ...formErrors, nik: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.nik
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="16 digit angka"
                        />
                        {formErrors.nik && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.nik}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                        <input
                          type="text"
                          value={formData.nuptk}
                          onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Pegawai</label>
                        <input
                          type="text"
                          value={formData.employeeNumber}
                          onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (formErrors.email) {
                              setFormErrors({ ...formErrors, email: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.email
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (formErrors.phone) {
                              setFormErrors({ ...formErrors, phone: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.phone
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                        {selectedTeacher ? 'Update' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </Modal>

                {/* Hidden file input for import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Detail Modal */}
                <Modal
                  isOpen={isDetailModalOpen}
                  onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedTeacher(null);
                  }}
                  title="Detail Guru"
                  size="lg"
                >
                  {selectedTeacher && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                          <p className="text-gray-900 font-semibold">{selectedTeacher.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                          <p className="text-gray-900">{selectedTeacher.nip || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                          <p className="text-gray-900">{selectedTeacher.nik || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                          <p className="text-gray-900">{selectedTeacher.nuptk || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-gray-900">{selectedTeacher.email || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                          <p className="text-gray-900">{selectedTeacher.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                          <p className="text-gray-900">{selectedTeacher.gender === 'L' ? 'Laki-laki' : selectedTeacher.gender === 'P' ? 'Perempuan' : '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                          <p className="text-gray-900">{selectedTeacher.birthDate ? formatDate(selectedTeacher.birthDate) : '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                          <p className="text-gray-900">{selectedTeacher.birthPlace || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                          <p className="text-gray-900">{selectedTeacher.education || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
                          <p className="text-gray-900">{selectedTeacher.specialization || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            selectedTeacher.isActive 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            {selectedTeacher.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                          <p className="text-gray-900">{selectedTeacher.address || '-'}</p>
                        </div>
                        {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedTeacher.subjects.map((subject) => (
                                <span key={subject.id} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                  {subject.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            setSelectedTeacher(null);
                          }}
                        >
                          Tutup
                        </Button>
                        <Button
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            handleEdit(selectedTeacher);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </Modal>

                {/* Subject Assignment Modal */}
                <Modal
                  isOpen={isSubjectModalOpen}
                  onClose={() => {
                    setIsSubjectModalOpen(false);
                    setSelectedTeacher(null);
                  }}
                  title={`Assign Mata Pelajaran - ${selectedTeacher?.name || ''}`}
                  size="md"
                >
                  {selectedTeacher && subjectsData && (
                    <SubjectAssignmentForm
                      teacher={selectedTeacher}
                      subjects={subjectsData.data || []}
                      onSubmit={handleSubjectSubmit}
                      onCancel={() => {
                        setIsSubjectModalOpen(false);
                        setSelectedTeacher(null);
                      }}
                      isLoading={updateSubjectsMutation.isPending}
                    />
                  )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                  isOpen={isDeleteModalOpen}
                  onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTeacherToDelete(null);
                  }}
                  title="Konfirmasi Hapus"
                  size="md"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Apakah Anda yakin ingin menghapus guru <strong>{teacherToDelete?.name}</strong>?
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                        Semua data terkait guru ini akan dihapus secara permanen.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsDeleteModalOpen(false);
                          setTeacherToDelete(null);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="danger"
                        onClick={confirmDelete}
                        loading={deleteMutation.isPending}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </Modal>

                {/* Mutasi Modal */}
                <Modal
                  isOpen={isMutasiModalOpen}
                  onClose={() => setIsMutasiModalOpen(false)}
                  title="Mutasi Guru"
                  size="md"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Fitur mutasi guru memungkinkan Anda untuk memindahkan guru ke sekolah/instansi lain.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Catatan:</strong> Fitur ini sedang dalam pengembangan. 
                        Untuk saat ini, silakan hubungi administrator untuk proses mutasi guru.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setIsMutasiModalOpen(false)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                </Modal>
              </>
            )}
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

