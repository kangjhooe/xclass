'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  gradesApi,
  StudentGrade,
  StudentGradeCreateData,
  AssessmentType,
} from '@/lib/api/grades';
import { studentsApi } from '@/lib/api/students';
import { subjectsApi } from '@/lib/api/subjects';
import { classesApi } from '@/lib/api/classes';
import { competenciesApi } from '@/lib/api/competencies';
import { formatDate } from '@/lib/utils/date';
import { useTenantId } from '@/lib/hooks/useTenant';

const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  NH: 'Nilai Harian (NH)',
  PTS: 'Penilaian Tengah Semester (PTS)',
  PAS: 'Penilaian Akhir Semester (PAS)',
  PROJECT: 'Nilai Proyek',
  OTHER: 'Penilaian Lainnya',
};

type GradeFormState = {
  studentId: number;
  subjectId: number;
  score: number;
  assessmentType: AssessmentType;
  customAssessmentLabel: string;
  weightInput: string;
  description: string;
  date: string;
  competencyId?: number;
  learningOutcome: string;
};

const INITIAL_FORM_STATE: GradeFormState = {
  studentId: 0,
  subjectId: 0,
  score: 0,
  assessmentType: 'NH',
  customAssessmentLabel: '',
  weightInput: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  competencyId: undefined,
  learningOutcome: '',
};

