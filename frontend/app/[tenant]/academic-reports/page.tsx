'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { academicReportsApi, AcademicReport, AcademicReportGenerateData } from '@/lib/api/academic-reports';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function AcademicReportsPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AcademicReportGenerateData>({
    report_type: 'student_grade',
    title: '',
    academic_year_id: undefined,
    class_id: undefined,
    student_id: undefined,
    period: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['academic-reports', tenantId],
    queryFn: () => academicReportsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const generateMutation = useMutation({
    mutationFn: (data: AcademicReportGenerateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicReportsApi.generate(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-reports', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return academicReportsApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-reports', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      report_type: 'student_grade',
      title: '',
      academic_year_id: undefined,
      class_id: undefined,
      student_id: undefined,
      period: '',
    });
  };

  const totalReports = data?.data?.length || 0;
  const reportTypes = [
    { value: 'student_grade', label: 'Laporan Nilai Siswa' },
    { value: 'class_summary', label: 'Ringkasan Kelas' },
    { value: 'attendance_report', label: 'Laporan Absensi' },
    { value: 'final_report', label: 'Laporan Akhir Semester' },
    { value: 'transcript', label: 'Transkrip Nilai' },
  ];

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Laporan Akademik
              </h1>
              <p className="text-gray-600">Generate berbagai jenis laporan akademik</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Laporan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                <p className="text-3xl font-bold text-blue-600">{totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-gray-700">Judul</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipe Laporan</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tahun Pelajaran</TableHead>
                    <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-gray-700">Periode</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Generate</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((report) => (
                    <TableRow key={report.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{report.title}</TableCell>
                      <TableCell>
                        {reportTypes.find((t) => t.value === report.report_type)?.label || report.report_type}
                      </TableCell>
                      <TableCell>{report.academic_year_name || '-'}</TableCell>
                      <TableCell>{report.class_name || '-'}</TableCell>
                      <TableCell>{report.period || '-'}</TableCell>
                      <TableCell>{report.generated_at ? formatDate(report.generated_at) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {report.file_url && (
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Download
                            </a>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
                                deleteMutation.mutate(report.id);
                              }
                            }}
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada laporan</p>
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
          title="Generate Laporan Akademik"
          size="md"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!tenantId) {
              alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
              return;
            }
            generateMutation.mutate(formData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Laporan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label>
              <input
                type="number"
                value={formData.academic_year_id}
                onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <input
                type="number"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
              <input
                type="number"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Semester 1, Bulan Januari, dll"
              />
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
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Memproses...' : 'Generate'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}
