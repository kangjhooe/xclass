'use client';

import { useMemo, useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  subjectsApi,
  Subject,
  SubjectCreateData,
  SubjectDashboard,
  SubjectOverview,
  CurriculumType,
  SubjectFilterParams,
} from '@/lib/api/subjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

const curriculumOptions: Array<{ value: '' | CurriculumType; label: string }> = [
  { value: '', label: 'Semua Kurikulum' },
  { value: 'K13', label: 'Kurikulum 2013 (K13)' },
  { value: 'Merdeka', label: 'Kurikulum Merdeka' },
  { value: 'Mandiri', label: 'Kurikulum Mandiri' },
  { value: 'Kurikulum 2013', label: 'Kurikulum 2013 (Revisi)' },
];

type StatusFilter = 'all' | 'active' | 'inactive';
type TypeFilter = 'all' | 'mandatory' | 'elective';

type FilterState = {
  search: string;
  level: string;
  grade: string;
  curriculumType: '' | CurriculumType;
  isActive: StatusFilter;
  type: TypeFilter;
  teacherId: string;
};

const defaultFilters: FilterState = {
  search: '',
  level: '',
  grade: '',
  curriculumType: '',
  isActive: 'all',
  type: 'all',
  teacherId: '',
};

const defaultForm: SubjectCreateData = {
  name: '',
  code: '',
  description: '',
  level: '',
  grade: '',
  semester: undefined,
  department: '',
  category: '',
  learningFocus: '',
  curriculumType: undefined,
  hoursPerWeek: undefined,
  order: undefined,
  minimumPassingScore: 75,
  isMandatory: true,
  isElective: false,
  isActive: true,
  color: '#0ea5e9',
};

