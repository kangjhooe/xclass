'use client';

import { useState, useEffect } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import { studentTransferApi, StudentTransfer, StudentTransferCreateData, PullRequestCreateData } from '@/lib/api/student-transfer';
import { studentsApi, Student } from '@/lib/api/students';
import { tenantApi, Tenant } from '@/lib/api/tenant';
import { storageApi } from '@/lib/api/storage';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';

export default function StudentTransferPage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StudentTransfer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<StudentTransferCreateData>({
    student_id: 0,
    from_instansi_id: tenantId ?? 0,
    to_instansi_id: 0,
    transfer_date: new Date().toISOString().split('T')[0],
    reason: '',
    documents: [],
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [npsnSearch, setNpsnSearch] = useState('');
  const [destinationTenant, setDestinationTenant] = useState<Tenant | null>(null);
  const [npsnError, setNpsnError] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPullRequestModalOpen, setIsPullRequestModalOpen] = useState(false);
  const [pullRequestData, setPullRequestData] = useState<PullRequestCreateData>({
    sourceTenantNpsn: '',
    studentNisn: '',
    transfer_date: new Date().toISOString().split('T')[0],
    reason: '',
    documents: [],
  });
  const [sourceTenant, setSourceTenant] = useState<Tenant | null>(null);
  const [sourceTenantError, setSourceTenantError] = useState<string>('');
  const [studentInfo, setStudentInfo] = useState<{ name?: string; nisn?: string } | null>(null);
  const [studentError, setStudentError] = useState<string>('');
  const [pullRequestUploadedDocuments, setPullRequestUploadedDocuments] = useState<string[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLookingUpStudent, setIsLookingUpStudent] = useState(false);

  const queryClient = useQueryClient();
  const { success, error: showError } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ['student-transfers', tenantId],
    queryFn: () => studentTransferApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!),
    enabled: !!tenantId && isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: StudentTransferCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Pengajuan transfer siswa berhasil dibuat');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal membuat pengajuan transfer');
    },
  });

  const createPullRequestMutation = useMutation({
    mutationFn: (data: PullRequestCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.createPullRequest(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      setIsPullRequestModalOpen(false);
      resetPullRequestForm();
      success('Permintaan mutasi siswa berhasil dibuat');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal membuat permintaan mutasi');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.approve(tenantId, id);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      
      // Tampilkan informasi data yang ditransfer jika ada
      if (data?.transferredData) {
        const transferred = data.transferredData;
        const summary = [
          transferred.grades ? `${transferred.grades} nilai` : null,
          transferred.healthRecords ? `${transferred.healthRecords} catatan kesehatan` : null,
          transferred.counselingSessions ? `${transferred.counselingSessions} sesi konseling` : null,
          transferred.disciplinaryActions ? `${transferred.disciplinaryActions} catatan disiplin` : null,
        ].filter(Boolean).join(', ');
        
        success(
          `Transfer disetujui dan selesai! Data yang dipindahkan: ${summary || 'tidak ada'}`,
          { duration: 5000 }
        );
      } else {
        success('Transfer disetujui');
      }
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal menyetujui transfer');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.reject(tenantId, id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      success('Transfer ditolak');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal menolak transfer');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.complete(tenantId, id);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      
      // Tampilkan informasi data yang ditransfer jika ada
      if (data?.transferredData) {
        const transferred = data.transferredData;
        const summary = [
          transferred.grades ? `${transferred.grades} nilai` : null,
          transferred.healthRecords ? `${transferred.healthRecords} catatan kesehatan` : null,
          transferred.counselingSessions ? `${transferred.counselingSessions} sesi konseling` : null,
          transferred.disciplinaryActions ? `${transferred.disciplinaryActions} catatan disiplin` : null,
        ].filter(Boolean).join(', ');
        
        success(
          `Transfer selesai! Data yang dipindahkan: ${summary || 'tidak ada'}`,
          { duration: 5000 }
        );
      } else {
        success('Transfer selesai');
      }
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal menyelesaikan transfer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return studentTransferApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', tenantId] });
      success('Pengajuan transfer berhasil dihapus');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || err?.message || 'Gagal menghapus pengajuan transfer');
    },
  });

  const handleSearchTenant = async (npsn: string) => {
    if (!npsn || npsn.trim() === '') {
      setNpsnError('');
      setDestinationTenant(null);
      setFormData({ ...formData, to_instansi_id: 0 });
      return;
    }

    try {
      setNpsnError('');
      const tenant = await tenantApi.getByNpsn(npsn.trim());
      if (tenant.id === tenantId) {
        setNpsnError('Tidak dapat memilih instansi sendiri');
        setDestinationTenant(null);
        setFormData({ ...formData, to_instansi_id: 0 });
      } else {
        setDestinationTenant(tenant);
        setFormData({ ...formData, to_instansi_id: tenant.id });
      }
    } catch (error: any) {
      setNpsnError('Instansi dengan NPSN tersebut tidak ditemukan');
      setDestinationTenant(null);
      setFormData({ ...formData, to_instansi_id: 0 });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!tenantId || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        storageApi.upload(tenantId, file, {
          category: 'student-transfer',
          folder: 'surat-mutasi',
          description: 'Surat Mutasi Siswa',
        })
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map((result) => result.data.url);
      setUploadedDocuments([...uploadedDocuments, ...urls]);
      setFormData({ ...formData, documents: [...uploadedDocuments, ...urls] });
    } catch (error: any) {
      showError('Gagal mengupload file: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(newDocuments);
    setFormData({ ...formData, documents: newDocuments });
  };

  const handleSearchSourceTenant = async (npsn: string) => {
    if (!npsn || npsn.trim() === '') {
      setSourceTenantError('');
      setSourceTenant(null);
      return;
    }

    try {
      setSourceTenantError('');
      const tenant = await tenantApi.getByNpsn(npsn.trim());
      if (tenant.id === tenantId) {
        setSourceTenantError('Tidak dapat menarik siswa dari instansi sendiri');
        setSourceTenant(null);
      } else {
        setSourceTenant(tenant);
        setPullRequestData({ ...pullRequestData, sourceTenantNpsn: npsn.trim() });
      }
    } catch (error: any) {
      setSourceTenantError('Instansi dengan NPSN tersebut tidak ditemukan');
      setSourceTenant(null);
    }
  };

  const handlePullRequestFileUpload = async (files: File[]) => {
    if (!tenantId || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        storageApi.upload(tenantId, file, {
          category: 'student-transfer',
          folder: 'surat-mutasi',
          description: 'Surat Mutasi Siswa - Pull Request',
        })
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map((result) => result.data.url);
      setPullRequestUploadedDocuments([...pullRequestUploadedDocuments, ...urls]);
      setPullRequestData({ ...pullRequestData, documents: [...pullRequestUploadedDocuments, ...urls] });
    } catch (error: any) {
      showError('Gagal mengupload file: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePullRequestDocument = (index: number) => {
    const newDocuments = pullRequestUploadedDocuments.filter((_, i) => i !== index);
    setPullRequestUploadedDocuments(newDocuments);
    setPullRequestData({ ...pullRequestData, documents: newDocuments });
  };

  const resetForm = () => {
    setFormData({
      student_id: 0,
      from_instansi_id: tenantId ?? 0,
      to_instansi_id: 0,
      transfer_date: new Date().toISOString().split('T')[0],
      reason: '',
      documents: [],
    });
    setSelectedTransfer(null);
    setSelectedStudent(null);
    setNpsnSearch('');
    setDestinationTenant(null);
    setNpsnError('');
    setUploadedDocuments([]);
  };

  const resetPullRequestForm = () => {
    setPullRequestData({
      sourceTenantNpsn: '',
      studentNisn: '',
      transfer_date: new Date().toISOString().split('T')[0],
      reason: '',
      documents: [],
    });
    setSourceTenant(null);
    setSourceTenantError('');
    setStudentInfo(null);
    setStudentError('');
    setPullRequestUploadedDocuments([]);
  };

  const filteredData = data?.data?.filter((transfer) => {
    if (filterStatus !== 'all' && transfer.status !== filterStatus) return false;
    return true;
  }) || [];

  const totalTransfers = data?.data?.length || 0;
  const pendingCount = data?.data?.filter((t) => t.status === 'pending').length || 0;
  const completedCount = data?.data?.filter((t) => t.status === 'completed').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Transfer Siswa
              </h1>
              <p className="text-gray-600">Manajemen proses pindah sekolah siswa</p>
            </div>
            <div className="flex gap-3">
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
                Ajukan Transfer
              </Button>
              <Button
                onClick={() => {
                  resetPullRequestForm();
                  setIsPullRequestModalOpen(true);
                }}
                variant="outline"
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Permintaan Mutasi
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transfer</p>
                <p className="text-3xl font-bold text-blue-600">{totalTransfers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Persetujuan</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="completed">Selesai</option>
              </select>
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
                    <TableHead className="font-semibold text-gray-700">Siswa</TableHead>
                    <TableHead className="font-semibold text-gray-700">NIS</TableHead>
                    <TableHead className="font-semibold text-gray-700">Dari Instansi</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ke Instansi</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Transfer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((transfer) => {
                    const isIncomingTransfer = transfer.to_instansi_id === tenantId;
                    const isOutgoingTransfer = transfer.from_instansi_id === tenantId;
                    const canApproveReject = isIncomingTransfer && transfer.status === 'pending';
                    const canComplete = isOutgoingTransfer && transfer.status === 'approved';
                    const canDelete = isOutgoingTransfer && transfer.status === 'pending';

                    return (
                      <TableRow key={transfer.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {transfer.student_name || '-'}
                            {isIncomingTransfer && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                Masuk
                              </span>
                            )}
                            {isOutgoingTransfer && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                Keluar
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transfer.student_nis || '-'}</TableCell>
                        <TableCell>{transfer.from_instansi_name || '-'}</TableCell>
                        <TableCell>{transfer.to_instansi_name || '-'}</TableCell>
                        <TableCell>{transfer.transfer_date ? formatDate(transfer.transfer_date) : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            transfer.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : transfer.status === 'approved'
                              ? 'bg-blue-500 text-white'
                              : transfer.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {transfer.status === 'pending' ? 'Menunggu' :
                             transfer.status === 'approved' ? 'Disetujui' :
                             transfer.status === 'rejected' ? 'Ditolak' :
                             transfer.status === 'completed' ? 'Selesai' : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setIsDetailModalOpen(true);
                              }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              Detail
                            </Button>
                            {canApproveReject && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => approveMutation.mutate(transfer.id)}
                                  className="hover:bg-green-50 hover:border-green-300 transition-colors"
                                  loading={approveMutation.isPending}
                                >
                                  Setujui
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt('Alasan penolakan:');
                                    if (reason) {
                                      rejectMutation.mutate({ id: transfer.id, reason });
                                    }
                                  }}
                                  className="hover:bg-red-600 transition-colors"
                                  loading={rejectMutation.isPending}
                                >
                                  Tolak
                                </Button>
                              </>
                            )}
                            {canComplete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => completeMutation.mutate(transfer.id)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                loading={completeMutation.isPending}
                              >
                                Selesai
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus pengajuan transfer ini?')) {
                                    deleteMutation.mutate(transfer.id);
                                  }
                                }}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada pengajuan transfer</p>
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
          title="Ajukan Transfer Siswa"
          size="md"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!tenantId) {
              showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
              return;
            }
            if (!formData.student_id || formData.student_id === 0) {
              showError('Pilih siswa terlebih dahulu');
              return;
            }
            if (!formData.to_instansi_id || formData.to_instansi_id === 0) {
              showError('Pilih instansi tujuan terlebih dahulu');
              return;
            }
            createMutation.mutate({
              ...formData,
              from_instansi_id: tenantId,
            });
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.student_id.toString()}
                onChange={(e) => {
                  const studentId = parseInt(e.target.value) || 0;
                  const student = studentsData?.data?.find((s) => s.id === studentId);
                  setFormData({ ...formData, student_id: studentId });
                  setSelectedStudent(student || null);
                }}
                required
                disabled={isLoadingStudents}
                placeholder={isLoadingStudents ? 'Memuat data siswa...' : 'Pilih siswa'}
                options={
                  studentsData?.data?.map((student) => ({
                    value: student.id.toString(),
                    label: `${student.name}${student.nis ? ` (NIS: ${student.nis})` : ''}${student.nisn ? ` - NISN: ${student.nisn}` : ''}`,
                  })) || []
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ke Instansi (NPSN) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={npsnSearch}
                  onChange={(e) => {
                    setNpsnSearch(e.target.value);
                    if (e.target.value.trim() === '') {
                      setNpsnError('');
                      setDestinationTenant(null);
                      setFormData({ ...formData, to_instansi_id: 0 });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleSearchTenant(e.target.value);
                    }
                  }}
                  placeholder="Masukkan NPSN instansi tujuan"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    npsnError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {npsnError && (
                  <p className="text-sm text-red-600">{npsnError}</p>
                )}
                {destinationTenant && !npsnError && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {destinationTenant.name}
                    </p>
                    <p className="text-xs text-green-600">NPSN: {destinationTenant.npsn}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
              <input
                type="date"
                value={formData.transfer_date}
                onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alasan transfer siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surat Mutasi (Opsional)
              </label>
              <FileUpload
                onUpload={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple={false}
                maxSize={5}
                disabled={isUploading}
              />
              {uploadedDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedDocuments.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {url.split('/').pop() || `Dokumen ${index + 1}`}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        className="ml-2"
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                loading={createMutation.isPending}
              >
                Ajukan
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isPullRequestModalOpen}
          onClose={() => {
            setIsPullRequestModalOpen(false);
            resetPullRequestForm();
          }}
          title="Permintaan Mutasi Siswa"
          size="md"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!tenantId) {
              showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
              return;
            }
            if (!pullRequestData.sourceTenantNpsn || !sourceTenant) {
              showError('Pilih instansi sumber terlebih dahulu');
              return;
            }
            if (!pullRequestData.studentNisn || pullRequestData.studentNisn.trim() === '') {
              showError('Masukkan NISN siswa terlebih dahulu');
              return;
            }
            if (!studentInfo) {
              showError('Silakan cari dan verifikasi siswa terlebih dahulu');
              return;
            }
            createPullRequestMutation.mutate(pullRequestData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instansi Sumber (NPSN) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={pullRequestData.sourceTenantNpsn}
                  onChange={(e) => {
                    setPullRequestData({ ...pullRequestData, sourceTenantNpsn: e.target.value });
                    if (e.target.value.trim() === '') {
                      setSourceTenantError('');
                      setSourceTenant(null);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleSearchSourceTenant(e.target.value);
                    }
                  }}
                  placeholder="Masukkan NPSN instansi sumber siswa"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    sourceTenantError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {sourceTenantError && (
                  <p className="text-sm text-red-600">{sourceTenantError}</p>
                )}
                {sourceTenant && !sourceTenantError && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {sourceTenant.name}
                    </p>
                    <p className="text-xs text-green-600">NPSN: {sourceTenant.npsn}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NISN Siswa <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pullRequestData.studentNisn}
                    onChange={(e) => {
                      setPullRequestData({ ...pullRequestData, studentNisn: e.target.value });
                      setStudentError('');
                      setStudentInfo(null);
                    }}
                    onBlur={async (e) => {
                      if (e.target.value.trim() && sourceTenant) {
                        setIsLookingUpStudent(true);
                        try {
                          const lookupResult = await studentTransferApi.lookupStudent(
                            tenantId!,
                            pullRequestData.sourceTenantNpsn,
                            e.target.value.trim(),
                          );
                          setStudentInfo({
                            name: lookupResult.student.name,
                            nisn: lookupResult.student.nisn,
                          });
                          setStudentError('');
                        } catch (err: any) {
                          setStudentError(err?.response?.data?.message || 'Siswa tidak ditemukan');
                          setStudentInfo(null);
                        } finally {
                          setIsLookingUpStudent(false);
                        }
                      }
                    }}
                    placeholder="Masukkan NISN siswa yang akan ditarik"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      studentError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!sourceTenant || isLookingUpStudent}
                  />
                  {sourceTenant && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!pullRequestData.studentNisn.trim() || !sourceTenant) return;
                        setIsLookingUpStudent(true);
                        try {
                          const lookupResult = await studentTransferApi.lookupStudent(
                            tenantId!,
                            pullRequestData.sourceTenantNpsn,
                            pullRequestData.studentNisn.trim(),
                          );
                          setStudentInfo({
                            name: lookupResult.student.name,
                            nisn: lookupResult.student.nisn,
                          });
                          setStudentError('');
                        } catch (err: any) {
                          setStudentError(err?.response?.data?.message || 'Siswa tidak ditemukan');
                          setStudentInfo(null);
                        } finally {
                          setIsLookingUpStudent(false);
                        }
                      }}
                      disabled={!pullRequestData.studentNisn.trim() || !sourceTenant || isLookingUpStudent}
                    >
                      {isLookingUpStudent ? 'Mencari...' : 'Cari'}
                    </Button>
                  )}
                </div>
                {studentError && (
                  <p className="text-sm text-red-600">{studentError}</p>
                )}
                {studentInfo && !studentError && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      {studentInfo.name}
                    </p>
                    <p className="text-xs text-blue-600">NISN: {studentInfo.nisn}</p>
                  </div>
                )}
                {!sourceTenant && (
                  <p className="text-xs text-gray-500">Masukkan NPSN instansi sumber terlebih dahulu</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
              <input
                type="date"
                value={pullRequestData.transfer_date}
                onChange={(e) => setPullRequestData({ ...pullRequestData, transfer_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <textarea
                value={pullRequestData.reason}
                onChange={(e) => setPullRequestData({ ...pullRequestData, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alasan permintaan mutasi siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surat Mutasi (Opsional)
              </label>
              <FileUpload
                onUpload={handlePullRequestFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple={false}
                maxSize={5}
                disabled={isUploading}
              />
              {pullRequestUploadedDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {pullRequestUploadedDocuments.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {url.split('/').pop() || `Dokumen ${index + 1}`}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemovePullRequestDocument(index)}
                        className="ml-2"
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsPullRequestModalOpen(false);
                  resetPullRequestForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createPullRequestMutation.isPending}
              >
                Ajukan Permintaan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTransfer(null);
          }}
          title="Detail Transfer Siswa"
          size="lg"
        >
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.student_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.student_nis || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dari Instansi</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.from_instansi_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ke Instansi</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.to_instansi_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
                  <p className="text-sm text-gray-900">
                    {selectedTransfer.transfer_date ? formatDate(selectedTransfer.transfer_date) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                    selectedTransfer.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : selectedTransfer.status === 'approved'
                      ? 'bg-blue-500 text-white'
                      : selectedTransfer.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {selectedTransfer.status === 'pending' ? 'Menunggu' :
                     selectedTransfer.status === 'approved' ? 'Disetujui' :
                     selectedTransfer.status === 'rejected' ? 'Ditolak' :
                     selectedTransfer.status === 'completed' ? 'Selesai' : '-'}
                  </span>
                </div>
              </div>

              {selectedTransfer.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTransfer.reason}</p>
                </div>
              )}

              {selectedTransfer.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Alasan Penolakan</label>
                  <p className="text-sm text-red-900 whitespace-pre-wrap">{selectedTransfer.rejection_reason}</p>
                </div>
              )}

              {selectedTransfer.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTransfer.notes}</p>
                </div>
              )}

              {selectedTransfer.transferredData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data yang Ditransfer</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedTransfer.transferredData.grades !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Nilai:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.grades} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.healthRecords !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Catatan Kesehatan:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.healthRecords} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.counselingSessions !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Konseling:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.counselingSessions} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.disciplinaryActions !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Disiplin:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.disciplinaryActions} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.extracurricularParticipants !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Ekstrakurikuler:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.extracurricularParticipants} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.courseProgress !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">E-Learning Progress:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.courseProgress} record</span>
                        </div>
                      )}
                      {selectedTransfer.transferredData.courseEnrollments !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">E-Learning Enrollment:</span>{' '}
                          <span className="text-gray-900">{selectedTransfer.transferredData.courseEnrollments} record</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTransfer.documents && selectedTransfer.documents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen</label>
                  <div className="space-y-2">
                    {selectedTransfer.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {doc.split('/').pop() || `Dokumen ${index + 1}`}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedTransfer(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}
