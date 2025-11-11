'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable, SkeletonStats } from '@/components/ui/Skeleton';
import { studentsApi, Student, StudentCreateData } from '@/lib/api/students';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId, useTenantIdState } from '@/lib/hooks/useTenant';

const DetailField = ({ label, value }: { label: string; value?: ReactNode }) => {
  const displayValue =
    value === undefined || value === null || value === '' ? '-' : value;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 break-words">{displayValue}</p>
    </div>
  );
};

const formatGender = (gender?: string | null) => {
  if (!gender) return '-';
  const normalized = gender.toString().toLowerCase();
  if (['l', 'laki-laki', 'male', 'pria', 'lelaki'].includes(normalized)) {
    return 'Laki-laki (L)';
  }
  if (['p', 'perempuan', 'female', 'wanita'].includes(normalized)) {
    return 'Perempuan (P)';
  }
  return gender;
};

const formatNumberWithUnit = (value?: number | string | null, unit?: string) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return unit ? `${numeric} ${unit}` : numeric.toString();
};

const formatCurrencyIdr = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numeric);
};

const pickStudentValue = (student: Student | null | undefined, keys: string[]) => {
  if (!student) return undefined;
  for (const key of keys) {
    const value = (student as Record<string, any>)[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const normalizeDateInput = (value: unknown) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return '';
};

const buildPersonData = (student: Student | null, prefix: string) => ({
  status: pickStudentValue(student, [`${prefix}_status`, `${prefix}Status`]),
  nik: pickStudentValue(student, [`${prefix}_nik`, `${prefix}Nik`]),
  name: pickStudentValue(student, [`${prefix}_name`, `${prefix}Name`]),
  birthPlace: pickStudentValue(student, [`${prefix}_birth_place`, `${prefix}BirthPlace`]),
  birthDate: pickStudentValue(student, [`${prefix}_birth_date`, `${prefix}BirthDate`]),
  education: pickStudentValue(student, [`${prefix}_education`, `${prefix}Education`]),
  occupation: pickStudentValue(student, [`${prefix}_occupation`, `${prefix}Occupation`]),
  phone: pickStudentValue(student, [`${prefix}_phone`, `${prefix}Phone`]),
  relationship: pickStudentValue(student, [`${prefix}_relationship`, `${prefix}Relationship`]),
  income: pickStudentValue(student, [`${prefix}_income`, `${prefix}Income`]),
});

type GuardianDisplayMode = 'guardian' | 'father' | 'mother';

export default function StudentsPage() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const { tenantId, loading: tenantLoading, error: tenantError } = useTenantIdState(); // Numeric ID for API calls
  
  // Debug logging
  console.log('StudentsPage render:', {
    tenantNpsn,
    tenantId,
    tenantLoading,
    tenantError,
    hasTenantId: !!tenantId,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [guardianMode, setGuardianMode] = useState<GuardianDisplayMode>('guardian');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<StudentCreateData>({
    name: '',
    nisn: '',
    nis: '',
    email: '',
    phone: '',
    gender: '',
    birth_place: '',
    birth_date: '',
    address: '',
    class_id: undefined,
    status: 'active',
  });

  const queryClient = useQueryClient();

  // Transform backend data to frontend format
  const transformStudent = (student: any): Student | null => {
    if (!student || !student.id) {
      console.warn('Invalid student data:', student);
      return null;
    }
    
    // Handle date conversion
    let birthDateStr = '';
    if (student.birthDate) {
      if (typeof student.birthDate === 'string') {
        birthDateStr = student.birthDate.split('T')[0];
      } else if (student.birthDate instanceof Date) {
        birthDateStr = student.birthDate.toISOString().split('T')[0];
      }
    }
    
    return {
      id: student.id,
      nis: student.studentNumber || student.nis || '',
      nisn: student.nisn || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      gender: student.gender || '',
      birth_place: student.birthPlace || '',
      birth_date: birthDateStr,
      address: student.address || '',
      class_id: student.classId || undefined,
      class_name: student.classRoom?.name || student.className || '',
      status: student.isActive !== undefined ? (student.isActive ? 'active' : 'inactive') : (student.status || 'active'),
      created_at: student.createdAt,
      updated_at: student.updatedAt,
      ...student, // Keep all other fields for detail modal
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak ditemukan. Silakan login terlebih dahulu.');
      }
      
      try {
        console.log('Fetching students for tenantId:', tenantId);
        const response = await studentsApi.getAll(tenantId);
        console.log('Students API response:', response);
        
        // Handle both direct array and wrapped response
        const isArrayResponse = Array.isArray(response);
        const responseMeta = !isArrayResponse ? (response as any) : undefined;
        const studentsArray = isArrayResponse ? response : (responseMeta?.data || []);
        
        console.log('Students array:', studentsArray);
        console.log('Number of students:', studentsArray.length);
        
        // Transform students
        const transformed = studentsArray.map(transformStudent).filter(Boolean);
        
        console.log('Transformed students:', transformed);
        console.log('Number of transformed students:', transformed.length);
        
        return {
          data: transformed,
          total: responseMeta?.total ?? transformed.length,
          page: responseMeta?.page ?? 1,
          limit: responseMeta?.limit ?? 20,
          totalPages: responseMeta?.totalPages ?? 1,
        };
      } catch (err: any) {
        console.error('Error fetching students:', err);
        console.error('Error details:', {
          message: err?.message,
          response: err?.response?.data,
          status: err?.response?.status,
          isNetworkError: err?.isNetworkError,
        });
        
        // Handle network errors
        if (err?.isNetworkError || err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error')) {
          throw new Error('Backend tidak dapat dijangkau. Pastikan backend NestJS berjalan di http://localhost:3000');
        }
        
        // Handle other errors
        const errorMessage = err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat memuat data siswa';
        throw new Error(errorMessage);
      }
    },
    enabled: !!tenantId && !tenantLoading,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: StudentCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }

      // Transform frontend data to backend format
      const backendData: any = {
        studentNumber: data.nis,
        nisn: data.nisn,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        birthPlace: data.birth_place,
        birthDate: data.birth_date,
        address: data.address,
        classId: data.class_id,
        isActive: data.status === 'active',
      };
      return studentsApi.create(tenantId, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }

      // Transform frontend data to backend format
      const backendData: any = {};
      if (data.nis !== undefined) backendData.studentNumber = data.nis;
      if (data.nisn !== undefined) backendData.nisn = data.nisn;
      if (data.name !== undefined) backendData.name = data.name;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.phone !== undefined) backendData.phone = data.phone;
      if (data.gender !== undefined) backendData.gender = data.gender;
      if (data.birth_place !== undefined) backendData.birthPlace = data.birth_place;
      if (data.birth_date !== undefined) backendData.birthDate = data.birth_date;
      if (data.address !== undefined) backendData.address = data.address;
      if (data.class_id !== undefined) backendData.classId = data.class_id;
      if (data.status !== undefined) backendData.isActive = data.status === 'active';
      return studentsApi.update(tenantId, id, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      setIsModalOpen(false);
      setSelectedStudent(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      email: '',
      phone: '',
      gender: '',
      birth_place: '',
      birth_date: '',
      address: '',
      class_id: undefined,
      status: 'active',
    });
    setSelectedStudent(null);
  };

  const handleEdit = (student: Student) => {
    const statusValue = pickStudentValue(student, ['status', 'student_status', 'studentStatus']);
    const isActiveValue = pickStudentValue(student, ['is_active', 'isActive']);
    const resolvedStatus =
      typeof statusValue === 'string'
        ? statusValue
        : typeof isActiveValue === 'boolean'
          ? isActiveValue
            ? 'active'
            : 'inactive'
          : 'active';

    const birthDateValue = pickStudentValue(student, ['birth_date', 'birthDate']);
    const classIdValue = pickStudentValue(student, ['class_id', 'classId']);
    const normalizedClassId =
      classIdValue === undefined || classIdValue === null || classIdValue === ''
        ? undefined
        : Number(classIdValue);

    setSelectedStudent(student);
    setFormData({
      name: (pickStudentValue(student, ['name']) as string) || '',
      nisn: (pickStudentValue(student, ['nisn']) as string) || '',
      nis: (pickStudentValue(student, ['nis', 'student_number', 'studentNumber']) as string) || '',
      email: (pickStudentValue(student, ['email']) as string) || '',
      phone: (pickStudentValue(student, ['phone']) as string) || '',
      gender: (pickStudentValue(student, ['gender']) as string) || '',
      birth_place: (pickStudentValue(student, ['birth_place', 'birthPlace']) as string) || '',
      birth_date: normalizeDateInput(birthDateValue),
      address: (pickStudentValue(student, ['address']) as string) || '',
      class_id:
        typeof normalizedClassId === 'number' && !Number.isNaN(normalizedClassId)
          ? normalizedClassId
          : undefined,
      status: resolvedStatus,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePrintIdentity = (studentId: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const printUrl = `${baseUrl}/tenants/${tenantId}/students/${studentId}/identity-card`;
    if (typeof window !== 'undefined') {
      window.open(printUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openDetailModal = (student: Student) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    setIsDetailModalOpen(true);
    setDetailError(null);
    setIsDetailLoading(true);
    setGuardianMode('guardian');
    setDetailStudent(student);

    studentsApi
      .getById(tenantId, student.id)
      .then((response) => {
        setDetailStudent(response);
      })
      .catch(() => {
        setDetailError('Gagal memuat detail siswa. Silakan coba lagi.');
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailStudent(null);
    setDetailError(null);
  };

  // Filter students based on search and status
  const filteredStudents = data?.data?.filter((student: Student) => {
    const matchesSearch = !searchQuery || 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const totalStudents = data?.data?.length || 0;
  const activeStudents = data?.data?.filter((s: Student) => s.status === 'active')?.length || 0;
  const fatherData = buildPersonData(detailStudent, 'father');
  const motherData = buildPersonData(detailStudent, 'mother');
  const guardianData = buildPersonData(detailStudent, 'guardian');
  const displayedGuardianData =
    guardianMode === 'father' ? fatherData : guardianMode === 'mother' ? motherData : guardianData;

  const parseNumeric = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) ? undefined : numeric;
  };

  const fatherIncomeNumber = parseNumeric(fatherData.income);
  const motherIncomeNumber = parseNumeric(motherData.income);
  const averageIncomeNumber =
    fatherIncomeNumber !== undefined && motherIncomeNumber !== undefined
      ? (fatherIncomeNumber + motherIncomeNumber) / 2
      : fatherIncomeNumber ?? motherIncomeNumber;

  const assistanceCardNumber = pickStudentValue(detailStudent, [
    'kip_number',
    'pkh_number',
    'kis_number',
    'assistance_card_number',
    'assistanceCardNumber',
  ]);
  const familyCardNumber = pickStudentValue(detailStudent, ['no_kk', 'family_card_number', 'familyCardNumber']);
  const nik = pickStudentValue(detailStudent, ['nik']);
  const hobby = pickStudentValue(detailStudent, ['hobi', 'hobby']);
  const aspiration = pickStudentValue(detailStudent, ['cita_cita', 'aspirasi', 'aspiration', 'dream']);
  const childOrder = pickStudentValue(detailStudent, [
    'child_order',
    'childOrder',
    'status_anak',
    'child_position',
    'birth_order',
  ]);
  const siblingCount = pickStudentValue(detailStudent, [
    'jumlah_saudara_kandung',
    'sibling_count',
    'siblings_count',
    'number_of_siblings',
  ]);
  const stepSiblingCount = pickStudentValue(detailStudent, [
    'jumlah_saudara_tiri',
    'step_sibling_count',
    'stepSiblingsCount',
  ]);
  const familyStatus = pickStudentValue(detailStudent, [
    'status_dalam_keluarga',
    'family_status',
    'familyStatus',
  ]);
  const enrollmentDate = pickStudentValue(detailStudent, ['enrollment_date', 'enrollmentDate']);
  const bloodType = pickStudentValue(detailStudent, ['blood_type', 'bloodType']);
  const heightValue = pickStudentValue(detailStudent, ['height']);
  const weightValue = pickStudentValue(detailStudent, ['weight']);
  const birthPlaceValue = pickStudentValue(detailStudent, ['birth_place', 'birthPlace']);
  const birthDateValue = pickStudentValue(detailStudent, ['birth_date', 'birthDate']);
  const genderValue = pickStudentValue(detailStudent, ['gender']);
  const studentStatusValue = pickStudentValue(detailStudent, ['status', 'student_status', 'studentStatus']);
  const addressValue = pickStudentValue(detailStudent, ['address', 'alamat', 'street']);
  const villageValue = pickStudentValue(detailStudent, ['village', 'desa', 'kelurahan']);
  const subDistrictValue = pickStudentValue(detailStudent, ['sub_district', 'subDistrict', 'kecamatan']);
  const districtValue = pickStudentValue(detailStudent, ['district', 'kabupaten']);
  const cityValue = pickStudentValue(detailStudent, ['city', 'kota']);
  const provinceValue = pickStudentValue(detailStudent, ['province']);
  const previousSchoolName = pickStudentValue(detailStudent, ['previous_school', 'previousSchool']);
  const previousSchoolAddress = pickStudentValue(detailStudent, [
    'previous_school_address',
    'previousSchoolAddress',
  ]);
  const previousSchoolNpsn = pickStudentValue(detailStudent, [
    'previous_school_npsn',
    'previousSchoolNpsn',
  ]);
  const guardianModeOptions: { value: GuardianDisplayMode; label: string }[] = [
    { value: 'guardian', label: 'Data Wali' },
    { value: 'father', label: 'Wali sama dengan Ayah' },
    { value: 'mother', label: 'Wali sama dengan Ibu' },
  ];

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="students"
        title="Data Siswa"
        description="Kelola data siswa di instansi Anda"
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
            Tambah Siswa
          </Button>
        )}
        stats={[
          {
            label: 'Total Siswa',
            value: totalStudents,
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
            label: 'Siswa Aktif',
            value: activeStudents,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Tidak Aktif',
            value: totalStudents - activeStudents,
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
              <div className="space-y-4">
                <SkeletonStats count={3} />
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-4">
                  <SkeletonTable rows={8} columns={9} />
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Data</h3>
                  <p className="text-red-600 mb-2">
                    {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data siswa. Silakan coba lagi.'}
                  </p>
                  {error instanceof Error && error.message.includes('Backend tidak dapat dijangkau') && (
                    <div className="text-sm text-red-500 mb-4 space-y-2">
                      <p>Kemungkinan penyebab:</p>
                      <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                        <li>Backend NestJS tidak berjalan</li>
                        <li>Backend berjalan di port yang berbeda</li>
                        <li>Firewall memblokir koneksi</li>
                      </ul>
                      <p className="mt-2 font-semibold">Solusi: Jalankan backend dengan perintah <code className="bg-red-100 px-2 py-1 rounded">npm run start:dev</code></p>
                    </div>
                  )}
                  {(!tenantId || (error instanceof Error && error.message.includes('login'))) && !(error instanceof Error && error.message.includes('Backend tidak dapat dijangkau')) && (
                    <p className="text-sm text-red-500 mb-4">
                      Pastikan Anda sudah login dan memiliki akses ke tenant ini.
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['students', tenantId] })}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Coba Lagi
                    </Button>
                    {(!tenantId || (error instanceof Error && error.message.includes('login'))) && (
                      <Button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.href = `/${tenantNpsn || '10816663'}/login`;
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Login
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : tenantLoading ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Memuat Data Tenant</h3>
                  <p className="text-yellow-600">Sedang memuat informasi tenant...</p>
                </div>
              </div>
            ) : tenantError || !tenantId ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Tenant</h3>
                  <p className="text-red-600 mb-4">
                    {tenantError instanceof Error ? tenantError.message : 'Tenant ID tidak ditemukan. Silakan login terlebih dahulu.'}
                  </p>
                  <Button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/${tenantNpsn || '10648387'}/login`;
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Cari siswa (nama, NIS, NISN, email)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="md:w-48">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                      >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </div>
                    {(searchQuery || statusFilter !== 'all') && (
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                          }}
                          className="text-xs px-4 py-2.5 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                        >
                          Reset Filter
                        </Button>
                      </div>
                    )}
                  </div>
                  {searchQuery && (
                    <div className="mt-2 text-sm text-gray-600">
                      Menampilkan {filteredStudents.length} dari {totalStudents} siswa
                    </div>
                  )}
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-b-2 border-white/20">
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">NIS</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">NISN</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Nama</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Jenis Kelamin</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Tempat Lahir</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Tanggal Lahir</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Kelas</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student: Student, index: number) => (
                          <TableRow 
                            key={student.id} 
                            className={`transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                            } hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                          >
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{student.nis || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">{student.nisn || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {student.gender === 'L' || student.gender === 'Laki-laki' || student.gender === 'Male' 
                                  ? 'Laki-laki' 
                                  : student.gender === 'P' || student.gender === 'Perempuan' || student.gender === 'Female'
                                  ? 'Perempuan'
                                  : student.gender || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">{student.birth_place || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">{formatDate(student.birth_date)}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {student.class_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                student.status === 'active' 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
                              }`}>
                                {student.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDetailModal(student)}
                                  className="hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-150 text-xs px-3 py-1.5"
                                >
                                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Detail
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="hover:bg-purple-100 hover:border-purple-300 hover:text-purple-700 transition-all duration-150 text-xs px-3 py-1.5"
                                  onClick={() => handlePrintIdentity(student.id)}
                                >
                                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                                  Cetak
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-16">
                              <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                  {searchQuery || statusFilter !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Data Siswa'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                  {searchQuery || statusFilter !== 'all' 
                                    ? 'Tidak ada siswa yang sesuai dengan filter yang dipilih' 
                                    : 'Mulai dengan menambahkan data siswa pertama Anda'}
                                </p>
                                {(searchQuery || statusFilter !== 'all') ? (
                                  <Button
                                    onClick={() => {
                                      setSearchQuery('');
                                      setStatusFilter('all');
                                    }}
                                    variant="outline"
                                  >
                                    Reset Filter
                                  </Button>
                                ) : (
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
                                    Tambah Siswa Pertama
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}

            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              title={selectedStudent ? 'Edit Siswa' : 'Tambah Siswa'}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan nama lengkap siswa"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIS</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NISN</label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nomor Induk Siswa Nasional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Kota/Kabupaten"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-6"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createMutation.isPending || updateMutation.isPending}
                    className={`${themeConfig.primaryButton} px-6`}
                  >
                    {selectedStudent ? (
                      <>
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Data
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Simpan Data
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Modal>

            <Modal
              isOpen={isDetailModalOpen}
              onClose={closeDetailModal}
              title="Detail Siswa"
              size="xl"
            >
              {isDetailLoading ? (
                <div className="py-12 text-center">
                  <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                  <p className="mt-4 text-gray-600">Memuat detail siswa...</p>
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-red-600 text-center">
                  {detailError}
                </div>
              ) : detailStudent ? (
                <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-2">
                  <section className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">🧾</span>
                      Data Siswa
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField label="NIS" value={pickStudentValue(detailStudent, ['nis', 'student_number', 'studentNumber']) || '-'} />
                      <DetailField label="NISN" value={pickStudentValue(detailStudent, ['nisn']) || '-'} />
                      <DetailField label="NIK" value={nik || '-'} />
                      <DetailField label="Nama Lengkap" value={pickStudentValue(detailStudent, ['name']) || '-'} />
                      <DetailField label="Jenis Kelamin (L/P)" value={formatGender(genderValue as string)} />
                      <DetailField label="Tempat Lahir" value={birthPlaceValue || '-'} />
                      <DetailField label="Tanggal Lahir" value={formatDate(birthDateValue as string | undefined)} />
                      <DetailField label="Golongan Darah" value={bloodType || '-'} />
                      <DetailField label="Tanggal Masuk" value={formatDate(enrollmentDate as string | undefined)} />
                      <DetailField label="Nomor HP" value={pickStudentValue(detailStudent, ['phone']) || '-'} />
                      <DetailField label="Hobi" value={hobby || '-'} />
                      <DetailField label="Cita-cita" value={aspiration || '-'} />
                      <DetailField label="Tinggi Badan (cm)" value={formatNumberWithUnit(heightValue, 'cm')} />
                      <DetailField label="Berat Badan (kg)" value={formatNumberWithUnit(weightValue, 'kg')} />
                      <DetailField label="Status" value={studentStatusValue || '-'} />
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Alamat Siswa</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailField label="Dusun / Jalan" value={addressValue || '-'} />
                        <DetailField label="Desa / Kelurahan" value={villageValue || '-'} />
                        <DetailField label="Kecamatan" value={subDistrictValue || '-'} />
                        <DetailField label="Kabupaten / Kota" value={districtValue || cityValue || '-'} />
                        <DetailField label="Provinsi" value={provinceValue || '-'} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Sekolah Asal</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailField label="Nama Lembaga" value={previousSchoolName || '-'} />
                        <DetailField label="Alamat Sekolah" value={previousSchoolAddress || '-'} />
                        <DetailField label="NPSN" value={previousSchoolNpsn || '-'} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField label="No. KK" value={familyCardNumber || '-'} />
                      <DetailField label="Nomor Kartu (KIP / PKH / KIS)" value={assistanceCardNumber || '-'} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">👨‍👩‍👧</span>
                      Data Keluarga
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField
                        label="Status dalam Keluarga (Anak ke-…)"
                        value={
                          childOrder
                            ? `Anak ke-${childOrder}`
                            : familyStatus || '-'
                        }
                      />
                      <DetailField label="Jumlah Saudara Kandung" value={siblingCount || '-'} />
                      <DetailField label="Jumlah Saudara Tiri" value={stepSiblingCount || '-'} />
                      <DetailField
                        label="Rata-rata Penghasilan Orang Tua per Bulan"
                        value={formatCurrencyIdr(averageIncomeNumber)}
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">👨</span>
                      Data Ayah Kandung
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField label="Status Ayah Kandung" value={fatherData.status || '-'} />
                      <DetailField label="NIK Ayah" value={fatherData.nik || '-'} />
                      <DetailField label="Nama Ayah" value={fatherData.name || '-'} />
                      <DetailField label="Tempat Lahir" value={fatherData.birthPlace || '-'} />
                      <DetailField label="Tanggal Lahir" value={formatDate(fatherData.birthDate as string | undefined)} />
                      <DetailField label="Pendidikan Terakhir" value={fatherData.education || '-'} />
                      <DetailField label="Pekerjaan" value={fatherData.occupation || '-'} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">👩</span>
                      Data Ibu Kandung
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField label="Status Ibu Kandung" value={motherData.status || '-'} />
                      <DetailField label="NIK Ibu" value={motherData.nik || '-'} />
                      <DetailField label="Nama Ibu" value={motherData.name || '-'} />
                      <DetailField label="Tempat Lahir" value={motherData.birthPlace || '-'} />
                      <DetailField label="Tanggal Lahir" value={formatDate(motherData.birthDate as string | undefined)} />
                      <DetailField label="Pendidikan Terakhir" value={motherData.education || '-'} />
                      <DetailField label="Pekerjaan" value={motherData.occupation || '-'} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">👴</span>
                        Data Wali (Jika Ada)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {guardianModeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setGuardianMode(option.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                              guardianMode === option.value
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailField
                        label="Status Wali"
                        value={
                          guardianMode === 'father'
                            ? fatherData.status || '-'
                            : guardianMode === 'mother'
                              ? motherData.status || '-'
                              : guardianData.status || '-'
                        }
                      />
                      <DetailField label="NIK Wali" value={displayedGuardianData.nik || '-'} />
                      <DetailField label="Nama Wali" value={displayedGuardianData.name || '-'} />
                      <DetailField label="Pendidikan Terakhir" value={displayedGuardianData.education || '-'} />
                      <DetailField label="Pekerjaan" value={displayedGuardianData.occupation || '-'} />
                    </div>
                  </section>
                </div>
              ) : (
                <p className="text-center text-gray-600">Data siswa tidak ditemukan.</p>
              )}

              <div className="flex justify-end gap-2 pt-6">
                <Button variant="secondary" type="button" onClick={closeDetailModal}>
                  Tutup
                </Button>
                {detailStudent && (
                  <Button
                    type="button"
                    className={themeConfig.primaryButton}
                    onClick={() => {
                      closeDetailModal();
                      handleEdit(detailStudent);
                    }}
                  >
                    Edit Data
                  </Button>
                )}
              </div>
            </Modal>
          </>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

