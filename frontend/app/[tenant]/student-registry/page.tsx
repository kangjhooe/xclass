'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { studentRegistryApi, RegistryData, RegistrySnapshot, GenerateRegistryRequest } from '@/lib/api/student-registry';
import { studentsApi } from '@/lib/api/students';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantIdState } from '@/lib/hooks/useTenant';
import { useActiveAcademicYear } from '@/lib/hooks/useAcademicYear';
import { formatDate } from '@/lib/utils/date';
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  Printer, 
  Users, 
  FileCheck, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Trash2,
  Archive,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useToastStore } from '@/lib/store/toast';

export default function StudentRegistryPage() {
  const params = useParams();
  const tenantNpsn = params?.tenant as string;
  const { tenantId, loading: tenantLoading } = useTenantIdState();
  const { success, error, warning } = useToastStore();
  const queryClient = useQueryClient();

  const [searchNik, setSearchNik] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [registryData, setRegistryData] = useState<RegistryData | null>(null);
  const [generateOptions, setGenerateOptions] = useState<GenerateRegistryRequest>({
    nik: '',
    academicYear: '',
    includeSignature: false,
    format: 'pdf',
  });
  const [batchNiks, setBatchNiks] = useState<string[]>([]);
  const [batchNikInput, setBatchNikInput] = useState('');

  const {
    data: activeAcademicYear,
    isLoading: academicYearLoading,
  } = useActiveAcademicYear(tenantId, { enabled: !!tenantId && !tenantLoading });

  // Search student by NIK
  const { data: studentData, isLoading: studentLoading, refetch: refetchStudent } = useQuery({
    queryKey: ['student-by-nik', tenantId, searchNik],
    queryFn: async () => {
      if (!searchNik || !tenantId) return null;
      const students = await studentsApi.getAll(tenantId, { search: searchNik, limit: 1 });
      return students.data?.find((s: any) => s.nik === searchNik) || null;
    },
    enabled: !!searchNik && !!tenantId && searchNik.length >= 16,
  });

  // Get snapshots for selected student
  const { data: snapshots, isLoading: snapshotsLoading, refetch: refetchSnapshots } = useQuery({
    queryKey: ['registry-snapshots', tenantId, selectedStudent?.nik],
    queryFn: () => studentRegistryApi.getSnapshots(selectedStudent?.nik || ''),
    enabled: !!selectedStudent?.nik && !!tenantId,
  });

  // Get statistics
  const { data: statistics, isLoading: statisticsLoading } = useQuery({
    queryKey: ['registry-statistics', tenantId],
    queryFn: () => studentRegistryApi.getStatistics(),
    enabled: !!tenantId,
  });

  // Generate registry mutation
  const generateMutation = useMutation({
    mutationFn: async (options: GenerateRegistryRequest) => {
      const blob = await studentRegistryApi.generate(options);
      return blob;
    },
    onSuccess: (blob) => {
      // Download PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Buku_Induk_${generateOptions.nik}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      success('Buku induk berhasil di-generate dan di-download', { title: 'Berhasil' });

      setIsGenerateModalOpen(false);
      refetchSnapshots();
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Gagal generate buku induk', { title: 'Gagal' });
    },
  });

  // Batch generate mutation
  const batchGenerateMutation = useMutation({
    mutationFn: async (niks: string[]) => {
      const blob = await studentRegistryApi.batchGenerate({
        niks,
        academicYear: activeAcademicYear?.name,
        format: 'zip',
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Buku_Induk_Batch_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      success(`Buku induk untuk ${batchNiks.length} siswa berhasil di-generate`, { title: 'Berhasil' });

      setIsBatchModalOpen(false);
      setBatchNiks([]);
      setBatchNikInput('');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Gagal batch generate', { title: 'Gagal' });
    },
  });

  // Delete snapshot mutation
  const deleteSnapshotMutation = useMutation({
    mutationFn: (id: number) => studentRegistryApi.deleteSnapshot(id),
    onSuccess: () => {
      success('Snapshot berhasil dihapus', { title: 'Berhasil' });
      refetchSnapshots();
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Gagal menghapus snapshot', { title: 'Gagal' });
    },
  });

  // Download snapshot PDF
  const downloadSnapshot = async (id: number) => {
    try {
      const blob = await studentRegistryApi.downloadSnapshotPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Buku_Induk_Snapshot_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      success('PDF berhasil di-download', { title: 'Berhasil' });
    } catch (error: any) {
      error(error?.response?.data?.message || 'Gagal download PDF', { title: 'Gagal' });
    }
  };

  // View registry data
  const viewRegistryData = async (nik: string) => {
    try {
      const data = await studentRegistryApi.getData(nik, activeAcademicYear?.name);
      setRegistryData(data);
      setIsViewModalOpen(true);
    } catch (error: any) {
      error(error?.response?.data?.message || 'Gagal mengambil data', { title: 'Gagal' });
    }
  };

  // Handle search
  useEffect(() => {
    if (studentData) {
      setSelectedStudent(studentData);
      setGenerateOptions((prev) => ({ ...prev, nik: studentData.nik }));
    }
  }, [studentData]);

  // Handle generate
  const handleGenerate = () => {
    if (!generateOptions.nik) {
        error('NIK siswa harus diisi', { title: 'Error' });
      return;
    }

    generateMutation.mutate({
      ...generateOptions,
      academicYear: generateOptions.academicYear || activeAcademicYear?.name,
    });
  };

  // Handle batch add NIK
  const handleAddBatchNik = () => {
    if (batchNikInput.trim() && batchNikInput.length >= 16) {
      if (!batchNiks.includes(batchNikInput.trim())) {
        setBatchNiks([...batchNiks, batchNikInput.trim()]);
        setBatchNikInput('');
      } else {
        warning('NIK sudah ditambahkan', { title: 'Peringatan' });
      }
    }
  };

  // Handle batch generate
  const handleBatchGenerate = () => {
    if (batchNiks.length === 0) {
      error('Minimal 1 NIK harus ditambahkan', { title: 'Error' });
      return;
    }

    batchGenerateMutation.mutate(batchNiks);
  };

  return (
    <TenantLayout>
      <ModulePageShell
        title="Buku Induk Siswa"
        description="Generate dan kelola buku induk siswa lengkap dengan semua data terkait"
        icon={BookOpen}
        breadcrumbs={[
          { label: 'Dashboard', href: `/${tenantNpsn}/dashboard` },
          { label: 'Buku Induk Siswa', href: `/${tenantNpsn}/student-registry` },
        ]}
      >
        {({ themeConfig }) => (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Snapshot</p>
                      <p className="text-3xl font-bold mt-2">{statistics.totalSnapshots}</p>
                    </div>
                    <Archive className="w-12 h-12 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Tertandatangani</p>
                      <p className="text-3xl font-bold mt-2">{statistics.signedSnapshots}</p>
                    </div>
                    <FileCheck className="w-12 h-12 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Belum Tandatangan</p>
                      <p className="text-3xl font-bold mt-2">{statistics.unsignedSnapshots}</p>
                    </div>
                    <FileText className="w-12 h-12 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Aksi Cepat</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsBatchModalOpen(true)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <Users className="w-4 h-4" />
                          Batch
                        </Button>
                      </div>
                    </div>
                    <Sparkles className="w-12 h-12 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* Search Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Siswa berdasarkan NIK
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchNik}
                      onChange={(e) => setSearchNik(e.target.value)}
                      placeholder="Masukkan NIK siswa (16 digit)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={16}
                    />
                  </div>
                  {studentLoading && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mencari siswa...
                    </p>
                  )}
                  {studentData && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-semibold text-gray-900">{studentData.name}</p>
                      <p className="text-sm text-gray-600">NIK: {studentData.nik} | NISN: {studentData.nisn || '-'}</p>
                      {studentData.classRoom && (
                        <p className="text-sm text-gray-600">Kelas: {studentData.classRoom.name}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => {
                      if (selectedStudent) {
                        setIsGenerateModalOpen(true);
                      } else {
                        warning('Silakan cari siswa terlebih dahulu', { title: 'Peringatan' });
                      }
                    }}
                    disabled={!selectedStudent}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Buku Induk
                  </Button>

                  <Button
                    onClick={() => {
                      if (selectedStudent) {
                        viewRegistryData(selectedStudent.nik);
                      } else {
                        warning('Silakan cari siswa terlebih dahulu', { title: 'Peringatan' });
                      }
                    }}
                    disabled={!selectedStudent}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Snapshots List */}
            {selectedStudent && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Archive className="w-5 h-5 text-blue-600" />
                    Riwayat Buku Induk - {selectedStudent.name}
                  </h3>
                </div>

                {snapshotsLoading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
                  </div>
                ) : snapshots && snapshots.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                          <TableHead className="text-white">Tanggal Generate</TableHead>
                          <TableHead className="text-white">Tahun Ajaran</TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-white">Dibuat Oleh</TableHead>
                          <TableHead className="text-white text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {snapshots.map((snapshot: RegistrySnapshot) => (
                          <TableRow key={snapshot.id} className="hover:bg-gray-50">
                            <TableCell>{formatDate(snapshot.createdAt)}</TableCell>
                            <TableCell>{snapshot.academicYear || '-'}</TableCell>
                            <TableCell>
                              {snapshot.isSigned ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Tertandatangani
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3" />
                                  Belum Tandatangan
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{snapshot.generatedBy || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadSnapshot(snapshot.id)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm('Yakin ingin menghapus snapshot ini?')) {
                                      deleteSnapshotMutation.mutate(snapshot.id);
                                    }
                                  }}
                                  disabled={deleteSnapshotMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada buku induk yang di-generate untuk siswa ini</p>
                  </div>
                )}
              </div>
            )}

            {/* Generate Modal */}
            <Modal
              isOpen={isGenerateModalOpen}
              onClose={() => setIsGenerateModalOpen(false)}
              title="Generate Buku Induk Siswa"
              size="lg"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK Siswa
                  </label>
                  <input
                    type="text"
                    value={generateOptions.nik}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={generateOptions.academicYear || activeAcademicYear?.name || ''}
                    onChange={(e) => setGenerateOptions({ ...generateOptions, academicYear: e.target.value })}
                    placeholder={activeAcademicYear?.name || 'Tahun ajaran aktif'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeSignature"
                    checked={generateOptions.includeSignature}
                    onChange={(e) => setGenerateOptions({ ...generateOptions, includeSignature: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeSignature" className="text-sm font-medium text-gray-700">
                    Sertakan Tanda Tangan Digital
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsGenerateModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    loading={generateMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Printer className="w-4 h-4" />
                    Generate & Download
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Batch Generate Modal */}
            <Modal
              isOpen={isBatchModalOpen}
              onClose={() => setIsBatchModalOpen(false)}
              title="Batch Generate Buku Induk"
              size="lg"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tambah NIK Siswa
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={batchNikInput}
                      onChange={(e) => setBatchNikInput(e.target.value)}
                      placeholder="Masukkan NIK (16 digit)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      maxLength={16}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBatchNik();
                        }
                      }}
                    />
                    <Button onClick={handleAddBatchNik} variant="outline">
                      Tambah
                    </Button>
                  </div>
                </div>

                {batchNiks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daftar NIK ({batchNiks.length} siswa)
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                      {batchNiks.map((nik, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-mono">{nik}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBatchNiks(batchNiks.filter((_, i) => i !== index))}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsBatchModalOpen(false);
                      setBatchNiks([]);
                      setBatchNikInput('');
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleBatchGenerate}
                    disabled={batchGenerateMutation.isPending || batchNiks.length === 0}
                    loading={batchGenerateMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Users className="w-4 h-4" />
                    Generate Batch ({batchNiks.length})
                  </Button>
                </div>
              </div>
            </Modal>

            {/* View Registry Data Modal */}
            <Modal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              title="Data Buku Induk"
              size="xl"
            >
              {registryData && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Student Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Identitas Siswa</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Nama:</span>{' '}
                        <span className="font-medium">{registryData.student.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NIK:</span>{' '}
                        <span className="font-medium">{registryData.student.nik}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NISN:</span>{' '}
                        <span className="font-medium">{registryData.student.nisn || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kelas:</span>{' '}
                        <span className="font-medium">
                          {registryData.student.classRoom?.name || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  {registryData.statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {registryData.statistics.totalGrades}
                        </p>
                        <p className="text-xs text-gray-600">Total Nilai</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {registryData.statistics.averageGrade}
                        </p>
                        <p className="text-xs text-gray-600">Rata-rata</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {registryData.statistics.totalAttendance}
                        </p>
                        <p className="text-xs text-gray-600">Kehadiran</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {registryData.statistics.attendanceRate}%
                        </p>
                        <p className="text-xs text-gray-600">Tingkat Hadir</p>
                      </div>
                    </div>
                  )}

                  {/* Grades Summary */}
                  {registryData.grades && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Nilai Akademik</h4>
                      <div className="text-sm text-gray-600">
                        Total: {registryData.grades.total} nilai | Rata-rata: {registryData.grades.average}
                      </div>
                    </div>
                  )}

                  {/* Other Data */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {registryData.health && (
                      <div>
                        <span className="text-gray-600">Catatan Kesehatan:</span>{' '}
                        <span className="font-medium">{registryData.health.total}</span>
                      </div>
                    )}
                    {registryData.discipline && (
                      <div>
                        <span className="text-gray-600">Pelanggaran:</span>{' '}
                        <span className="font-medium">{registryData.discipline.total}</span>
                      </div>
                    )}
                    {registryData.counseling && (
                      <div>
                        <span className="text-gray-600">Konseling:</span>{' '}
                        <span className="font-medium">{registryData.counseling.total}</span>
                      </div>
                    )}
                    {registryData.extracurricular && (
                      <div>
                        <span className="text-gray-600">Ekstrakurikuler:</span>{' '}
                        <span className="font-medium">{registryData.extracurricular.total}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
      </ModulePageShell>
    </TenantLayout>
  );
}

