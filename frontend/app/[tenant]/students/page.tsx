'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable, SkeletonStats } from '@/components/ui/Skeleton';
import { ImportButton } from '@/components/ui/ImportButton';
import { studentsApi, Student, StudentCreateData } from '@/lib/api/students';
import { classesApi } from '@/lib/api/classes';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId, useTenantIdState } from '@/lib/hooks/useTenant';
import { useActiveAcademicYear } from '@/lib/hooks/useAcademicYear';
import apiClient from '@/lib/api/client';
import { validateEmail, validatePhone, validateNISN, validateNIK } from '@/lib/validation/schemas';
import { AddressCascade } from '@/components/forms/AddressCascade';

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
  const router = useRouter();
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
    academicYear: '',
    nik: '',
    religion: '',
    bloodType: '',
    rt: '',
    rw: '',
    village: '',
    subDistrict: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    // Data Ayah
    fatherName: '',
    fatherNik: '',
    fatherBirthDate: '',
    fatherBirthPlace: '',
    fatherEducation: '',
    fatherOccupation: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherIncome: undefined,
    // Data Ibu
    motherName: '',
    motherNik: '',
    motherBirthDate: '',
    motherBirthPlace: '',
    motherEducation: '',
    motherOccupation: '',
    motherPhone: '',
    motherEmail: '',
    motherIncome: undefined,
    // Data Wali
    guardianName: '',
    guardianNik: '',
    guardianBirthDate: '',
    guardianBirthPlace: '',
    guardianEducation: '',
    guardianOccupation: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianIncome: undefined,
    guardianRelationship: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [exportingFormat, setExportingFormat] = useState<'excel' | 'pdf' | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const queryClient = useQueryClient();

  const isTenantReady = !!tenantId && !tenantLoading;
  const {
    data: activeAcademicYear,
    isLoading: academicYearLoading,
  } = useActiveAcademicYear(tenantId, { enabled: isTenantReady });
  const activeAcademicYearName = activeAcademicYear?.name || '';
  const isExporting = exportingFormat !== null;

  // Fetch classes for dropdown
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', tenantId, activeAcademicYearName || 'all'],
    queryFn: () =>
      classesApi.getAll(tenantId!, {
        academicYear: activeAcademicYearName || undefined,
      }),
    enabled: !!tenantId && !tenantLoading && !academicYearLoading,
  });

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

  const handleNavigateToTransfer = () => {
    if (!tenantNpsn) {
      return;
    }
    router.push(`/${tenantNpsn}/student-transfer`);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    setExportingFormat(format);
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/students/export/${format}`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type:
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `students_${new Date().toISOString().split('T')[0]}.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Export error:', error);
      const message =
        error?.response?.data?.message ||
        'Gagal mengekspor data siswa. Silakan coba lagi.';
      alert(message);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDownloadFormat = async () => {
    if (!tenantId) {
      alert('Tenant ID tidak ditemukan');
      return;
    }

    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/students/export/template`,
        {
          responseType: 'blob',
        },
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `format_import_data_siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading format:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengunduh format Excel';
      alert(errorMessage);
    }
  };

  const handleImport = async (file: File, format: 'excel' | 'csv') => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (format !== 'excel') {
      alert('Format file tidak didukung. Gunakan file Excel (.xlsx).');
      return;
    }

    setIsImporting(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await apiClient.post(
        `/tenants/${tenantId}/students/import/excel`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;
      const importedCount = result?.imported ?? result?.count ?? result?.data?.length ?? 0;
      const failedCount = result?.failed ?? 0;

      await queryClient.invalidateQueries({ queryKey: ['students', tenantId, activeAcademicYearName || 'all'] });
      
      if (failedCount > 0) {
        alert(`Import selesai: ${importedCount} berhasil, ${failedCount} gagal. Silakan cek detail error di console.`);
        console.log('Import results:', result?.results);
      } else {
        alert(`Berhasil mengimpor ${importedCount} data siswa.`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      const message =
        error?.response?.data?.message ||
        'Gagal mengimpor data siswa. Silakan coba lagi.';
      alert(message);
    } finally {
      setIsImporting(false);
    }
  };

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
    
    // Determine status
    const isActive = student.isActive !== undefined 
      ? student.isActive 
      : student.status === 'active' || student.status === undefined;
    
    return {
      id: student.id,
      // Backward compatibility fields
      nis: student.studentNumber || student.nis || '',
      nisn: student.nisn || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      gender: student.gender || '',
      birth_place: student.birthPlace || '',
      birth_date: birthDateStr,
      address: student.address || '',
      class_id: student.classId || student.class_id || undefined,
      class_name: student.classRoom?.name || student.className || '',
      status: isActive ? 'active' : 'inactive',
      created_at: student.createdAt || student.created_at,
      updated_at: student.updatedAt || student.updated_at,
      // New format fields
      npsn: student.npsn,
      studentNumber: student.studentNumber,
      birthPlace: student.birthPlace,
      birthDate: birthDateStr,
      classId: student.classId,
      classRoom: student.classRoom,
      isActive: isActive,
      nik: student.nik,
      ...student, // Keep all other fields for detail modal
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', tenantId, activeAcademicYearName || 'all'],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak ditemukan. Silakan login terlebih dahulu.');
      }
      
      try {
        console.log('Fetching students for tenantId:', tenantId);
        const academicYearParam = activeAcademicYearName && activeAcademicYearName.length > 0
          ? activeAcademicYearName
          : undefined;
        const response = await studentsApi.getAll(tenantId, {
          academicYear: academicYearParam,
        });
        console.log('Students API response:', response);
        
        // Handle both array response and object response format
        // Backend might return array directly or { data, total, page, limit, totalPages }
        let studentsArray: any[] = [];
        let responseMeta: any = {};
        
        if (Array.isArray(response)) {
          console.log('Response is array, converting to object format');
          studentsArray = response;
          responseMeta = {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1,
          };
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Response already has data property
          studentsArray = response.data || [];
          responseMeta = {
            total: response.total ?? studentsArray.length,
            page: response.page ?? 1,
            limit: response.limit ?? 20,
            totalPages: response.totalPages ?? Math.ceil((response.total ?? studentsArray.length) / (response.limit ?? 20)),
          };
        } else {
          // Fallback: empty array
          studentsArray = [];
          responseMeta = {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 1,
          };
        }
        
        console.log('Students array:', studentsArray);
        console.log('Number of students:', studentsArray.length);
        
        // Transform students
        const transformed = studentsArray.map(transformStudent).filter(Boolean);
        
        console.log('Transformed students:', transformed);
        console.log('Number of transformed students:', transformed.length);
        
        return {
          data: transformed,
          total: responseMeta.total,
          page: responseMeta.page,
          limit: responseMeta.limit,
          totalPages: responseMeta.totalPages,
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
    enabled: !!tenantId && !tenantLoading && !academicYearLoading,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: StudentCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }

      // Transform frontend data to backend format
      const backendData: any = {
        studentNumber: data.nis || data.studentNumber,
        nisn: data.nisn,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        birthPlace: data.birth_place || data.birthPlace,
        birthDate: data.birth_date || data.birthDate,
        address: data.address,
        classId: data.class_id || data.classId,
        isActive: data.status === 'active' || data.isActive !== false,
      };
      
      backendData.academicYear = data.academicYear || activeAcademicYearName || undefined;

      // Add optional fields if provided
      if (data.npsn) backendData.npsn = data.npsn;
      if (data.nik) backendData.nik = data.nik;
      if (data.religion) backendData.religion = data.religion;
      if (data.bloodType) backendData.bloodType = data.bloodType;
      if (data.rt) backendData.rt = data.rt;
      if (data.rw) backendData.rw = data.rw;
      if (data.village) backendData.village = data.village;
      if (data.subDistrict) backendData.subDistrict = data.subDistrict;
      if (data.district) backendData.district = data.district;
      if (data.city) backendData.city = data.city;
      if (data.province) backendData.province = data.province;
      if (data.postalCode) backendData.postalCode = data.postalCode;
      // Data Ayah
      if (data.fatherName) backendData.fatherName = data.fatherName;
      if (data.fatherNik) backendData.fatherNik = data.fatherNik;
      if (data.fatherBirthDate) backendData.fatherBirthDate = data.fatherBirthDate;
      if (data.fatherBirthPlace) backendData.fatherBirthPlace = data.fatherBirthPlace;
      if (data.fatherEducation) backendData.fatherEducation = data.fatherEducation;
      if (data.fatherOccupation) backendData.fatherOccupation = data.fatherOccupation;
      if (data.fatherPhone) backendData.fatherPhone = data.fatherPhone;
      if (data.fatherEmail) backendData.fatherEmail = data.fatherEmail;
      if (data.fatherIncome !== undefined) backendData.fatherIncome = data.fatherIncome;
      // Data Ibu
      if (data.motherName) backendData.motherName = data.motherName;
      if (data.motherNik) backendData.motherNik = data.motherNik;
      if (data.motherBirthDate) backendData.motherBirthDate = data.motherBirthDate;
      if (data.motherBirthPlace) backendData.motherBirthPlace = data.motherBirthPlace;
      if (data.motherEducation) backendData.motherEducation = data.motherEducation;
      if (data.motherOccupation) backendData.motherOccupation = data.motherOccupation;
      if (data.motherPhone) backendData.motherPhone = data.motherPhone;
      if (data.motherEmail) backendData.motherEmail = data.motherEmail;
      if (data.motherIncome !== undefined) backendData.motherIncome = data.motherIncome;
      // Data Wali
      if (data.guardianName) backendData.guardianName = data.guardianName;
      if (data.guardianNik) backendData.guardianNik = data.guardianNik;
      if (data.guardianBirthDate) backendData.guardianBirthDate = data.guardianBirthDate;
      if (data.guardianBirthPlace) backendData.guardianBirthPlace = data.guardianBirthPlace;
      if (data.guardianEducation) backendData.guardianEducation = data.guardianEducation;
      if (data.guardianOccupation) backendData.guardianOccupation = data.guardianOccupation;
      if (data.guardianPhone) backendData.guardianPhone = data.guardianPhone;
      if (data.guardianEmail) backendData.guardianEmail = data.guardianEmail;
      if (data.guardianIncome !== undefined) backendData.guardianIncome = data.guardianIncome;
      if (data.guardianRelationship) backendData.guardianRelationship = data.guardianRelationship;
      return studentsApi.create(tenantId, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId, activeAcademicYearName || 'all'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Error creating student:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal membuat data siswa';
      alert(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }

      // Transform frontend data to backend format
      const backendData: any = {};
      if (data.nis !== undefined || data.studentNumber !== undefined) {
        backendData.studentNumber = data.nis || data.studentNumber;
      }
      if (data.nisn !== undefined) backendData.nisn = data.nisn;
      if (data.name !== undefined) backendData.name = data.name;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.phone !== undefined) backendData.phone = data.phone;
      if (data.gender !== undefined) backendData.gender = data.gender;
      if (data.birth_place !== undefined || data.birthPlace !== undefined) {
        backendData.birthPlace = data.birth_place || data.birthPlace;
      }
      if (data.birth_date !== undefined || data.birthDate !== undefined) {
        backendData.birthDate = data.birth_date || data.birthDate;
      }
      if (data.address !== undefined) backendData.address = data.address;
      if (data.class_id !== undefined || data.classId !== undefined) {
        backendData.classId = data.class_id || data.classId;
      }
      if (data.status !== undefined) {
        backendData.isActive = data.status === 'active';
      } else if (data.isActive !== undefined) {
        backendData.isActive = data.isActive;
      }
      if (data.academicYear !== undefined) {
        backendData.academicYear = data.academicYear;
      }
      
      // Add optional fields if provided
      if (data.npsn !== undefined) backendData.npsn = data.npsn;
      if (data.nik !== undefined) backendData.nik = data.nik;
      if (data.religion !== undefined) backendData.religion = data.religion;
      if (data.bloodType !== undefined) backendData.bloodType = data.bloodType;
      if (data.rt !== undefined) backendData.rt = data.rt;
      if (data.rw !== undefined) backendData.rw = data.rw;
      if (data.village !== undefined) backendData.village = data.village;
      if (data.subDistrict !== undefined) backendData.subDistrict = data.subDistrict;
      if (data.district !== undefined) backendData.district = data.district;
      if (data.city !== undefined) backendData.city = data.city;
      if (data.province !== undefined) backendData.province = data.province;
      if (data.postalCode !== undefined) backendData.postalCode = data.postalCode;
      // Data Ayah
      if (data.fatherName !== undefined) backendData.fatherName = data.fatherName;
      if (data.fatherNik !== undefined) backendData.fatherNik = data.fatherNik;
      if (data.fatherBirthDate !== undefined) backendData.fatherBirthDate = data.fatherBirthDate;
      if (data.fatherBirthPlace !== undefined) backendData.fatherBirthPlace = data.fatherBirthPlace;
      if (data.fatherEducation !== undefined) backendData.fatherEducation = data.fatherEducation;
      if (data.fatherOccupation !== undefined) backendData.fatherOccupation = data.fatherOccupation;
      if (data.fatherPhone !== undefined) backendData.fatherPhone = data.fatherPhone;
      if (data.fatherEmail !== undefined) backendData.fatherEmail = data.fatherEmail;
      if (data.fatherIncome !== undefined) backendData.fatherIncome = data.fatherIncome;
      // Data Ibu
      if (data.motherName !== undefined) backendData.motherName = data.motherName;
      if (data.motherNik !== undefined) backendData.motherNik = data.motherNik;
      if (data.motherBirthDate !== undefined) backendData.motherBirthDate = data.motherBirthDate;
      if (data.motherBirthPlace !== undefined) backendData.motherBirthPlace = data.motherBirthPlace;
      if (data.motherEducation !== undefined) backendData.motherEducation = data.motherEducation;
      if (data.motherOccupation !== undefined) backendData.motherOccupation = data.motherOccupation;
      if (data.motherPhone !== undefined) backendData.motherPhone = data.motherPhone;
      if (data.motherEmail !== undefined) backendData.motherEmail = data.motherEmail;
      if (data.motherIncome !== undefined) backendData.motherIncome = data.motherIncome;
      // Data Wali
      if (data.guardianName !== undefined) backendData.guardianName = data.guardianName;
      if (data.guardianNik !== undefined) backendData.guardianNik = data.guardianNik;
      if (data.guardianBirthDate !== undefined) backendData.guardianBirthDate = data.guardianBirthDate;
      if (data.guardianBirthPlace !== undefined) backendData.guardianBirthPlace = data.guardianBirthPlace;
      if (data.guardianEducation !== undefined) backendData.guardianEducation = data.guardianEducation;
      if (data.guardianOccupation !== undefined) backendData.guardianOccupation = data.guardianOccupation;
      if (data.guardianPhone !== undefined) backendData.guardianPhone = data.guardianPhone;
      if (data.guardianEmail !== undefined) backendData.guardianEmail = data.guardianEmail;
      if (data.guardianIncome !== undefined) backendData.guardianIncome = data.guardianIncome;
      if (data.guardianRelationship !== undefined) backendData.guardianRelationship = data.guardianRelationship;
      return studentsApi.update(tenantId, id, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId, activeAcademicYearName || 'all'] });
      setIsModalOpen(false);
      setSelectedStudent(null);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Error updating student:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengupdate data siswa';
      alert(errorMessage);
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
      academicYear: activeAcademicYearName || '',
      nik: '',
      religion: '',
      bloodType: '',
      rt: '',
      rw: '',
      village: '',
      subDistrict: '',
      district: '',
      city: '',
      province: '',
      postalCode: '',
      // Data Ayah
      fatherName: '',
      fatherNik: '',
      fatherBirthDate: '',
      fatherBirthPlace: '',
      fatherEducation: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      fatherIncome: undefined,
      // Data Ibu
      motherName: '',
      motherNik: '',
      motherBirthDate: '',
      motherBirthPlace: '',
      motherEducation: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      motherIncome: undefined,
      // Data Wali
      guardianName: '',
      guardianNik: '',
      guardianBirthDate: '',
      guardianBirthPlace: '',
      guardianEducation: '',
      guardianOccupation: '',
      guardianPhone: '',
      guardianEmail: '',
      guardianIncome: undefined,
      guardianRelationship: '',
    });
    setFormErrors({});
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
    const fatherBirthDateValue = pickStudentValue(student, ['father_birth_date', 'fatherBirthDate']);
    const motherBirthDateValue = pickStudentValue(student, ['mother_birth_date', 'motherBirthDate']);
    const guardianBirthDateValue = pickStudentValue(student, ['guardian_birth_date', 'guardianBirthDate']);
    
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
      academicYear: (pickStudentValue(student, ['academicYear', 'academic_year']) as string) || '',
      nik: (pickStudentValue(student, ['nik']) as string) || '',
      religion: (pickStudentValue(student, ['religion']) as string) || '',
      bloodType: (pickStudentValue(student, ['blood_type', 'bloodType']) as string) || '',
      rt: (pickStudentValue(student, ['rt']) as string) || '',
      rw: (pickStudentValue(student, ['rw']) as string) || '',
      village: (pickStudentValue(student, ['village', 'desa', 'kelurahan']) as string) || '',
      subDistrict: (pickStudentValue(student, ['sub_district', 'subDistrict', 'kecamatan']) as string) || '',
      district: (pickStudentValue(student, ['district', 'kabupaten']) as string) || '',
      city: (pickStudentValue(student, ['city', 'kota']) as string) || '',
      province: (pickStudentValue(student, ['province']) as string) || '',
      postalCode: (pickStudentValue(student, ['postal_code', 'postalCode']) as string) || '',
      // Data Ayah
      fatherName: (pickStudentValue(student, ['father_name', 'fatherName']) as string) || '',
      fatherNik: (pickStudentValue(student, ['father_nik', 'fatherNik']) as string) || '',
      fatherBirthDate: normalizeDateInput(fatherBirthDateValue),
      fatherBirthPlace: (pickStudentValue(student, ['father_birth_place', 'fatherBirthPlace']) as string) || '',
      fatherEducation: (pickStudentValue(student, ['father_education', 'fatherEducation']) as string) || '',
      fatherOccupation: (pickStudentValue(student, ['father_occupation', 'fatherOccupation']) as string) || '',
      fatherPhone: (pickStudentValue(student, ['father_phone', 'fatherPhone']) as string) || '',
      fatherEmail: (pickStudentValue(student, ['father_email', 'fatherEmail']) as string) || '',
      fatherIncome: pickStudentValue(student, ['father_income', 'fatherIncome']) as number | undefined,
      // Data Ibu
      motherName: (pickStudentValue(student, ['mother_name', 'motherName']) as string) || '',
      motherNik: (pickStudentValue(student, ['mother_nik', 'motherNik']) as string) || '',
      motherBirthDate: normalizeDateInput(motherBirthDateValue),
      motherBirthPlace: (pickStudentValue(student, ['mother_birth_place', 'motherBirthPlace']) as string) || '',
      motherEducation: (pickStudentValue(student, ['mother_education', 'motherEducation']) as string) || '',
      motherOccupation: (pickStudentValue(student, ['mother_occupation', 'motherOccupation']) as string) || '',
      motherPhone: (pickStudentValue(student, ['mother_phone', 'motherPhone']) as string) || '',
      motherEmail: (pickStudentValue(student, ['mother_email', 'motherEmail']) as string) || '',
      motherIncome: pickStudentValue(student, ['mother_income', 'motherIncome']) as number | undefined,
      // Data Wali
      guardianName: (pickStudentValue(student, ['guardian_name', 'guardianName']) as string) || '',
      guardianNik: (pickStudentValue(student, ['guardian_nik', 'guardianNik']) as string) || '',
      guardianBirthDate: normalizeDateInput(guardianBirthDateValue),
      guardianBirthPlace: (pickStudentValue(student, ['guardian_birth_place', 'guardianBirthPlace']) as string) || '',
      guardianEducation: (pickStudentValue(student, ['guardian_education', 'guardianEducation']) as string) || '',
      guardianOccupation: (pickStudentValue(student, ['guardian_occupation', 'guardianOccupation']) as string) || '',
      guardianPhone: (pickStudentValue(student, ['guardian_phone', 'guardianPhone']) as string) || '',
      guardianEmail: (pickStudentValue(student, ['guardian_email', 'guardianEmail']) as string) || '',
      guardianIncome: pickStudentValue(student, ['guardian_income', 'guardianIncome']) as number | undefined,
      guardianRelationship: (pickStudentValue(student, ['guardian_relationship', 'guardianRelationship']) as string) || '',
    });
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name (required)
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Nama wajib diisi dan minimal 2 karakter';
    }

    // Validate NIK (required, must be 16 digits)
    if (!formData.nik || formData.nik.trim() === '') {
      errors.nik = 'NIK wajib diisi';
    } else {
      const nikError = validateNIK(formData.nik);
      if (nikError) errors.nik = nikError;
    }

    // Validate NISN (if provided, must be 10 digits)
    if (formData.nisn && formData.nisn.trim() !== '') {
      const nisnError = validateNISN(formData.nisn);
      if (nisnError) errors.nisn = nisnError;
    }

    // Validate email (if provided)
    if (formData.email && formData.email.trim() !== '') {
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;
    }

    // Validate phone (if provided)
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError;
    }

    // Validate birth date (if provided)
    if (formData.birth_date) {
      const date = new Date(formData.birth_date);
      if (isNaN(date.getTime())) {
        errors.birth_date = 'Tanggal lahir tidak valid';
      } else {
        const today = new Date();
        if (date > today) {
          errors.birth_date = 'Tanggal lahir tidak boleh di masa depan';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFieldChange = (field: keyof StudentCreateData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
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
      student.nik?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <div className="flex flex-wrap items-center gap-2">
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
            <Button
              type="button"
              variant="outline"
              onClick={handleNavigateToTransfer}
              disabled={!isTenantReady}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Mutasi
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadFormat}
              disabled={!isTenantReady}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Format
            </Button>
            <ImportButton
              onImport={handleImport}
              isLoading={isImporting}
              disabled={!isTenantReady}
              accept=".xlsx,.xls"
              label="Import Excel"
              loadingLabel="Mengimpor..."
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={!isTenantReady || totalStudents === 0 || (isExporting && exportingFormat !== 'excel')}
              loading={exportingFormat === 'excel'}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={!isTenantReady || totalStudents === 0 || (isExporting && exportingFormat !== 'pdf')}
              loading={exportingFormat === 'pdf'}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </Button>
          </div>
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
                      onClick={() =>
                        queryClient.invalidateQueries({
                          queryKey: ['students', tenantId, activeAcademicYearName || 'all'],
                        })
                      }
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
                          placeholder="Cari siswa (nama, NIK, NIS, NISN, email)..."
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
                          <TableHead className="font-bold text-white py-4 px-6 text-sm uppercase tracking-wider">NIK</TableHead>
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
                              <span className="text-sm font-medium text-gray-900">{student.nik || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{student.nis || student.studentNumber || '-'}</span>
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
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap siswa"
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIS</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => handleFieldChange('nis', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIK <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) => {
                        // Hanya allow angka
                        const value = e.target.value.replace(/\D/g, '');
                        handleFieldChange('nik', value);
                      }}
                      maxLength={16}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.nik ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="16 digit angka"
                      required
                    />
                    {formErrors.nik && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nik}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NISN</label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => {
                        // Hanya allow angka
                        const value = e.target.value.replace(/\D/g, '');
                        handleFieldChange('nisn', value);
                      }}
                      maxLength={10}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.nisn ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10 digit angka (opsional)"
                    />
                    {formErrors.nisn && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nisn}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleFieldChange('gender', e.target.value)}
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
                      onChange={(e) => handleFieldChange('birth_place', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Kota/Kabupaten"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.birth_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.birth_date && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.birth_date}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agama</label>
                    <select
                      value={formData.religion}
                      onChange={(e) => handleFieldChange('religion', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Pilih Agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Golongan Darah</label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => handleFieldChange('bloodType', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Pilih Golongan Darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                    <select
                      value={formData.class_id || ''}
                      onChange={(e) => handleFieldChange('class_id', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      disabled={classesLoading}
                    >
                      <option value="">Pilih Kelas</option>
                      {classesData?.data?.map((classRoom) => (
                        <option key={classRoom.id} value={classRoom.id}>
                          {classRoom.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Alamat Lengkap</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">RT</label>
                      <input
                        type="text"
                        value={formData.rt}
                        onChange={(e) => handleFieldChange('rt', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="RT"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">RW</label>
                      <input
                        type="text"
                        value={formData.rw}
                        onChange={(e) => handleFieldChange('rw', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="RW"
                      />
                    </div>

                    <div className="col-span-2">
                      <AddressCascade
                        provinceName={formData.province}
                        regencyName={formData.district || formData.city}
                        districtName={formData.subDistrict}
                        villageName={formData.village}
                        onProvinceChange={(name) => handleFieldChange('province', name)}
                        onRegencyChange={(name) => {
                          handleFieldChange('district', name);
                          handleFieldChange('city', name);
                        }}
                        onDistrictChange={(name) => handleFieldChange('subDistrict', name)}
                        onVillageChange={(name) => handleFieldChange('village', name)}
                        showLabels={true}
                        className="col-span-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Pos</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                        maxLength={5}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Kode Pos"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Ayah */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Ayah Kandung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ayah</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => handleFieldChange('fatherName', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nama lengkap ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">NIK Ayah</label>
                      <input
                        type="text"
                        value={formData.fatherNik}
                        onChange={(e) => handleFieldChange('fatherNik', e.target.value)}
                        maxLength={16}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="16 digit angka"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.fatherBirthPlace}
                        onChange={(e) => handleFieldChange('fatherBirthPlace', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tempat lahir ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.fatherBirthDate}
                        onChange={(e) => handleFieldChange('fatherBirthDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pendidikan Terakhir</label>
                      <input
                        type="text"
                        value={formData.fatherEducation}
                        onChange={(e) => handleFieldChange('fatherEducation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="SD/SMP/SMA/S1/dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleFieldChange('fatherOccupation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Pekerjaan ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                      <input
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => handleFieldChange('fatherPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.fatherEmail}
                        onChange={(e) => handleFieldChange('fatherEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Penghasilan per Bulan (Rp)</label>
                      <input
                        type="number"
                        value={formData.fatherIncome || ''}
                        onChange={(e) => handleFieldChange('fatherIncome', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Ibu Kandung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ibu</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => handleFieldChange('motherName', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nama lengkap ibu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">NIK Ibu</label>
                      <input
                        type="text"
                        value={formData.motherNik}
                        onChange={(e) => handleFieldChange('motherNik', e.target.value)}
                        maxLength={16}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="16 digit angka"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.motherBirthPlace}
                        onChange={(e) => handleFieldChange('motherBirthPlace', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tempat lahir ibu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.motherBirthDate}
                        onChange={(e) => handleFieldChange('motherBirthDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pendidikan Terakhir</label>
                      <input
                        type="text"
                        value={formData.motherEducation}
                        onChange={(e) => handleFieldChange('motherEducation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="SD/SMP/SMA/S1/dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                      <input
                        type="text"
                        value={formData.motherOccupation}
                        onChange={(e) => handleFieldChange('motherOccupation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Pekerjaan ibu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                      <input
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => handleFieldChange('motherPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.motherEmail}
                        onChange={(e) => handleFieldChange('motherEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Penghasilan per Bulan (Rp)</label>
                      <input
                        type="number"
                        value={formData.motherIncome || ''}
                        onChange={(e) => handleFieldChange('motherIncome', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Wali */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Wali (Jika Ada)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Wali</label>
                      <input
                        type="text"
                        value={formData.guardianName}
                        onChange={(e) => handleFieldChange('guardianName', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nama lengkap wali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">NIK Wali</label>
                      <input
                        type="text"
                        value={formData.guardianNik}
                        onChange={(e) => handleFieldChange('guardianNik', e.target.value)}
                        maxLength={16}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="16 digit angka"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hubungan dengan Siswa</label>
                      <input
                        type="text"
                        value={formData.guardianRelationship}
                        onChange={(e) => handleFieldChange('guardianRelationship', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Contoh: Paman, Bibi, Kakek, Nenek, dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.guardianBirthPlace}
                        onChange={(e) => handleFieldChange('guardianBirthPlace', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tempat lahir wali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.guardianBirthDate}
                        onChange={(e) => handleFieldChange('guardianBirthDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pendidikan Terakhir</label>
                      <input
                        type="text"
                        value={formData.guardianEducation}
                        onChange={(e) => handleFieldChange('guardianEducation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="SD/SMP/SMA/S1/dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                      <input
                        type="text"
                        value={formData.guardianOccupation}
                        onChange={(e) => handleFieldChange('guardianOccupation', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Pekerjaan wali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                      <input
                        type="tel"
                        value={formData.guardianPhone}
                        onChange={(e) => handleFieldChange('guardianPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.guardianEmail}
                        onChange={(e) => handleFieldChange('guardianEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Penghasilan per Bulan (Rp)</label>
                      <input
                        type="number"
                        value={formData.guardianIncome || ''}
                        onChange={(e) => handleFieldChange('guardianIncome', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
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
                      <DetailField label="NIK" value={pickStudentValue(detailStudent, ['nik']) || '-'} />
                      <DetailField label="NIS" value={pickStudentValue(detailStudent, ['nis', 'student_number', 'studentNumber']) || '-'} />
                      <DetailField label="NISN" value={pickStudentValue(detailStudent, ['nisn']) || '-'} />
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