export default function SubjectsPage() {
  const tenantId = useTenantId();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardSubjectId, setDashboardSubjectId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectCreateData>(defaultForm);

  const queryClient = useQueryClient();

  const mapFiltersToParams = (filterState: FilterState): SubjectFilterParams | undefined => {
    const params: SubjectFilterParams = {};
    if (filterState.search.trim()) params.search = filterState.search.trim();
    if (filterState.level.trim()) params.level = filterState.level.trim();
    if (filterState.grade.trim()) params.grade = filterState.grade.trim();
    if (filterState.curriculumType) params.curriculumType = filterState.curriculumType;
    if (filterState.isActive !== 'all') params.isActive = filterState.isActive === 'active';
    if (filterState.type === 'mandatory') params.isMandatory = true;
    if (filterState.type === 'elective') params.isElective = true;
    if (filterState.teacherId.trim()) {
      const teacherIdNumber = Number(filterState.teacherId);
      if (!Number.isNaN(teacherIdNumber)) {
        params.teacherId = teacherIdNumber;
      }
    }
    return Object.keys(params).length ? params : undefined;
  };

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', tenantId, filters],
    queryFn: () => subjectsApi.getAll(tenantId!, mapFiltersToParams(filters)),
    enabled: !!tenantId,
  });

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['subjects-overview', tenantId],
    queryFn: () => subjectsApi.getOverview(tenantId!),
    enabled: !!tenantId,
  });

  const { data: dashboardData, isFetching: dashboardLoading } = useQuery<{ data: SubjectDashboard } | SubjectDashboard>({
    queryKey: ['subject-dashboard', tenantId, dashboardSubjectId],
    queryFn: () => subjectsApi.getDashboard(tenantId!, dashboardSubjectId!),
    enabled: !!tenantId && dashboardSubjectId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (payload: SubjectCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.create(tenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['subjects-overview', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SubjectCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.update(tenantId, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['subjects-overview', tenantId] });
      setIsModalOpen(false);
      setSelectedSubject(null);
      resetForm();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { isActive?: boolean; isMandatory?: boolean; isElective?: boolean } }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.updateStatus(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['subjects-overview', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return subjectsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['subjects-overview', tenantId] });
    },
  });

  const subjects = subjectsData?.data ?? [];
  const statsOverview: SubjectOverview | null = (overviewData as SubjectOverview) ?? null;

  const moduleStats = useMemo(() => {
    if (!statsOverview) {
      return [
        {
          label: 'Total Mata Pelajaran',
          value: subjects.length,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
        },
        {
          label: 'Aktif',
          value: subjects.filter((s) => s.isActive).length,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: 'Tidak Aktif',
          value: subjects.filter((s) => !s.isActive).length,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          ),
        },
      ];
    }

    return [
      {
        label: 'Total Mata Pelajaran',
        value: statsOverview.totalSubjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
      },
      {
        label: 'Mata Pelajaran Aktif',
        value: statsOverview.activeSubjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        footer: (
          <span className="text-green-600 font-medium">
            {statsOverview.totalSubjects
              ? ((statsOverview.activeSubjects / statsOverview.totalSubjects) * 100).toFixed(1)
              : '0.0'}
            % aktif
          </span>
        ),
      },
      {
        label: 'Wajib vs Pilihan',
        value: statsOverview.mandatorySubjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4v6l9 4 9-4V7" />
          </svg>
        ),
        footer: (
          <span className="text-cyan-600 font-medium">
            {statsOverview.electiveSubjects} mata pelajaran pilihan
          </span>
        ),
      },
    ];
  }, [statsOverview, subjects]);

  const resetForm = () => {
    setFormData(defaultForm);
    setSelectedSubject(null);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      level: subject.level || '',
      grade: subject.grade || '',
      semester: subject.semester,
      department: subject.department || '',
      category: subject.category || '',
      learningFocus: subject.learningFocus || '',
      curriculumType: subject.curriculumType,
      hoursPerWeek: subject.hoursPerWeek,
      order: subject.order,
      minimumPassingScore: subject.minimumPassingScore ?? 75,
      isMandatory: subject.isMandatory ?? true,
      isElective: subject.isElective ?? false,
      isActive: subject.isActive ?? true,
      color: subject.color || '#0ea5e9',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    const payload: SubjectCreateData = {
      ...formData,
      hoursPerWeek: formData.hoursPerWeek ?? undefined,
      semester: formData.semester ?? undefined,
      order: formData.order ?? undefined,
      minimumPassingScore: formData.minimumPassingScore ?? undefined,
    };

    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (subject: Subject) => {
    updateStatusMutation.mutate({
      id: subject.id,
      data: { isActive: !subject.isActive },
    });
  };

  const handleTypeChange = (subject: Subject, type: 'mandatory' | 'elective') => {
    if (type === 'mandatory') {
      updateStatusMutation.mutate({
        id: subject.id,
        data: { isMandatory: true, isElective: false },
      });
    } else {
      updateStatusMutation.mutate({
        id: subject.id,
        data: { isMandatory: false, isElective: true },
      });
    }
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeDashboardModal = () => {
    setDashboardSubjectId(null);
  };

  const renderStatusChip = (subject: Subject) => (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors duration-200 ${
        subject.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      }`}
    >
      {subject.isActive ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );

  const renderTypeChip = (subject: Subject) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        subject.isMandatory ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
      }`}
    >
      {subject.isMandatory ? 'Wajib' : 'Pilihan'}
    </span>
  );

  const renderDashboardContent = () => {
    if (!dashboardSubjectId) return null;

    const dashboard = (dashboardData as SubjectDashboard) ?? null;

    if (dashboardLoading) {
      return (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-600">Memuat ringkasan mata pelajaran...</p>
        </div>
      );
    }

    if (!dashboard) {
      return <p className="text-gray-600">Data ringkasan tidak tersedia.</p>;
    }

    const { subject, metrics } = dashboard;

    return (
      <div className="space-y-6">
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-cyan-900">Informasi Mata Pelajaran</h3>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-cyan-900">
            <div>
              <p className="font-semibold">Nama</p>
              <p>{subject.name}</p>
            </div>
            <div>
              <p className="font-semibold">Kode</p>
              <p>{subject.code || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">Tingkat</p>
              <p>{subject.level || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">Kelas / Grade</p>
              <p>{subject.grade || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">Semester</p>
              <p>{subject.semester ?? '-'}</p>
            </div>
            <div>
              <p className="font-semibold">Kurikulum</p>
              <p>{subject.curriculumType || '-'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Silabus</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.totalSyllabi}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Guru</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.totalTeachers}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Jadwal Aktif</p>
            <p className="text-2xl font-semibold text-gray-900">
              {metrics.activeSchedules}/{metrics.totalSchedules}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Hari Pengajaran</h4>
          <div className="flex flex-wrap gap-2">
            {metrics.teachingDays.length > 0 ? (
              metrics.teachingDays.map((day) => (
                <span key={day} className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][day] ?? `Hari ${day}`}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Belum ada jadwal aktif.</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Kelas</h4>
          <div className="flex flex-wrap gap-2">
            {metrics.classes.length > 0 ? (
              metrics.classes.map((className) => (
                <span key={className} className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
                  {className}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Belum ada kelas terjadwal.</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="subjects"
        title="Data Mata Pelajaran"
        description="Kelola kurikulum dan mata pelajaran secara terstruktur"
        actions={({ themeConfig }) => (
          <div className="flex gap-2">
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
              Tambah Mata Pelajaran
            </Button>
          </div>
        )}
        stats={moduleStats}
      >
        {({ themeConfig }) => (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Cari</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Cari nama atau kode mata pelajaran"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Tingkat</label>
                    <input
                      type="text"
                      value={filters.level}
                      onChange={(e) => handleFilterChange('level', e.target.value)}
                      placeholder="Contoh: X, XI, XII"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Kelas / Grade</label>
                    <input
                      type="text"
                      value={filters.grade}
                      onChange={(e) => handleFilterChange('grade', e.target.value)}
                      placeholder="Contoh: 10, 11, 12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Kurikulum</label>
                    <select
                      value={filters.curriculumType}
                      onChange={(e) => handleFilterChange('curriculumType', e.target.value as FilterState['curriculumType'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {curriculumOptions.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => handleFilterChange('isActive', e.target.value as StatusFilter)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Jenis</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value as TypeFilter)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">Semua</option>
                      <option value="mandatory">Wajib</option>
                      <option value="elective">Pilihan</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={handleResetFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {(subjectsLoading || overviewLoading) && subjects.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kurikulum & Tingkat</TableHead>
                        <TableHead className="font-semibold text-gray-700">Jenis</TableHead>
                        <TableHead className="font-semibold text-gray-700">Jam/Minggu</TableHead>
                        <TableHead className="font-semibold text-gray-700">Skor Minimum</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id} className="hover:bg-cyan-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span
                                className="w-2 h-10 rounded-full"
                                style={{ background: subject.color || 'linear-gradient(to right, #06b6d4, #3b82f6)' }}
                              ></span>
                              <div>
                                <p className="font-semibold text-gray-900">{subject.name}</p>
                                <p className="text-xs text-gray-500">{subject.code || 'Tidak ada kode'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                              <span>{subject.curriculumType || '-'}</span>
                              <span>
                                Tingkat {subject.level || '-'} • Grade {subject.grade || '-'} • Semester {subject.semester ?? '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              {renderTypeChip(subject)}
                              <button
                                className="text-xs text-cyan-600 hover:underline text-left"
                                onClick={() => handleTypeChange(subject, subject.isMandatory ? 'elective' : 'mandatory')}
                              >
                                Tandai sebagai {subject.isMandatory ? 'pelajaran pilihan' : 'pelajaran wajib'}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>{subject.hoursPerWeek ?? '-'}</TableCell>
                          <TableCell>{subject.minimumPassingScore ?? '-'}</TableCell>
                          <TableCell>{renderStatusChip(subject)}</TableCell>
                          <TableCell>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(subject)}
                                className="hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleToggleActive(subject)}
                              >
                                {subject.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setDashboardSubjectId(subject.id)}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(subject.id)}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {subjects.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data mata pelajaran</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'} size="xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Mata Pelajaran <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                      <input
                        type="text"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: X, XI, XII"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Grade</label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: 10, 11, 12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <input
                        type="number"
                        value={formData.semester ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            semester: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={1}
                        max={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departemen / Jurusan</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: IPA, IPS, Bahasa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Wajib Nasional, Muatan Lokal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fokus Pembelajaran</label>
                      <input
                        type="text"
                        value={formData.learningFocus}
                        onChange={(e) => setFormData({ ...formData, learningFocus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Literasi, Numerasi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kurikulum</label>
                      <select
                        value={formData.curriculumType || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            curriculumType: (e.target.value as CurriculumType) || undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {curriculumOptions.map((option) => (
                          <option key={option.value || 'none'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jam per Minggu</label>
                      <input
                        type="number"
                        value={formData.hoursPerWeek ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hoursPerWeek: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
                      <input
                        type="number"
                        value={formData.order ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skor Minimum</label>
                      <input
                        type="number"
                        value={formData.minimumPassingScore ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minimumPassingScore: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warna Identitas</label>
                      <input
                        type="color"
                        value={formData.color || '#0ea5e9'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isMandatory ?? true}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isMandatory: e.target.checked,
                            isElective: e.target.checked ? false : prev.isElective,
                          }))
                        }
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      Pelajaran Wajib
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isElective ?? false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isElective: e.target.checked,
                            isMandatory: e.target.checked ? false : prev.isMandatory,
                          }))
                        }
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      Pelajaran Pilihan
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isActive ?? true}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createMutation.isPending || updateMutation.isPending}
                    className={themeConfig.primaryButton}
                  >
                    {selectedSubject ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>

            <Modal isOpen={dashboardSubjectId !== null} onClose={closeDashboardModal} title="Ringkasan Mata Pelajaran" size="lg">
              {renderDashboardContent()}
            </Modal>
          </div>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}