export default function GradesPage() {
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<number | undefined>();
  const [filterSubjectId, setFilterSubjectId] = useState<number | undefined>();
  const [filterClassId, setFilterClassId] = useState<number | undefined>();
  const [filterAssessmentType, setFilterAssessmentType] = useState<'ALL' | AssessmentType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<GradeFormState>(INITIAL_FORM_STATE);

  const gradesQuery = useQuery({
    queryKey: [
      'grades',
      tenantId,
      filterStudentId,
      filterSubjectId,
      filterClassId,
      filterAssessmentType,
      searchTerm,
    ],
    queryFn: () =>
      gradesApi.getAll(tenantId!, {
        studentId: filterStudentId,
        subjectId: filterSubjectId,
        classId: filterClassId,
        assessmentType: filterAssessmentType === 'ALL' ? undefined : filterAssessmentType,
        search: searchTerm.trim() || undefined,
      }),
    enabled: !!tenantId,
  });

  const studentsQuery = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const subjectsQuery = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const classesQuery = useQuery({
    queryKey: ['classes', tenantId],
    queryFn: () => classesApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const competenciesQuery = useQuery({
    queryKey: ['competencies', tenantId],
    queryFn: () => competenciesApi.getAll(tenantId!, { type: 'IPK' }),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: StudentGradeCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return gradesApi.create(tenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StudentGradeCreateData> }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return gradesApi.update(tenantId, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return gradesApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', tenantId] });
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGrade(null);
    setFormData({ ...INITIAL_FORM_STATE, date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setFormData({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      score: Number(grade.score ?? 0),
      assessmentType: grade.assessmentType,
      customAssessmentLabel: grade.customAssessmentLabel || '',
      weightInput:
        grade.weight !== null && grade.weight !== undefined ? String(grade.weight) : '',
      description: grade.description || '',
      date: grade.date || new Date().toISOString().split('T')[0],
      competencyId: grade.competencyId ?? undefined,
      learningOutcome: grade.learningOutcome || '',
    });
    setIsModalOpen(true);
  };

  const buildPayload = (): StudentGradeCreateData | null => {
    if (!formData.studentId || !formData.subjectId) {
      alert('Siswa dan mata pelajaran wajib dipilih.');
      return null;
    }

    const weightValue =
      formData.weightInput.trim() === ''
        ? null
        : parseFloat(formData.weightInput.replace(',', '.'));

    if (weightValue !== null && (Number.isNaN(weightValue) || weightValue < 0 || weightValue > 100)) {
      alert('Bobot harus berupa angka antara 0 - 100.');
      return null;
    }

    const payload: StudentGradeCreateData = {
      studentId: formData.studentId,
      subjectId: formData.subjectId,
      score: Number(formData.score) || 0,
      assessmentType: formData.assessmentType,
      description: formData.description?.trim() || undefined,
      date: formData.date || undefined,
      weight: weightValue,
      competencyId: formData.competencyId ?? null,
      learningOutcome: formData.learningOutcome?.trim() || undefined,
    };

    if (formData.assessmentType === 'OTHER') {
      payload.customAssessmentLabel = formData.customAssessmentLabel?.trim() || undefined;
    }

    return payload;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload) return;

    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!tenantId) {
      alert('Tenant belum siap. Silakan coba kembali.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus penilaian ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!tenantId) return;

    try {
      const blob = await gradesApi.export(tenantId, format, {
        studentId: filterStudentId,
        subjectId: filterSubjectId,
        classId: filterClassId,
        assessmentType: filterAssessmentType === 'ALL' ? undefined : filterAssessmentType,
        search: searchTerm.trim() || undefined,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        format === 'pdf'
          ? 'penilaian-siswa.pdf'
          : format === 'csv'
          ? 'penilaian-siswa.csv'
          : 'penilaian-siswa.xlsx';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error', error);
      alert('Gagal mengekspor data. Silakan coba kembali.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 font-semibold';
    if (score >= 70) return 'text-blue-600 font-semibold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const assessmentOptions = useMemo(
    () =>
      Object.entries(ASSESSMENT_LABELS).map(([value, label]) => ({
        value: value as AssessmentType,
        label,
      })),
    [],
  );

  const totalGrades = gradesQuery.data?.data?.length || 0;
  const averageScore =
    gradesQuery.data?.data && gradesQuery.data.data.length > 0
      ? (
          gradesQuery.data.data.reduce((sum, grade) => sum + Number(grade.score || 0), 0) /
          gradesQuery.data.data.length
        ).toFixed(1)
      : '0.0';
  const excellentCount =
    gradesQuery.data?.data?.filter((grade) => Number(grade.score || 0) >= 85).length || 0;

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey='grades'
        title='Penilaian Siswa'
        description='Kelola penilaian Kurikulum Merdeka untuk setiap siswa dan kelas'
        actions={({ themeConfig }) => (
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' onClick={() => handleExport('excel')}>
              <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4h16v16H4z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 8l8 8m0-8l-8 8'
                />
              </svg>
              Export Excel
            </Button>
            <Button variant='outline' onClick={() => handleExport('pdf')}>
              <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14 2v4h4'
                />
              </svg>
              Export PDF
            </Button>
            <Button
              onClick={() => {
                setSelectedGrade(null);
                setFormData({ ...INITIAL_FORM_STATE, date: new Date().toISOString().split('T')[0] });
                setIsModalOpen(true);
              }}
              className={themeConfig.primaryButton}
            >
              <svg className='w-5 h-5 mr-2 inline' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Tambah Nilai
            </Button>
          </div>
        )}
        stats={[
          {
            label: 'Total Nilai',
            value: totalGrades,
            icon: (
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            ),
          },
          {
            label: 'Rata-rata Nilai',
            value: averageScore,
            icon: (
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                />
              </svg>
            ),
          },
          {
            label: 'Nilai ≥ 85',
            value: excellentCount,
            icon: (
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
                />
              </svg>
            ),
          },
        ]}
      >
        {({ themeConfig }) => (
          <>
            <div className='bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6'>
              <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Cari Siswa/Mata Pelajaran</label>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder='Ketik nama siswa, kelas, atau mapel'
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Filter Siswa</label>
                  <select
                    value={filterStudentId ?? ''}
                    onChange={(event) =>
                      setFilterStudentId(event.target.value ? Number(event.target.value) : undefined)
                    }
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium'
                  >
                    <option value=''>Semua Siswa</option>
                    {studentsQuery.data?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Filter Mata Pelajaran</label>
                  <select
                    value={filterSubjectId ?? ''}
                    onChange={(event) =>
                      setFilterSubjectId(event.target.value ? Number(event.target.value) : undefined)
                    }
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium'
                  >
                    <option value=''>Semua Mata Pelajaran</option>
                    {subjectsQuery.data?.data?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Filter Kelas</label>
                  <select
                    value={filterClassId ?? ''}
                    onChange={(event) =>
                      setFilterClassId(event.target.value ? Number(event.target.value) : undefined)
                    }
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium'
                  >
                    <option value=''>Semua Kelas</option>
                    {classesQuery.data?.data?.map((classRoom) => (
                      <option key={classRoom.id} value={classRoom.id}>
                        {classRoom.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='mt-4 flex flex-col md:flex-row gap-3 md:items-end'>
                <div className='md:w-1/3'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Jenis Penilaian</label>
                  <select
                    value={filterAssessmentType}
                    onChange={(event) =>
                      setFilterAssessmentType(
                        event.target.value === 'ALL'
                          ? 'ALL'
                          : (event.target.value as AssessmentType),
                      )
                    }
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium'
                  >
                    <option value='ALL'>Semua Penilaian</option>
                    {assessmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex-1 flex gap-3'>
                  <Button
                    variant='secondary'
                    className='px-4 py-3 rounded-2xl border-2 hover:bg-gray-50 transition-all duration-200 font-semibold'
                    onClick={() => {
                      setFilterStudentId(undefined);
                      setFilterSubjectId(undefined);
                      setFilterClassId(undefined);
                      setFilterAssessmentType('ALL');
                      setSearchTerm('');
                    }}
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {gradesQuery.isLoading ? (
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center'>
                <div
                  className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}
                ></div>
                <p className='mt-4 text-gray-600'>Memuat data penilaian...</p>
              </div>
            ) : (
              <div className='bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b-2 border-white/20'>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Kelas
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Siswa
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Mata Pelajaran
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Jenis Penilaian
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center'>
                          Nilai
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center'>
                          Bobot
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Tanggal
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Kompetensi / Tujuan
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Guru
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider'>
                          Catatan
                        </TableHead>
                        <TableHead className='font-bold text-white py-4 px-6 text-sm uppercase tracking-wider text-center'>
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradesQuery.data?.data?.map((grade, index) => {
                        const displayAssessment =
                          grade.assessmentType === 'OTHER'
                            ? grade.customAssessmentLabel || ASSESSMENT_LABELS.OTHER
                            : ASSESSMENT_LABELS[grade.assessmentType];
                        const weightDisplay =
                          grade.weight !== null && grade.weight !== undefined
                            ? `${Number(grade.weight).toFixed(2)}%`
                            : '-';

                        return (
                          <TableRow
                            key={grade.id}
                            className={`transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/30'
                            } hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-md border-b border-gray-100/50 group`}
                          >
                            <TableCell className='font-medium text-gray-800'>
                              {grade.student?.classRoom?.name || '-'}
                            </TableCell>
                            <TableCell className='font-medium text-gray-800'>
                              {grade.student?.name || `Siswa #${grade.studentId}`}
                            </TableCell>
                            <TableCell>{grade.subject?.name || '-'}</TableCell>
                            <TableCell>
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700'>
                                {displayAssessment}
                              </span>
                            </TableCell>
                            <TableCell className='text-center'>
                              <span className={getScoreColor(Number(grade.score || 0))}>
                                {Number(grade.score || 0).toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell className='text-center text-sm text-gray-700'>
                              {weightDisplay}
                            </TableCell>
                            <TableCell>{formatDate(grade.date)}</TableCell>
                            <TableCell className='text-sm text-gray-700'>
                              {grade.competency?.description ? (
                                <span className='block font-medium text-gray-800'>
                                  {grade.competency.description}
                                </span>
                              ) : (
                                <span className='text-gray-400 italic'>Kompetensi belum diatur</span>
                              )}
                              {grade.learningOutcome ? (
                                <span className='block text-gray-500 text-xs mt-1'>
                                  Tujuan: {grade.learningOutcome}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell>{grade.teacher?.name || '-'}</TableCell>
                            <TableCell>{grade.description || '-'}</TableCell>
                            <TableCell>
                              <div className='flex space-x-2 justify-center'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEdit(grade)}
                                  className='hover:bg-indigo-50 hover:border-indigo-300 transition-colors'
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant='danger'
                                  size='sm'
                                  onClick={() => handleDelete(grade.id)}
                                  className='hover:bg-red-600 transition-colors'
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {gradesQuery.data?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className='text-center py-12'>
                            <div className='flex flex-col items-center'>
                              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                                <svg
                                  className='w-8 h-8 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                  />
                                </svg>
                              </div>
                              <p className='text-gray-500 font-medium'>
                                Belum ada penilaian untuk filter saat ini
                              </p>
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
              onClose={closeModal}
              title={selectedGrade ? 'Edit Penilaian Siswa' : 'Tambah Penilaian Siswa'}
              size='lg'
            >
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Siswa <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          studentId: Number(event.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    >
                      <option value=''>Pilih Siswa</option>
                      {studentsQuery.data?.data?.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Mata Pelajaran <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          subjectId: Number(event.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    >
                      <option value=''>Pilih Mata Pelajaran</option>
                      {subjectsQuery.data?.data?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Jenis Penilaian <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={formData.assessmentType}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          assessmentType: event.target.value as AssessmentType,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    >
                      {assessmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.assessmentType === 'OTHER' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Nama Penilaian
                      </label>
                      <input
                        type='text'
                        value={formData.customAssessmentLabel}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            customAssessmentLabel: event.target.value,
                          }))
                        }
                        placeholder='Contoh: Penilaian Sikap'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nilai <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='100'
                      step='0.01'
                      value={formData.score}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          score: event.target.value === '' ? 0 : Number(event.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Bobot (%)</label>
                    <input
                      type='number'
                      min='0'
                      max='100'
                      step='0.01'
                      value={formData.weightInput}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          weightInput: event.target.value,
                        }))
                      }
                      placeholder='Opsional'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Tanggal Penilaian</label>
                    <input
                      type='date'
                      value={formData.date}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Kompetensi / Capaian Pembelajaran
                  </label>
                  <select
                    value={formData.competencyId ?? ''}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        competencyId: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Tidak dihubungkan</option>
                    {competenciesQuery.data?.data?.map((competency) => (
                      <option key={competency.id} value={competency.id}>
                        {competency.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tujuan Pembelajaran / Catatan Kurikulum
                  </label>
                  <textarea
                    value={formData.learningOutcome}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        learningOutcome: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder='Tambahkan catatan untuk menyelaraskan dengan Tujuan Pembelajaran Kurikulum Merdeka'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Catatan Tambahan</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder='Opsional'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button type='button' variant='secondary' onClick={closeModal}>
                    Batal
                  </Button>
                  <Button
                    type='submit'
                    loading={createMutation.isPending || updateMutation.isPending}
                    className={themeConfig.primaryButton}
                  >
                    {selectedGrade ? 'Simpan Perubahan' : 'Simpan Nilai'}
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

