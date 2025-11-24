'use client';

import { useState, useRef, useMemo, ReactNode } from 'react';
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
import { hrApi, Position } from '@/lib/api/hr';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantIdState } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import { useDebounce } from '@/lib/hooks/useDebounce';

// DetailField Component
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

// Format Currency IDR
const formatCurrencyIdr = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

const TRAINING_FIELD_CONFIGS = [
  { participationKey: 'trainingParticipation1', yearKey: 'trainingYear1', label: 'Pelatihan (1)' },
  { participationKey: 'trainingParticipation2', yearKey: 'trainingYear2', label: 'Pelatihan (2)' },
  { participationKey: 'trainingParticipation3', yearKey: 'trainingYear3', label: 'Pelatihan (3)' },
  { participationKey: 'trainingParticipation4', yearKey: 'trainingYear4', label: 'Pelatihan (4)' },
  { participationKey: 'trainingParticipation5', yearKey: 'trainingYear5', label: 'Pelatihan (5)' },
] as const;

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
    isMainTenant: false,
    positionId: undefined,
    // Data Pribadi Tambahan
    pageId: '',
    npk: '',
    motherName: '',
    // Detail Alamat
    province: '',
    cityDistrict: '',
    subDistrict: '',
    village: '',
    postalCode: '',
    // Data Pendidikan
    educationLevel: '',
    studyProgramGroup: '',
    // Status Kepegawaian
    employmentStatusPtk: '',
    employmentStatus: '',
    employmentRank: '',
    tmtSkCpns: '',
    tmtSkAwal: '',
    tmtSkTerakhir: '',
    appointingInstitution: '',
    assignmentStatus: '',
    baseSalary: undefined,
    workLocationStatus: '',
    satminkalType: '',
    satminkalNpsn: '',
    satminkalIdentity: '',
    inpassingStatus: '',
    tmtInpassing: '',
    // Tugas dan Mengajar
    mainDutyEducator: '',
    additionalDuty: '',
    mainDutySchool: '',
    mainSubject: '',
    totalTeachingHours: undefined,
    dutyType: '',
    teachingHoursEquivalent: undefined,
    teachOtherSchool: false,
    otherWorkLocationType: '',
    otherWorkLocationNpsn: '',
    otherSchoolSubject: '',
    otherSchoolHours: undefined,
    // Informasi Sertifikasi
    certificationParticipationStatus: '',
    certificationPassStatus: '',
    certificationYear: undefined,
    certifiedSubject: '',
    nrg: '',
    nrgSkNumber: '',
    nrgSkDate: '',
    certificationParticipantNumber: '',
    certificationType: '',
    certificationPassDate: '',
    educatorCertificateNumber: '',
    certificateIssueDate: '',
    lptkName: '',
    // Informasi Tunjangan
    tpgRecipientStatus: '',
    tpgStartYear: undefined,
    tpgAmount: undefined,
    tfgRecipientStatus: '',
    tfgStartYear: undefined,
    tfgAmount: undefined,
    // Penghargaan dan Pelatihan
    hasReceivedAward: false,
    highestAward: '',
    awardField: '',
    awardLevel: '',
    awardYear: undefined,
    competencyTraining: '',
    trainingParticipation1: '',
    trainingYear1: undefined,
    trainingParticipation2: '',
    trainingYear2: undefined,
    trainingParticipation3: '',
    trainingYear3: undefined,
    trainingParticipation4: '',
    trainingYear4: undefined,
    trainingParticipation5: '',
    trainingYear5: undefined,
    // Kompetensi Kepala Madrasah
    personalityCompetency: undefined,
    managerialCompetency: undefined,
    entrepreneurshipCompetency: undefined,
    supervisionCompetency: undefined,
    socialCompetency: undefined,
  });
  const [activeTab, setActiveTab] = useState('basic');

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

  // Fetch positions for assignment
  const { data: positionsData } = useQuery({
    queryKey: ['positions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return hrApi.getAllPositions(tenantId);
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
    isMainTenant: false,
      positionId: undefined,
      // Data Pribadi Tambahan
      pageId: '',
      npk: '',
      motherName: '',
      // Detail Alamat
      province: '',
      cityDistrict: '',
      subDistrict: '',
      village: '',
      postalCode: '',
      // Data Pendidikan
      educationLevel: '',
      studyProgramGroup: '',
      // Status Kepegawaian
      employmentStatusPtk: '',
      employmentStatus: '',
      employmentRank: '',
      tmtSkCpns: '',
      tmtSkAwal: '',
      tmtSkTerakhir: '',
      appointingInstitution: '',
      assignmentStatus: '',
      baseSalary: undefined,
      workLocationStatus: '',
      satminkalType: '',
      satminkalNpsn: '',
      satminkalIdentity: '',
      inpassingStatus: '',
      tmtInpassing: '',
      // Tugas dan Mengajar
      mainDutyEducator: '',
      additionalDuty: '',
      mainDutySchool: '',
      mainSubject: '',
      totalTeachingHours: undefined,
      dutyType: '',
      teachingHoursEquivalent: undefined,
      teachOtherSchool: false,
      otherWorkLocationType: '',
      otherWorkLocationNpsn: '',
      otherSchoolSubject: '',
      otherSchoolHours: undefined,
      // Informasi Sertifikasi
      certificationParticipationStatus: '',
      certificationPassStatus: '',
      certificationYear: undefined,
      certifiedSubject: '',
      nrg: '',
      nrgSkNumber: '',
      nrgSkDate: '',
      certificationParticipantNumber: '',
      certificationType: '',
      certificationPassDate: '',
      educatorCertificateNumber: '',
      certificateIssueDate: '',
      lptkName: '',
      // Informasi Tunjangan
      tpgRecipientStatus: '',
      tpgStartYear: undefined,
      tpgAmount: undefined,
      tfgRecipientStatus: '',
      tfgStartYear: undefined,
      tfgAmount: undefined,
      // Penghargaan dan Pelatihan
      hasReceivedAward: false,
      highestAward: '',
      awardField: '',
      awardLevel: '',
      awardYear: undefined,
      competencyTraining: '',
      trainingParticipation1: '',
      trainingYear1: undefined,
      trainingParticipation2: '',
      trainingYear2: undefined,
      trainingParticipation3: '',
      trainingYear3: undefined,
      trainingParticipation4: '',
      trainingYear4: undefined,
      trainingParticipation5: '',
      trainingYear5: undefined,
      // Kompetensi Kepala Madrasah
      personalityCompetency: undefined,
      managerialCompetency: undefined,
      entrepreneurshipCompetency: undefined,
      supervisionCompetency: undefined,
      socialCompetency: undefined,
    });
    setSelectedTeacher(null);
    setFormErrors({});
    setActiveTab('basic');
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
      isMainTenant: teacher.isMainTenant ?? false,
      positionId: teacher.positionId,
      // Data Pribadi Tambahan
      pageId: teacher.pageId || '',
      npk: teacher.npk || '',
      motherName: teacher.motherName || '',
      // Detail Alamat
      province: teacher.province || '',
      cityDistrict: teacher.cityDistrict || '',
      subDistrict: teacher.subDistrict || '',
      village: teacher.village || '',
      postalCode: teacher.postalCode || '',
      // Data Pendidikan
      educationLevel: teacher.educationLevel || '',
      studyProgramGroup: teacher.studyProgramGroup || '',
      // Status Kepegawaian
      employmentStatusPtk: teacher.employmentStatusPtk || '',
      employmentStatus: teacher.employmentStatus || '',
      employmentRank: teacher.employmentRank || '',
      tmtSkCpns: teacher.tmtSkCpns || '',
      tmtSkAwal: teacher.tmtSkAwal || '',
      tmtSkTerakhir: teacher.tmtSkTerakhir || '',
      appointingInstitution: teacher.appointingInstitution || '',
      assignmentStatus: teacher.assignmentStatus || '',
      baseSalary: teacher.baseSalary,
      workLocationStatus: teacher.workLocationStatus || '',
      satminkalType: teacher.satminkalType || '',
      satminkalNpsn: teacher.satminkalNpsn || '',
      satminkalIdentity: teacher.satminkalIdentity || '',
      inpassingStatus: teacher.inpassingStatus || '',
      tmtInpassing: teacher.tmtInpassing || '',
      // Tugas dan Mengajar
      mainDutyEducator: teacher.mainDutyEducator || '',
      additionalDuty: teacher.additionalDuty || '',
      mainDutySchool: teacher.mainDutySchool || '',
      mainSubject: teacher.mainSubject || '',
      totalTeachingHours: teacher.totalTeachingHours,
      dutyType: teacher.dutyType || '',
      teachingHoursEquivalent: teacher.teachingHoursEquivalent,
      teachOtherSchool: teacher.teachOtherSchool || false,
      otherWorkLocationType: teacher.otherWorkLocationType || '',
      otherWorkLocationNpsn: teacher.otherWorkLocationNpsn || '',
      otherSchoolSubject: teacher.otherSchoolSubject || '',
      otherSchoolHours: teacher.otherSchoolHours,
      // Informasi Sertifikasi
      certificationParticipationStatus: teacher.certificationParticipationStatus || '',
      certificationPassStatus: teacher.certificationPassStatus || '',
      certificationYear: teacher.certificationYear,
      certifiedSubject: teacher.certifiedSubject || '',
      nrg: teacher.nrg || '',
      nrgSkNumber: teacher.nrgSkNumber || '',
      nrgSkDate: teacher.nrgSkDate || '',
      certificationParticipantNumber: teacher.certificationParticipantNumber || '',
      certificationType: teacher.certificationType || '',
      certificationPassDate: teacher.certificationPassDate || '',
      educatorCertificateNumber: teacher.educatorCertificateNumber || '',
      certificateIssueDate: teacher.certificateIssueDate || '',
      lptkName: teacher.lptkName || '',
      // Informasi Tunjangan
      tpgRecipientStatus: teacher.tpgRecipientStatus || '',
      tpgStartYear: teacher.tpgStartYear,
      tpgAmount: teacher.tpgAmount,
      tfgRecipientStatus: teacher.tfgRecipientStatus || '',
      tfgStartYear: teacher.tfgStartYear,
      tfgAmount: teacher.tfgAmount,
      // Penghargaan dan Pelatihan
      hasReceivedAward: teacher.hasReceivedAward || false,
      highestAward: teacher.highestAward || '',
      awardField: teacher.awardField || '',
      awardLevel: teacher.awardLevel || '',
      awardYear: teacher.awardYear,
      competencyTraining: teacher.competencyTraining || '',
      trainingParticipation1: teacher.trainingParticipation1 || '',
      trainingYear1: teacher.trainingYear1,
      trainingParticipation2: teacher.trainingParticipation2 || '',
      trainingYear2: teacher.trainingYear2,
      trainingParticipation3: teacher.trainingParticipation3 || '',
      trainingYear3: teacher.trainingYear3,
      trainingParticipation4: teacher.trainingParticipation4 || '',
      trainingYear4: teacher.trainingYear4,
      trainingParticipation5: teacher.trainingParticipation5 || '',
      trainingYear5: teacher.trainingYear5,
      // Kompetensi Kepala Madrasah
      personalityCompetency: teacher.personalityCompetency,
      managerialCompetency: teacher.managerialCompetency,
      entrepreneurshipCompetency: teacher.entrepreneurshipCompetency,
      supervisionCompetency: teacher.supervisionCompetency,
      socialCompetency: teacher.socialCompetency,
    });
    setIsModalOpen(true);
    setActiveTab('basic');
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
                        <p className="text-sm font-semibold text-gray-700 mb-2">Data Pribadi Tambahan</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page ID</label>
                            <input
                              type="text"
                              value={formData.pageId}
                              onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NPK</label>
                            <input
                              type="text"
                              value={formData.npk}
                              onChange={(e) => setFormData({ ...formData, npk: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu Kandung</label>
                            <input
                              type="text"
                              value={formData.motherName}
                              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
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

                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Detail Alamat</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <input
                              type="text"
                              value={formData.province}
                              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                            <input
                              type="text"
                              value={formData.cityDistrict}
                              onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                            <input
                              type="text"
                              value={formData.subDistrict}
                              onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desa/Kelurahan</label>
                            <input
                              type="text"
                              value={formData.village}
                              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                            <input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Data Pendidikan Tambahan</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Pendidikan</label>
                            <input
                              type="text"
                              value={formData.educationLevel}
                              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok Program Studi</label>
                            <input
                              type="text"
                              value={formData.studyProgramGroup}
                              onChange={(e) => setFormData({ ...formData, studyProgramGroup: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Status Kepegawaian</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status PTK</label>
                            <input
                              type="text"
                              value={formData.employmentStatusPtk}
                              onChange={(e) => setFormData({ ...formData, employmentStatusPtk: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepegawaian</label>
                            <input
                              type="text"
                              value={formData.employmentStatus}
                              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Golongan / Pangkat</label>
                            <input
                              type="text"
                              value={formData.employmentRank}
                              onChange={(e) => setFormData({ ...formData, employmentRank: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instansi Pengangkat</label>
                            <input
                              type="text"
                              value={formData.appointingInstitution}
                              onChange={(e) => setFormData({ ...formData, appointingInstitution: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Penugasan</label>
                            <input
                              type="text"
                              value={formData.assignmentStatus}
                              onChange={(e) => setFormData({ ...formData, assignmentStatus: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok (Rp)</label>
                            <input
                              type="number"
                              value={formData.baseSalary ?? ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  baseSalary: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TMT SK CPNS</label>
                            <input
                              type="date"
                              value={formData.tmtSkCpns}
                              onChange={(e) => setFormData({ ...formData, tmtSkCpns: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TMT SK Awal</label>
                            <input
                              type="date"
                              value={formData.tmtSkAwal}
                              onChange={(e) => setFormData({ ...formData, tmtSkAwal: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TMT SK Terakhir</label>
                            <input
                              type="date"
                              value={formData.tmtSkTerakhir}
                              onChange={(e) => setFormData({ ...formData, tmtSkTerakhir: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Tempat Tugas</label>
                            <input
                              type="text"
                              value={formData.workLocationStatus}
                              onChange={(e) => setFormData({ ...formData, workLocationStatus: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Informasi Satminkal & Inpassing</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Satminkal</label>
                        <input
                          type="text"
                          value={formData.satminkalType}
                          onChange={(e) => setFormData({ ...formData, satminkalType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NPSN Satminkal</label>
                        <input
                          type="text"
                          value={formData.satminkalNpsn}
                          onChange={(e) => setFormData({ ...formData, satminkalNpsn: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Identitas Satminkal</label>
                        <input
                          type="text"
                          value={formData.satminkalIdentity}
                          onChange={(e) => setFormData({ ...formData, satminkalIdentity: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Inpassing</label>
                        <input
                          type="text"
                          value={formData.inpassingStatus}
                          onChange={(e) => setFormData({ ...formData, inpassingStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TMT Inpassing</label>
                        <input
                          type="date"
                          value={formData.tmtInpassing}
                          onChange={(e) => setFormData({ ...formData, tmtInpassing: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Tugas dan Mengajar</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tugas Utama (Pendidik)</label>
                            <input
                              type="text"
                              value={formData.mainDutyEducator}
                              onChange={(e) => setFormData({ ...formData, mainDutyEducator: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tugas Tambahan</label>
                            <input
                              type="text"
                              value={formData.additionalDuty}
                              onChange={(e) => setFormData({ ...formData, additionalDuty: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tugas Utama di Madrasah</label>
                            <input
                              type="text"
                              value={formData.mainDutySchool}
                              onChange={(e) => setFormData({ ...formData, mainDutySchool: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mapel Utama</label>
                            <input
                              type="text"
                              value={formData.mainSubject}
                              onChange={(e) => setFormData({ ...formData, mainSubject: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Jam Tatap Muka/Minggu</label>
                            <input
                              type="number"
                              value={formData.totalTeachingHours ?? ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  totalTeachingHours: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Tugas</label>
                            <input
                              type="text"
                              value={formData.dutyType}
                              onChange={(e) => setFormData({ ...formData, dutyType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ekuivalensi Jam Tatap Muka</label>
                            <input
                              type="number"
                              value={formData.teachingHoursEquivalent ?? ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  teachingHoursEquivalent: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Mengajar di Sekolah Lain?</label>
                            <div className="flex items-center space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="h-4 w-4 text-blue-600 border-gray-300"
                                  checked={formData.teachOtherSchool === true}
                                  onChange={() => setFormData({ ...formData, teachOtherSchool: true })}
                                />
                                <span className="ml-2 text-sm text-gray-700">Ya</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="h-4 w-4 text-blue-600 border-gray-300"
                                  checked={formData.teachOtherSchool === false}
                                  onChange={() => setFormData({ ...formData, teachOtherSchool: false })}
                                />
                                <span className="ml-2 text-sm text-gray-700">Tidak</span>
                              </label>
                            </div>
                          </div>
                          {formData.teachOtherSchool && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Tempat Tugas Lain</label>
                                <input
                                  type="text"
                                  value={formData.otherWorkLocationType}
                                  onChange={(e) => setFormData({ ...formData, otherWorkLocationType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NPSN Tempat Tugas Lain</label>
                                <input
                                  type="text"
                                  value={formData.otherWorkLocationNpsn}
                                  onChange={(e) => setFormData({ ...formData, otherWorkLocationNpsn: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mapel di Sekolah Lain</label>
                                <input
                                  type="text"
                                  value={formData.otherSchoolSubject}
                                  onChange={(e) => setFormData({ ...formData, otherSchoolSubject: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tatap Muka/Minggu (Sekolah Lain)</label>
                                <input
                                  type="number"
                                  value={formData.otherSchoolHours ?? ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      otherSchoolHours: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Informasi Sertifikasi</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepesertaan</label>
                        <input
                          type="text"
                          value={formData.certificationParticipationStatus}
                          onChange={(e) =>
                            setFormData({ ...formData, certificationParticipationStatus: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Kelulusan</label>
                        <input
                          type="text"
                          value={formData.certificationPassStatus}
                          onChange={(e) => setFormData({ ...formData, certificationPassStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Sertifikasi</label>
                        <input
                          type="number"
                          value={formData.certificationYear ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              certificationYear: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mapel Disertifikasi</label>
                        <input
                          type="text"
                          value={formData.certifiedSubject}
                          onChange={(e) => setFormData({ ...formData, certifiedSubject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NRG</label>
                        <input
                          type="text"
                          value={formData.nrg}
                          onChange={(e) => setFormData({ ...formData, nrg: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SK NRG</label>
                        <input
                          type="text"
                          value={formData.nrgSkNumber}
                          onChange={(e) => setFormData({ ...formData, nrgSkNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal SK NRG</label>
                        <input
                          type="date"
                          value={formData.nrgSkDate}
                          onChange={(e) => setFormData({ ...formData, nrgSkDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Peserta</label>
                        <input
                          type="text"
                          value={formData.certificationParticipantNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, certificationParticipantNumber: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis/Jalur Sertifikasi</label>
                        <input
                          type="text"
                          value={formData.certificationType}
                          onChange={(e) => setFormData({ ...formData, certificationType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kelulusan</label>
                        <input
                          type="date"
                          value={formData.certificationPassDate}
                          onChange={(e) => setFormData({ ...formData, certificationPassDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Sertifikat Pendidik</label>
                        <input
                          type="text"
                          value={formData.educatorCertificateNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, educatorCertificateNumber: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Sertifikat</label>
                        <input
                          type="date"
                          value={formData.certificateIssueDate}
                          onChange={(e) => setFormData({ ...formData, certificateIssueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama LPTK</label>
                        <input
                          type="text"
                          value={formData.lptkName}
                          onChange={(e) => setFormData({ ...formData, lptkName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Informasi Tunjangan</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Penerima TPG</label>
                        <input
                          type="text"
                          value={formData.tpgRecipientStatus}
                          onChange={(e) => setFormData({ ...formData, tpgRecipientStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Tahun Menerima TPG</label>
                        <input
                          type="number"
                          value={formData.tpgStartYear ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tpgStartYear: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Besaran TPG per Bulan (Rp)</label>
                        <input
                          type="number"
                          value={formData.tpgAmount ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tpgAmount: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Penerima TFG</label>
                        <input
                          type="text"
                          value={formData.tfgRecipientStatus}
                          onChange={(e) => setFormData({ ...formData, tfgRecipientStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Tahun Menerima TFG</label>
                        <input
                          type="number"
                          value={formData.tfgStartYear ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tfgStartYear: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Besaran TFG per Bulan (Rp)</label>
                        <input
                          type="number"
                          value={formData.tfgAmount ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tfgAmount: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Penghargaan & Pelatihan</p>
                    <div className="space-y-4 border border-dashed border-gray-200 rounded-xl p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pernah menerima penghargaan?</label>
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 border-gray-300"
                              checked={formData.hasReceivedAward === true}
                              onChange={() => setFormData({ ...formData, hasReceivedAward: true })}
                            />
                            <span className="ml-2 text-sm text-gray-700">Ya</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 border-gray-300"
                              checked={formData.hasReceivedAward === false}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  hasReceivedAward: false,
                                  highestAward: '',
                                  awardField: '',
                                  awardLevel: '',
                                  awardYear: undefined,
                                })
                              }
                            />
                            <span className="ml-2 text-sm text-gray-700">Tidak</span>
                          </label>
                        </div>
                      </div>

                      {formData.hasReceivedAward && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penghargaan Tertinggi</label>
                            <input
                              type="text"
                              value={formData.highestAward}
                              onChange={(e) => setFormData({ ...formData, highestAward: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Penghargaan</label>
                            <input
                              type="text"
                              value={formData.awardField}
                              onChange={(e) => setFormData({ ...formData, awardField: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Penghargaan</label>
                            <input
                              type="text"
                              value={formData.awardLevel}
                              onChange={(e) => setFormData({ ...formData, awardLevel: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Penghargaan</label>
                            <input
                              type="number"
                              value={formData.awardYear ?? ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  awardYear: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pelatihan Peningkatan Kompetensi (khusus kepala madrasah)</label>
                        <textarea
                          value={formData.competencyTraining}
                          onChange={(e) => setFormData({ ...formData, competencyTraining: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Riwayat Keikutsertaan Pelatihan</p>
                        {TRAINING_FIELD_CONFIGS.map(({ participationKey, yearKey, label }) => (
                          <div key={participationKey} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                              <input
                                type="text"
                                value={(formData as Record<string, any>)[participationKey] || ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [participationKey]: e.target.value,
                                  } as TeacherCreateData)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelatihan</label>
                              <input
                                type="number"
                                value={(formData as Record<string, any>)[yearKey] ?? ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [yearKey]: e.target.value ? Number(e.target.value) : undefined,
                                  } as TeacherCreateData)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Kompetensi Kepala Madrasah (Opsional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Kepribadian</label>
                        <input
                          type="number"
                          value={formData.personalityCompetency ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personalityCompetency: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Manajerial</label>
                        <input
                          type="number"
                          value={formData.managerialCompetency ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              managerialCompetency: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Kewirausahaan</label>
                        <input
                          type="number"
                          value={formData.entrepreneurshipCompetency ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              entrepreneurshipCompetency: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Supervisi</label>
                        <input
                          type="number"
                          value={formData.supervisionCompetency ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supervisionCompetency: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Sosial</label>
                        <input
                          type="number"
                          value={formData.socialCompetency ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialCompetency: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                        <select
                          value={formData.positionId || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              positionId: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih Jabatan</option>
                          {positionsData
                            ?.filter((p) => p.isActive)
                            .map((position) => (
                              <option key={position.id} value={position.id}>
                                {position.name}
                              </option>
                            ))}
                        </select>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Tenant</label>
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 border-gray-300"
                              checked={formData.isMainTenant === true}
                              onChange={() => setFormData({ ...formData, isMainTenant: true })}
                            />
                            <span className="ml-2 text-sm text-gray-700">Tenant Induk</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 border-gray-300"
                              checked={formData.isMainTenant === false}
                              onChange={() => setFormData({ ...formData, isMainTenant: false })}
                            />
                            <span className="ml-2 text-sm text-gray-700">Tenant Cabang</span>
                          </label>
                        </div>
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
                  {selectedTeacher ? (
                    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                      {/* 🧍 Data Pribadi Guru */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">🧍</span>
                          Data Pribadi Guru
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Nama Lengkap Personal" value={selectedTeacher.name} />
                          <DetailField label="NUPTK" value={selectedTeacher.nuptk} />
                          <DetailField label="Page ID" value={selectedTeacher.pageId} />
                          <DetailField label="NPK" value={selectedTeacher.npk} />
                          <DetailField label="Jenis Tenant" value={selectedTeacher.isMainTenant ? 'Tenant Induk' : 'Tenant Cabang'} />
                          <DetailField label="NIK / No. KTP" value={selectedTeacher.nik} />
                          <DetailField label="Tempat Lahir" value={selectedTeacher.birthPlace} />
                          <DetailField label="Tanggal Lahir (dd/mm/yyyy)" value={formatDate(selectedTeacher.birthDate)} />
                          <DetailField 
                            label="Jenis Kelamin" 
                            value={selectedTeacher.gender === 'L' ? 'Laki-laki' : selectedTeacher.gender === 'P' ? 'Perempuan' : selectedTeacher.gender} 
                          />
                          <DetailField label="Nama Ibu Kandung" value={selectedTeacher.motherName} />
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-700">Alamat Rumah / Tempat Tinggal</p>
                          <DetailField label="" value={selectedTeacher.address} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <DetailField label="Provinsi" value={selectedTeacher.province} />
                            <DetailField label="Kab./Kota" value={selectedTeacher.cityDistrict} />
                            <DetailField label="Kecamatan" value={selectedTeacher.subDistrict} />
                            <DetailField label="Desa/Kelurahan" value={selectedTeacher.village} />
                            <DetailField label="Kode Pos" value={selectedTeacher.postalCode} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Email" value={selectedTeacher.email} />
                          <DetailField label="Nomor HP" value={selectedTeacher.phone} />
                        </div>
                      </section>

                      {/* 🎓 Data Pendidikan */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">🎓</span>
                          Data Pendidikan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Jenjang" value={selectedTeacher.educationLevel} />
                          <DetailField label="Kelompok Program Studi" value={selectedTeacher.studyProgramGroup} />
                          <DetailField label="Pendidikan Terakhir" value={selectedTeacher.education} />
                        </div>
                      </section>

                      {/* 💼 Status Kepegawaian */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">💼</span>
                          Status Kepegawaian
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Status Kepegawaian Personal/PTK" value={selectedTeacher.employmentStatusPtk} />
                          <DetailField label="Status Kepegawaian (PNS / Non-PNS)" value={selectedTeacher.employmentStatus} />
                          <DetailField label="Golongan" value={selectedTeacher.employmentRank} />
                          <DetailField label="TMT SK CPNS" value={formatDate(selectedTeacher.tmtSkCpns)} />
                          <DetailField label="TMT SK Awal" value={formatDate(selectedTeacher.tmtSkAwal)} />
                          <DetailField label="TMT SK Terakhir" value={formatDate(selectedTeacher.tmtSkTerakhir)} />
                          <DetailField label="Instansi yang Mengangkat" value={selectedTeacher.appointingInstitution} />
                          <DetailField label="Status Penugasan" value={selectedTeacher.assignmentStatus} />
                          <DetailField label="Gaji Pokok per Bulan (Rp)" value={formatCurrencyIdr(selectedTeacher.baseSalary)} />
                          <DetailField label="Status Tempat Tugas" value={selectedTeacher.workLocationStatus} />
                          <DetailField label="Jenis Satminkal" value={selectedTeacher.satminkalType} />
                          <DetailField label="NPSN Satminkal" value={selectedTeacher.satminkalNpsn} />
                          <DetailField label="Identitas Satminkal" value={selectedTeacher.satminkalIdentity} />
                          <DetailField label="Status Inpassing" value={selectedTeacher.inpassingStatus} />
                          <DetailField label="TMT Inpassing" value={formatDate(selectedTeacher.tmtInpassing)} />
                        </div>
                      </section>

                      {/* 📚 Tugas dan Mengajar */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">📚</span>
                          Tugas dan Mengajar
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Tugas Utama sebagai Pendidik" value={selectedTeacher.mainDutyEducator} />
                          <DetailField label="Tugas Tambahan di Madrasah Ini" value={selectedTeacher.additionalDuty} />
                          <DetailField label="Tugas Utama di Madrasah Ini" value={selectedTeacher.mainDutySchool} />
                          <DetailField 
                            label="Status Keaktifan Personal" 
                            value={
                              <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${
                                selectedTeacher.isActive 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {selectedTeacher.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            } 
                          />
                          <DetailField label="Mapel Utama yang Diampu" value={selectedTeacher.mainSubject} />
                          <DetailField label="Total Jam Tatap Muka/Minggu" value={selectedTeacher.totalTeachingHours ? `${selectedTeacher.totalTeachingHours} jam` : '-'} />
                          <DetailField label="Jenis Tugas" value={selectedTeacher.dutyType} />
                          <DetailField label="Ekuivalensi Jam Tatap Muka" value={selectedTeacher.teachingHoursEquivalent ? `${selectedTeacher.teachingHoursEquivalent} jam` : '-'} />
                          <DetailField 
                            label="Tugas Mengajar di Satuan Pendidikan Lain (di luar Madrasah Ini)" 
                            value={selectedTeacher.teachOtherSchool ? 'Ya' : 'Tidak'} 
                          />
                          {selectedTeacher.teachOtherSchool && (
                            <>
                              <DetailField label="Jenis Tempat Tugas Lain" value={selectedTeacher.otherWorkLocationType} />
                              <DetailField label="NPSN Tempat Tugas Lain" value={selectedTeacher.otherWorkLocationNpsn} />
                              <DetailField label="Mapel yang Diampu (di luar Madrasah)" value={selectedTeacher.otherSchoolSubject} />
                              <DetailField label="Jam Tatap Muka/Minggu (di luar Madrasah)" value={selectedTeacher.otherSchoolHours ? `${selectedTeacher.otherSchoolHours} jam` : '-'} />
                            </>
                          )}
                        </div>
                      </section>

                      {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                        <section className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-xl" aria-hidden="true">📚</span>
                            Mata Pelajaran
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.subjects.map((subject) => (
                              <span key={subject.id} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedTeacher.classRooms && selectedTeacher.classRooms.length > 0 && (
                        <section className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-xl" aria-hidden="true">🏫</span>
                            Kelas yang Diampu
                          </h4>
                          <div className="space-y-3">
                            {selectedTeacher.classRooms.map((classRoom) => (
                              <div key={classRoom.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-purple-900">{classRoom.name}</h5>
                                  {classRoom.isActive !== undefined && (
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                                      classRoom.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {classRoom.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  {classRoom.level && (
                                    <DetailField label="Tingkat" value={classRoom.level} />
                                  )}
                                  {classRoom.roomNumber && (
                                    <DetailField label="Nomor Ruang" value={classRoom.roomNumber} />
                                  )}
                                  {classRoom.capacity && (
                                    <DetailField label="Kapasitas" value={`${classRoom.capacity} siswa`} />
                                  )}
                                  {classRoom.academicYear && (
                                    <DetailField label="Tahun Ajaran" value={classRoom.academicYear} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedTeacher.schedules && selectedTeacher.schedules.length > 0 && (
                        <section className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-xl" aria-hidden="true">📅</span>
                            Jadwal Mengajar
                          </h4>
                          <div className="space-y-3">
                            {selectedTeacher.schedules.map((schedule) => {
                              const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                              const dayName = days[schedule.dayOfWeek] || `Hari ${schedule.dayOfWeek}`;
                              return (
                                <div key={schedule.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <span className="px-3 py-1 text-sm font-bold text-white bg-blue-600 rounded-lg min-w-[90px] text-center">
                                        {dayName}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-700">
                                        {schedule.startTime} - {schedule.endTime}
                                      </span>
                                    </div>
                                    {schedule.isActive !== undefined && (
                                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        schedule.isActive 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {schedule.isActive ? 'Aktif' : 'Tidak Aktif'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    {schedule.classRoom && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Kelas:</span>
                                        <span className="font-medium text-gray-900">
                                          {schedule.classRoom.name}
                                          {schedule.classRoom.level && ` (${schedule.classRoom.level})`}
                                        </span>
                                      </div>
                                    )}
                                    {schedule.subject && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Mata Pelajaran:</span>
                                        <span className="font-medium text-gray-900">
                                          {schedule.subject.name}
                                          {schedule.subject.code && ` (${schedule.subject.code})`}
                                        </span>
                                      </div>
                                    )}
                                    {schedule.room && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Ruang:</span>
                                        <span className="font-medium text-gray-900">{schedule.room}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {/* 🧾 Informasi Sertifikasi */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">🧾</span>
                          Informasi Sertifikasi
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Status Kepesertaan" value={selectedTeacher.certificationParticipationStatus} />
                          <DetailField label="Status Kelulusan" value={selectedTeacher.certificationPassStatus} />
                          <DetailField label="Tahun Lulus" value={selectedTeacher.certificationYear} />
                          <DetailField label="Mapel yang Disertifikasi" value={selectedTeacher.certifiedSubject} />
                          <DetailField label="NRG" value={selectedTeacher.nrg} />
                          <DetailField label="Nomor SK NRG" value={selectedTeacher.nrgSkNumber} />
                          <DetailField label="Tanggal SK NRG" value={formatDate(selectedTeacher.nrgSkDate)} />
                          <DetailField label="Nomor Peserta Sertifikasi" value={selectedTeacher.certificationParticipantNumber} />
                          <DetailField label="Jenis / Jalur Sertifikasi" value={selectedTeacher.certificationType} />
                          <DetailField label="Tanggal Kelulusan Sertifikasi" value={formatDate(selectedTeacher.certificationPassDate)} />
                          <DetailField label="Nomor Sertifikat Pendidik" value={selectedTeacher.educatorCertificateNumber} />
                          <DetailField label="Tanggal Penerbitan Sertifikat" value={formatDate(selectedTeacher.certificateIssueDate)} />
                          <DetailField label="Nama LPTK" value={selectedTeacher.lptkName} />
                        </div>
                      </section>

                      {/* 💰 Informasi Tunjangan */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">💰</span>
                          Informasi Tunjangan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="Status Penerima TPG" value={selectedTeacher.tpgRecipientStatus} />
                          <DetailField label="Menerima TPG Mulai Tahun" value={selectedTeacher.tpgStartYear} />
                          <DetailField label="Besarnya TPG per Bulan (Rp)" value={formatCurrencyIdr(selectedTeacher.tpgAmount)} />
                          <DetailField label="Status Penerima TFG" value={selectedTeacher.tfgRecipientStatus} />
                          <DetailField label="Menerima TFG Mulai Tahun" value={selectedTeacher.tfgStartYear} />
                          <DetailField label="Besarnya TFG per Bulan (Rp)" value={formatCurrencyIdr(selectedTeacher.tfgAmount)} />
                        </div>
                      </section>

                      {/* 🏅 Penghargaan dan Pelatihan */}
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">🏅</span>
                          Penghargaan dan Pelatihan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField 
                            label="Apakah Pernah Memperoleh Penghargaan?" 
                            value={selectedTeacher.hasReceivedAward ? 'Ya' : 'Tidak'} 
                          />
                          {selectedTeacher.hasReceivedAward && (
                            <>
                              <DetailField label="Penghargaan Tertinggi yang Pernah Diperoleh (Khusus Pendidik)" value={selectedTeacher.highestAward} />
                              <DetailField label="Bidang Penghargaan" value={selectedTeacher.awardField} />
                              <DetailField label="Tingkat Penghargaan" value={selectedTeacher.awardLevel} />
                              <DetailField label="Tahun Perolehan Penghargaan" value={selectedTeacher.awardYear} />
                            </>
                          )}
                          <DetailField 
                            label="Pelatihan Peningkatan Kompetensi yang Pernah Diikuti oleh Kepala Madrasah (khusus Kepala Madrasah)" 
                            value={selectedTeacher.competencyTraining} 
                          />
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-sm font-semibold text-gray-700">Keikutsertaan Pelatihan</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedTeacher.trainingParticipation1 && (
                              <DetailField label="Keikutsertaan Pelatihan (1)" value={`${selectedTeacher.trainingParticipation1}${selectedTeacher.trainingYear1 ? ` - Tahun ${selectedTeacher.trainingYear1}` : ''}`} />
                            )}
                            {selectedTeacher.trainingParticipation2 && (
                              <DetailField label="Keikutsertaan Pelatihan (2)" value={`${selectedTeacher.trainingParticipation2}${selectedTeacher.trainingYear2 ? ` - Tahun ${selectedTeacher.trainingYear2}` : ''}`} />
                            )}
                            {selectedTeacher.trainingParticipation3 && (
                              <DetailField label="Keikutsertaan Pelatihan (3)" value={`${selectedTeacher.trainingParticipation3}${selectedTeacher.trainingYear3 ? ` - Tahun ${selectedTeacher.trainingYear3}` : ''}`} />
                            )}
                            {selectedTeacher.trainingParticipation4 && (
                              <DetailField label="Keikutsertaan Pelatihan (4)" value={`${selectedTeacher.trainingParticipation4}${selectedTeacher.trainingYear4 ? ` - Tahun ${selectedTeacher.trainingYear4}` : ''}`} />
                            )}
                            {selectedTeacher.trainingParticipation5 && (
                              <DetailField label="Keikutsertaan Pelatihan (5)" value={`${selectedTeacher.trainingParticipation5}${selectedTeacher.trainingYear5 ? ` - Tahun ${selectedTeacher.trainingYear5}` : ''}`} />
                            )}
                          </div>
                        </div>
                      </section>

                      {/* 🧠 Kompetensi Kepala Madrasah (Khusus) */}
                      {(selectedTeacher.personalityCompetency || selectedTeacher.managerialCompetency || selectedTeacher.entrepreneurshipCompetency || selectedTeacher.supervisionCompetency || selectedTeacher.socialCompetency) && (
                        <section className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-xl" aria-hidden="true">🧠</span>
                            Kompetensi Kepala Madrasah (Khusus)
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailField label="Kompetensi Kepribadian" value={selectedTeacher.personalityCompetency ? `${selectedTeacher.personalityCompetency}` : '-'} />
                            <DetailField label="Kompetensi Manajerial" value={selectedTeacher.managerialCompetency ? `${selectedTeacher.managerialCompetency}` : '-'} />
                            <DetailField label="Kompetensi Kewirausahaan" value={selectedTeacher.entrepreneurshipCompetency ? `${selectedTeacher.entrepreneurshipCompetency}` : '-'} />
                            <DetailField label="Kompetensi Supervisi" value={selectedTeacher.supervisionCompetency ? `${selectedTeacher.supervisionCompetency}` : '-'} />
                            <DetailField label="Kompetensi Sosial" value={selectedTeacher.socialCompetency ? `${selectedTeacher.socialCompetency}` : '-'} />
                          </div>
                        </section>
                      )}

                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">📋</span>
                          Informasi Sistem
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailField label="ID Instansi" value={selectedTeacher.instansiId} />
                          <DetailField 
                            label="Tanggal Dibuat" 
                            value={formatDate(selectedTeacher.createdAt || selectedTeacher.created_at)} 
                          />
                          <DetailField 
                            label="Tanggal Diupdate" 
                            value={formatDate(selectedTeacher.updatedAt || selectedTeacher.updated_at)} 
                          />
                        </div>
                      </section>
                    </div>
                  ) : (
                    <p className="text-center text-gray-600">Data guru tidak ditemukan.</p>
                  )}

                  <div className="flex justify-end gap-2 pt-6">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedTeacher(null);
                      }}
                    >
                      Tutup
                    </Button>
                    {selectedTeacher && (
                      <Button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          handleEdit(selectedTeacher);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
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

