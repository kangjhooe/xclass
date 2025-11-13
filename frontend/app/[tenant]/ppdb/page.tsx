'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { ppdbApi, PpdbApplication, PpdbApplicationCreateData, RegistrationStatus, RegistrationPath } from '@/lib/api/ppdb';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { Eye, UserPlus, FileText, CheckCircle, XCircle, Clock, Award, MapPin, Download, Check, X, AlertCircle, Calendar, Users, TrendingUp, Layers, Send } from 'lucide-react';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/Charts';

export default function PPDBPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectPaymentModalOpen, setIsRejectPaymentModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<{ type: string; name: string } | null>(null);
  const [verifyRejectionReason, setVerifyRejectionReason] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<PpdbApplication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | ''>('');
  const [filterPath, setFilterPath] = useState<RegistrationPath | ''>('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'schedules' | 'analytics'>('registrations');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'status' | 'export' | 'import' | 'notification'>('status');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkFormData, setBulkFormData] = useState({
    status: '',
    notes: '',
    exportFormat: 'excel',
    notificationSubject: '',
    notificationMessage: '',
  });
  const [isSearchStudentModalOpen, setIsSearchStudentModalOpen] = useState(false);
  const [studentSearchData, setStudentSearchData] = useState({
    nisn: '',
    sourceTenantNpsn: '',
  });
  const [foundStudent, setFoundStudent] = useState<any>(null);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    scheduleDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: '1',
    location: '',
    notes: '',
  });
  const [formData, setFormData] = useState<PpdbApplicationCreateData>({
    studentName: '',
    studentNisn: '',
    studentNik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'male',
    religion: '',
    address: '',
    phone: '',
    email: '',
    parentName: '',
    parentPhone: '',
    parentOccupation: '',
    parentIncome: 0,
    previousSchool: '',
    previousSchoolAddress: '',
    registrationPath: 'zonasi',
    notes: '',
  });
  const [scoreData, setScoreData] = useState({
    selectionScore: '',
    interviewScore: '',
    documentScore: '',
  });
  const { success, error: showError } = useToastStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ppdb', resolvedTenantId, currentPage, searchQuery, filterStatus, filterPath],
    queryFn: () => ppdbApi.getAll(resolvedTenantId!, { 
      page: currentPage, 
      limit: itemsPerPage,
      search: searchQuery || undefined,
      status: filterStatus || undefined,
      registrationPath: filterPath || undefined,
    }),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['ppdb-statistics', resolvedTenantId],
    queryFn: () => ppdbApi.getStatistics(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: interviewSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['ppdb-interview-schedules', resolvedTenantId],
    queryFn: () => ppdbApi.getInterviewSchedules(resolvedTenantId!),
    enabled: !!resolvedTenantId && activeTab === 'schedules',
  });

  const { data: analytics } = useQuery({
    queryKey: ['ppdb-analytics', resolvedTenantId],
    queryFn: () => ppdbApi.getAnalytics(resolvedTenantId!),
    enabled: !!resolvedTenantId && activeTab === 'analytics',
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => {
      if (!resolvedTenantId) throw new Error('Tenant ID tidak tersedia.');
      return ppdbApi.createInterviewSchedule(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-interview-schedules', resolvedTenantId] });
      setIsScheduleModalOpen(false);
      setScheduleFormData({
        scheduleDate: '',
        startTime: '',
        endTime: '',
        maxParticipants: '1',
        location: '',
        notes: '',
      });
      success('Jadwal wawancara berhasil dibuat');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal membuat jadwal wawancara');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PpdbApplicationCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.create(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Pendaftaran berhasil ditambahkan');
    },
    onError: () => {
      showError('Gagal menambahkan pendaftaran');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PpdbApplicationCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.update(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      setIsModalOpen(false);
      setSelectedApplication(null);
      resetForm();
      success('Pendaftaran berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate pendaftaran');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: RegistrationStatus; notes?: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.updateStatus(resolvedTenantId, id, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['ppdb-statistics', resolvedTenantId] });
      success('Status pendaftaran berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate status pendaftaran');
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { selectionScore?: number; interviewScore?: number; documentScore?: number } }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.update(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      setIsScoreModalOpen(false);
      setScoreData({ selectionScore: '', interviewScore: '', documentScore: '' });
      success('Skor berhasil diupdate');
    },
    onError: () => {
      showError('Gagal mengupdate skor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.delete(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
      success('Pendaftaran berhasil dihapus');
    },
    onError: () => {
      showError('Gagal menghapus pendaftaran');
    },
  });

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentNisn: '',
      studentNik: '',
      birthPlace: '',
      birthDate: '',
      gender: 'male',
      religion: '',
      address: '',
      phone: '',
      email: '',
      parentName: '',
      parentPhone: '',
      parentOccupation: '',
      parentIncome: 0,
      previousSchool: '',
      previousSchoolAddress: '',
      registrationPath: 'zonasi',
      notes: '',
    });
    setSelectedApplication(null);
  };

  const handleEdit = (application: PpdbApplication) => {
    setSelectedApplication(application);
    setFormData({
      studentName: application.studentName,
      studentNisn: application.studentNisn,
      studentNik: application.studentNik,
      birthPlace: application.birthPlace,
      birthDate: application.birthDate ? application.birthDate.split('T')[0] : '',
      gender: application.gender,
      religion: application.religion,
      address: application.address,
      phone: application.phone || '',
      email: application.email || '',
      parentName: application.parentName,
      parentPhone: application.parentPhone,
      parentOccupation: application.parentOccupation,
      parentIncome: application.parentIncome,
      previousSchool: application.previousSchool,
      previousSchoolAddress: application.previousSchoolAddress,
      registrationPath: application.registrationPath,
      notes: application.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleViewDetail = (application: PpdbApplication) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleOpenScoreModal = (application: PpdbApplication) => {
    setSelectedApplication(application);
    setScoreData({
      selectionScore: application.selectionScore?.toString() || '',
      interviewScore: application.interviewScore?.toString() || '',
      documentScore: application.documentScore?.toString() || '',
    });
    setIsScoreModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedApplication) {
      updateMutation.mutate({ id: selectedApplication.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleStatusChange = (id: number, status: RegistrationStatus) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    let notes = '';
    if (status === 'rejected') {
      notes = prompt('Alasan penolakan (opsional):') || '';
    }
    if (confirm(`Apakah Anda yakin ingin mengubah status menjadi ${getStatusLabel(status)}?`)) {
      updateStatusMutation.mutate({ id, status, notes: notes || undefined });
    }
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication || !resolvedTenantId) {
      showError('Data tidak valid');
      return;
    }
    updateScoreMutation.mutate({
      id: selectedApplication.id,
      data: {
        selectionScore: scoreData.selectionScore ? parseFloat(scoreData.selectionScore) : undefined,
        interviewScore: scoreData.interviewScore ? parseFloat(scoreData.interviewScore) : undefined,
        documentScore: scoreData.documentScore ? parseFloat(scoreData.documentScore) : undefined,
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus pendaftaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    console.log(`Exporting to ${format}...`);
    success(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const handleDownloadCertificate = async (id: number) => {
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }

    try {
      const blob = await ppdbApi.downloadCertificateById(resolvedTenantId, id);
      const application = data?.data?.find((app) => app.id === id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bukti-Pendaftaran-${application?.registrationNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Bukti pendaftaran berhasil didownload');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mendownload bukti pendaftaran');
    }
  };

  const verifyDocumentMutation = useMutation({
    mutationFn: ({ id, documentType, status, rejectionReason }: { 
      id: number; 
      documentType: string; 
      status: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    }) => {
      if (!resolvedTenantId) throw new Error('Tenant ID tidak tersedia.');
      return ppdbApi.verifyDocument(resolvedTenantId, id, documentType, status, rejectionReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-registrations', resolvedTenantId] });
      setIsVerifyModalOpen(false);
      setSelectedDocument(null);
      setVerifyRejectionReason('');
      success('Status verifikasi dokumen berhasil diupdate');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal memverifikasi dokumen');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { 
      id: number; 
      status: 'verified' | 'rejected';
      rejectionReason?: string;
    }) => {
      if (!resolvedTenantId) throw new Error('Tenant ID tidak tersedia.');
      return ppdbApi.verifyPayment(resolvedTenantId, id, status, rejectionReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-registrations', resolvedTenantId] });
      setIsRejectPaymentModalOpen(false);
      setSelectedPaymentId(null);
      setPaymentRejectionReason('');
      success('Status verifikasi pembayaran berhasil diupdate');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal memverifikasi pembayaran');
    },
  });

  const handleOpenVerifyModal = (documentType: string, documentName: string) => {
    setSelectedDocument({ type: documentType, name: documentName });
    setIsVerifyModalOpen(true);
    setVerifyRejectionReason('');
  };

  const handleVerifyDocument = (status: 'verified' | 'rejected') => {
    if (!selectedApplication || !selectedDocument || !resolvedTenantId) return;
    
    if (status === 'rejected' && !verifyRejectionReason.trim()) {
      showError('Alasan penolakan wajib diisi');
      return;
    }

    verifyDocumentMutation.mutate({
      id: selectedApplication.id,
      documentType: selectedDocument.type,
      status,
      rejectionReason: status === 'rejected' ? verifyRejectionReason : undefined,
    });
  };

  const handleVerifyPayment = (id: number, status: 'verified' | 'rejected') => {
    if (status === 'rejected') {
      handleOpenRejectPaymentModal(id);
    } else {
      verifyPaymentMutation.mutate({ id, status });
    }
  };

  const handleOpenRejectPaymentModal = (id: number) => {
    setSelectedPaymentId(id);
    setIsRejectPaymentModalOpen(true);
    setPaymentRejectionReason('');
  };

  const handleRejectPayment = () => {
    if (!selectedPaymentId || !paymentRejectionReason.trim()) {
      showError('Alasan penolakan wajib diisi');
      return;
    }

    verifyPaymentMutation.mutate({
      id: selectedPaymentId,
      status: 'rejected',
      rejectionReason: paymentRejectionReason,
    });
  };

  const handleViewDocument = (url: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    window.open(`${apiUrl}${url}`, '_blank');
  };

  const getDocumentVerificationStatus = (doc: any): { status: string; badge: JSX.Element } => {
    const status = doc?.verificationStatus || 'pending';
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      verified: { label: 'Terverifikasi', className: 'bg-green-100 text-green-800', icon: Check },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800', icon: X },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    const Icon = statusInfo.icon;
    return {
      status,
      badge: (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
          <Icon className="w-3 h-3 mr-1" /> {statusInfo.label}
        </span>
      ),
    };
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const statusMap: Record<RegistrationStatus, { label: string; className: string }> = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      registered: { label: 'Terdaftar', className: 'bg-blue-100 text-blue-800' },
      selection: { label: 'Seleksi', className: 'bg-purple-100 text-purple-800' },
      announced: { label: 'Diumumkan', className: 'bg-indigo-100 text-indigo-800' },
      accepted: { label: 'Diterima', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getStatusLabel = (status: RegistrationStatus): string => {
    const labels: Record<RegistrationStatus, string> = {
      pending: 'Menunggu',
      registered: 'Terdaftar',
      selection: 'Seleksi',
      announced: 'Diumumkan',
      accepted: 'Diterima',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const getPathLabel = (path: RegistrationPath): string => {
    const labels: Record<RegistrationPath, string> = {
      zonasi: 'Zonasi',
      affirmative: 'Afirmasi',
      transfer: 'Pindahan',
      achievement: 'Prestasi',
      academic: 'Akademik',
    };
    return labels[path] || path;
  };

  const totalPages = data?.totalPages || 1;

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">PPDB / SPMB</h1>
            <p className="text-gray-600 mt-1">Penerimaan Peserta Didik Baru</p>
          </div>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="ppdb" />
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Pendaftaran
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              theme="cyan"
              label="Total Pendaftar"
              value={statistics.total}
              icon={<FileText className="w-6 h-6" />}
            />
            <StatCard
              theme="green"
              label="Diterima"
              value={statistics.byStatus?.accepted || 0}
              icon={<CheckCircle className="w-6 h-6" />}
            />
            <StatCard
              theme="yellow"
              label="Menunggu"
              value={statistics.byStatus?.pending || 0}
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              theme="red"
              label="Ditolak"
              value={statistics.byStatus?.rejected || 0}
              icon={<XCircle className="w-6 h-6" />}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pendaftaran
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Jadwal Wawancara
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'registrations' && (
          <>
            {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="Cari nama, NISN, atau nomor pendaftaran..."
              />
            </div>
            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RegistrationStatus | '')}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'pending', label: 'Menunggu' },
                { value: 'registered', label: 'Terdaftar' },
                { value: 'selection', label: 'Seleksi' },
                { value: 'announced', label: 'Diumumkan' },
                { value: 'accepted', label: 'Diterima' },
                { value: 'rejected', label: 'Ditolak' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
            <Select
              label="Jalur Pendaftaran"
              value={filterPath}
              onChange={(e) => setFilterPath(e.target.value as RegistrationPath | '')}
              options={[
                { value: '', label: 'Semua Jalur' },
                { value: 'zonasi', label: 'Zonasi' },
                { value: 'affirmative', label: 'Afirmasi' },
                { value: 'transfer', label: 'Pindahan' },
                { value: 'achievement', label: 'Prestasi' },
                { value: 'academic', label: 'Akademik' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data?.data?.length && data?.data?.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(data?.data?.map((app: PpdbApplication) => app.id) || []);
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedIds.length > 0 ? `${selectedIds.length} dipilih` : 'Pilih semua'}
                  </span>
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkOperation('status');
                        setIsBulkModalOpen(true);
                      }}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkOperation('export');
                        setIsBulkModalOpen(true);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkOperation('notification');
                        setIsBulkModalOpen(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Notifikasi
                    </Button>
                  </div>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === data?.data?.length && data?.data?.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(data?.data?.map((app: PpdbApplication) => app.id) || []);
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </TableHead>
                    <TableHead>No. Pendaftaran</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead>Skor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, application.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== application.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{application.registrationNumber}</TableCell>
                      <TableCell className="font-medium">{application.studentName}</TableCell>
                      <TableCell>{application.studentNisn}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getPathLabel(application.registrationPath)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {application.totalScore !== null && application.totalScore !== undefined
                          ? application.totalScore.toFixed(2)
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1 flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(application)}
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenScoreModal(application)}
                            title="Input Skor"
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(application.id)}
                            title="Download Bukti"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(application)}
                            title="Edit"
                          >
                            Edit
                          </Button>
                          <select
                            className="text-xs px-2 py-1 border rounded"
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value as RegistrationStatus)}
                            title="Ubah Status"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="registered">Terdaftar</option>
                            <option value="selection">Seleksi</option>
                            <option value="announced">Diumumkan</option>
                            <option value="accepted">Diterima</option>
                            <option value="rejected">Ditolak</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(application.id)}
                            title="Hapus"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data pendaftaran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedApplication ? 'Edit Pendaftaran' : 'Tambah Pendaftaran'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-gray-800">Data Siswa</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentSearchData({ nisn: '', sourceTenantNpsn: '' });
                    setFoundStudent(null);
                    setIsSearchStudentModalOpen(true);
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Cari dari Sekolah Lain
                </Button>
              </div>

              {foundStudent && (
                <div className={`p-4 rounded-lg border ${
                  foundStudent.isEligible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {foundStudent.isEligible ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        foundStudent.isEligible ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {foundStudent.eligibilityReason}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Dari: {foundStudent.sourceTenant.name} ({foundStudent.sourceTenant.npsn})
                      </p>
                      {foundStudent.isEligible && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const student = foundStudent.student;
                            setFormData({
                              ...formData,
                              studentName: student.name || formData.studentName,
                              studentNisn: student.nisn || formData.studentNisn,
                              studentNik: student.nik || formData.studentNik,
                              birthPlace: student.birthPlace || formData.birthPlace,
                              birthDate: student.birthDate || formData.birthDate,
                              gender: (student.gender === 'male' || student.gender === 'laki-laki') ? 'male' : 
                                      (student.gender === 'female' || student.gender === 'perempuan') ? 'female' : formData.gender,
                              religion: student.religion || formData.religion,
                              address: student.address || formData.address,
                              phone: student.phone || formData.phone,
                              email: student.email || formData.email,
                              parentName: student.parentName || formData.parentName,
                              parentPhone: student.parentPhone || formData.parentPhone,
                              parentOccupation: student.parentOccupation || formData.parentOccupation,
                              parentIncome: student.parentIncome || formData.parentIncome,
                              previousSchool: student.previousSchool || formData.previousSchool,
                              previousSchoolAddress: student.previousSchoolAddress || formData.previousSchoolAddress,
                            });
                            success('Data siswa berhasil diisi otomatis');
                          }}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Gunakan Data Ini
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentNisn}
                    onChange={(e) => setFormData({ ...formData, studentNisn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentNik}
                    onChange={(e) => setFormData({ ...formData, studentNik: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    options={[
                      { value: 'male', label: 'Laki-laki' },
                      { value: 'female', label: 'Perempuan' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jalur Pendaftaran <span className="text-red-500">*</span></label>
                  <Select
                    value={formData.registrationPath}
                    onChange={(e) => setFormData({ ...formData, registrationPath: e.target.value as RegistrationPath })}
                    options={[
                      { value: 'zonasi', label: 'Zonasi' },
                      { value: 'affirmative', label: 'Afirmasi' },
                      { value: 'transfer', label: 'Pindahan' },
                      { value: 'achievement', label: 'Prestasi' },
                      { value: 'academic', label: 'Akademik' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 border-b pb-2 mt-6">Data Orang Tua</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pekerjaan Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentOccupation}
                    onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penghasilan Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.parentIncome}
                    onChange={(e) => setFormData({ ...formData, parentIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 border-b pb-2 mt-6">Data Sekolah Sebelumnya</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Sekolah Sebelumnya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Sekolah Sebelumnya <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.previousSchoolAddress}
                  onChange={(e) => setFormData({ ...formData, previousSchoolAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
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
              >
                {selectedApplication ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedApplication(null);
          }}
          title={`Detail Pendaftaran - ${selectedApplication?.registrationNumber}`}
          size="xl"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">No. Pendaftaran</label>
                  <p className="text-gray-900 font-mono">{selectedApplication.registrationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Data Siswa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                    <p className="text-gray-900">{selectedApplication.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NISN</label>
                    <p className="text-gray-900">{selectedApplication.studentNisn}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NIK</label>
                    <p className="text-gray-900">{selectedApplication.studentNik}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                    <p className="text-gray-900">{selectedApplication.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tempat, Tanggal Lahir</label>
                    <p className="text-gray-900">{selectedApplication.birthPlace}, {formatDate(selectedApplication.birthDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Agama</label>
                    <p className="text-gray-900">{selectedApplication.religion}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Alamat</label>
                    <p className="text-gray-900">{selectedApplication.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedApplication.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telepon</label>
                    <p className="text-gray-900">{selectedApplication.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jalur Pendaftaran</label>
                    <p className="text-gray-900">{getPathLabel(selectedApplication.registrationPath)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Data Orang Tua</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Orang Tua</label>
                    <p className="text-gray-900">{selectedApplication.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telepon</label>
                    <p className="text-gray-900">{selectedApplication.parentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pekerjaan</label>
                    <p className="text-gray-900">{selectedApplication.parentOccupation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Penghasilan</label>
                    <p className="text-gray-900">Rp {selectedApplication.parentIncome.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Data Sekolah Sebelumnya</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Sekolah</label>
                    <p className="text-gray-900">{selectedApplication.previousSchool}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alamat Sekolah</label>
                    <p className="text-gray-900">{selectedApplication.previousSchoolAddress}</p>
                  </div>
                </div>
              </div>

              {(selectedApplication.selectionScore !== null || selectedApplication.interviewScore !== null || selectedApplication.documentScore !== null) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Skor Seleksi</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Skor Seleksi</label>
                      <p className="text-gray-900 text-lg font-semibold">{selectedApplication.selectionScore?.toFixed(2) || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Skor Wawancara</label>
                      <p className="text-gray-900 text-lg font-semibold">{selectedApplication.interviewScore?.toFixed(2) || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Skor Dokumen</label>
                      <p className="text-gray-900 text-lg font-semibold">{selectedApplication.documentScore?.toFixed(2) || '-'}</p>
                    </div>
                    <div className="col-span-3">
                      <label className="text-sm font-medium text-gray-600">Total Skor</label>
                      <p className="text-gray-900 text-2xl font-bold">{selectedApplication.totalScore?.toFixed(2) || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Pembayaran */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Status Pembayaran</h4>
                  {selectedApplication.paymentReceipt && !selectedApplication.paymentStatus && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 border-green-300"
                        onClick={() => handleVerifyPayment(selectedApplication.id, 'verified')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Verifikasi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 border-red-300"
                        onClick={() => handleOpenRejectPaymentModal(selectedApplication.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
                
                {selectedApplication.paymentStatus ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Pembayaran Terverifikasi</p>
                        {selectedApplication.paymentAmount && (
                          <p className="text-xs text-green-700">
                            Jumlah: Rp {selectedApplication.paymentAmount.toLocaleString('id-ID')}
                          </p>
                        )}
                        {selectedApplication.paymentDate && (
                          <p className="text-xs text-green-600">
                            Tanggal: {formatDate(selectedApplication.paymentDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedApplication.paymentReceipt ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <p className="text-sm font-medium text-yellow-800">Menunggu Verifikasi</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(selectedApplication.paymentReceipt!)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat Bukti
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Belum ada bukti pembayaran</p>
                  </div>
                )}
              </div>

              {selectedApplication.notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600">Catatan</label>
                  <p className="text-gray-900">{selectedApplication.notes}</p>
                </div>
              )}

              {/* Dokumen Pendukung dengan Verifikasi */}
              {selectedApplication.documents && Object.keys(selectedApplication.documents).length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Dokumen Pendukung</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(selectedApplication.documents).map(([type, doc]: [string, any]) => {
                      const { badge } = getDocumentVerificationStatus(doc);
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {type.replace(/_/g, ' ')}
                                </p>
                                {badge}
                              </div>
                              <p className="text-xs text-gray-500">
                                {doc.originalName || doc.filename}
                              </p>
                              {doc.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  <strong>Alasan:</strong> {doc.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(doc.url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenVerifyModal(type, type.replace(/_/g, ' '))}
                              className="bg-green-50 hover:bg-green-100 border-green-300"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">Tanggal Pendaftaran</label>
                <p className="text-gray-900">{formatDate(selectedApplication.registrationDate)}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Verify Document Modal */}
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => {
            setIsVerifyModalOpen(false);
            setSelectedDocument(null);
            setVerifyRejectionReason('');
          }}
          title={`Verifikasi Dokumen - ${selectedDocument?.name}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Pilih status verifikasi untuk dokumen <strong>{selectedDocument?.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border-green-300"
                onClick={() => handleVerifyDocument('verified')}
                loading={verifyDocumentMutation.isPending}
              >
                <Check className="w-4 h-4" />
                Setujui Dokumen
              </Button>

              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tolak Dokumen
                </label>
                <textarea
                  value={verifyRejectionReason}
                  onChange={(e) => setVerifyRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan dokumen..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  variant="outline"
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border-red-300"
                  onClick={() => handleVerifyDocument('rejected')}
                  loading={verifyDocumentMutation.isPending}
                  disabled={!verifyRejectionReason.trim()}
                >
                  <X className="w-4 h-4" />
                  Tolak Dokumen
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Reject Payment Modal */}
        <Modal
          isOpen={isRejectPaymentModalOpen}
          onClose={() => {
            setIsRejectPaymentModalOpen(false);
            setSelectedPaymentId(null);
            setPaymentRejectionReason('');
          }}
          title="Tolak Pembayaran"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={paymentRejectionReason}
                onChange={(e) => setPaymentRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan pembayaran..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRejectPaymentModalOpen(false);
                  setSelectedPaymentId(null);
                  setPaymentRejectionReason('');
                }}
                disabled={verifyPaymentMutation.isPending}
              >
                Batal
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-300"
                onClick={handleRejectPayment}
                loading={verifyPaymentMutation.isPending}
                disabled={!paymentRejectionReason.trim()}
              >
                <X className="w-4 h-4 mr-2" />
                Tolak Pembayaran
              </Button>
            </div>
          </div>
        </Modal>

          </>
        )}

        {/* Score Input Modal */}
        <Modal
          isOpen={isScoreModalOpen}
          onClose={() => {
            setIsScoreModalOpen(false);
            setSelectedApplication(null);
            setScoreData({ selectionScore: '', interviewScore: '', documentScore: '' });
          }}
          title={`Input Skor - ${selectedApplication?.studentName}`}
          size="md"
        >
          <form onSubmit={handleScoreSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skor Seleksi</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={scoreData.selectionScore}
                  onChange={(e) => setScoreData({ ...scoreData, selectionScore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skor Wawancara</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={scoreData.interviewScore}
                  onChange={(e) => setScoreData({ ...scoreData, interviewScore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skor Dokumen</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={scoreData.documentScore}
                  onChange={(e) => setScoreData({ ...scoreData, documentScore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              {scoreData.selectionScore || scoreData.interviewScore || scoreData.documentScore ? (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">Total Skor</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {(
                      (parseFloat(scoreData.selectionScore) || 0) +
                      (parseFloat(scoreData.interviewScore) || 0) +
                      (parseFloat(scoreData.documentScore) || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsScoreModalOpen(false);
                  setSelectedApplication(null);
                  setScoreData({ selectionScore: '', interviewScore: '', documentScore: '' });
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={updateScoreMutation.isPending}
              >
                Simpan Skor
              </Button>
            </div>
          </form>
        </Modal>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                theme="cyan"
                label="Total Pendaftar"
                value={analytics.byStatus ? Object.values(analytics.byStatus).reduce((a: number, b: number) => a + b, 0) : 0}
                icon={<FileText className="w-6 h-6" />}
              />
              <StatCard
                theme="green"
                label="Pembayaran Terverifikasi"
                value={analytics.paymentStats.verified}
                icon={<CheckCircle className="w-6 h-6" />}
              />
              <StatCard
                theme="yellow"
                label="Dokumen Terverifikasi"
                value={analytics.documentStats.verified}
                icon={<CheckCircle className="w-6 h-6" />}
              />
              <StatCard
                theme="blue"
                label="Diterima"
                value={analytics.byStatus?.accepted || 0}
                icon={<Award className="w-6 h-6" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pendaftaran Harian</h3>
                {analytics.daily && analytics.daily.length > 0 ? (
                  <LineChartComponent
                    data={analytics.daily.map(item => ({
                      name: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                      count: item.count,
                    }))}
                    dataKey="count"
                    height={300}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                )}
              </div>

              {/* Monthly Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pendaftaran Bulanan</h3>
                {analytics.monthly && analytics.monthly.length > 0 ? (
                  <BarChartComponent
                    data={analytics.monthly.map(item => ({
                      name: new Date(item.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
                      count: item.count,
                    }))}
                    dataKey="count"
                    height={300}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                )}
              </div>

              {/* By Path Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Jalur Pendaftaran</h3>
                {analytics.byPath && Object.keys(analytics.byPath).length > 0 ? (
                  <PieChartComponent
                    data={Object.entries(analytics.byPath).map(([path, count]) => ({
                      name: path === 'zonasi' ? 'Zonasi' :
                            path === 'affirmative' ? 'Afirmasi' :
                            path === 'transfer' ? 'Pindahan' :
                            path === 'achievement' ? 'Prestasi' :
                            path === 'academic' ? 'Akademik' : path,
                      value: count as number,
                    }))}
                    dataKey="value"
                    height={300}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                )}
              </div>

              {/* By Status Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Status</h3>
                {analytics.byStatus && Object.keys(analytics.byStatus).length > 0 ? (
                  <PieChartComponent
                    data={Object.entries(analytics.byStatus).map(([status, count]) => ({
                      name: getStatusLabel(status as RegistrationStatus),
                      value: count as number,
                    }))}
                    dataKey="value"
                    height={300}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                )}
              </div>
            </div>

            {/* Payment & Document Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Pembayaran</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">{analytics.paymentStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Terverifikasi</span>
                    <span className="font-semibold text-green-600">{analytics.paymentStats.verified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600">Menunggu Verifikasi</span>
                    <span className="font-semibold text-yellow-600">{analytics.paymentStats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Belum Bayar</span>
                    <span className="font-semibold text-gray-600">{analytics.paymentStats.unpaid}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Dokumen</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Dokumen</span>
                    <span className="font-semibold">{analytics.documentStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Terverifikasi</span>
                    <span className="font-semibold text-green-600">{analytics.documentStats.verified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600">Menunggu Verifikasi</span>
                    <span className="font-semibold text-yellow-600">{analytics.documentStats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Ditolak</span>
                    <span className="font-semibold text-red-600">{analytics.documentStats.rejected}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Operations Modal */}
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => {
            setIsBulkModalOpen(false);
            setBulkFormData({
              status: '',
              notes: '',
              exportFormat: 'excel',
              notificationSubject: '',
              notificationMessage: '',
            });
          }}
          title={
            bulkOperation === 'status' ? 'Bulk Update Status' :
            bulkOperation === 'export' ? 'Export Data' :
            bulkOperation === 'notification' ? 'Kirim Notifikasi Massal' :
            'Bulk Operations'
          }
          size="md"
        >
          {bulkOperation === 'status' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Update status untuk <strong>{selectedIds.length}</strong> pendaftaran
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Baru <span className="text-red-500">*</span>
                </label>
                <Select
                  value={bulkFormData.status}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, status: e.target.value })}
                  options={[
                    { value: '', label: 'Pilih Status' },
                    { value: 'pending', label: 'Menunggu' },
                    { value: 'registered', label: 'Terdaftar' },
                    { value: 'selection', label: 'Seleksi' },
                    { value: 'announced', label: 'Diumumkan' },
                    { value: 'accepted', label: 'Diterima' },
                    { value: 'rejected', label: 'Ditolak' },
                    { value: 'cancelled', label: 'Dibatalkan' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (opsional)
                </label>
                <textarea
                  value={bulkFormData.notes}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan untuk perubahan status"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={async () => {
                    if (!bulkFormData.status) {
                      showError('Status wajib diisi');
                      return;
                    }
                    try {
                      const result = await ppdbApi.bulkUpdateStatus(
                        resolvedTenantId!,
                        selectedIds,
                        bulkFormData.status,
                        bulkFormData.notes
                      );
                      success(`Berhasil update ${result.updated} pendaftaran. Gagal: ${result.failed}`);
                      queryClient.invalidateQueries({ queryKey: ['ppdb', resolvedTenantId] });
                      setSelectedIds([]);
                      setIsBulkModalOpen(false);
                    } catch (err: any) {
                      showError(err?.response?.data?.message || 'Gagal update status');
                    }
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}

          {bulkOperation === 'export' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Export <strong>{selectedIds.length}</strong> pendaftaran
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format <span className="text-red-500">*</span>
                </label>
                <Select
                  value={bulkFormData.exportFormat}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, exportFormat: e.target.value })}
                  options={[
                    { value: 'excel', label: 'Excel (CSV)' },
                    { value: 'pdf', label: 'PDF' },
                  ]}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const blob = await ppdbApi.bulkExport(resolvedTenantId!, {
                        registrationIds: selectedIds,
                        format: bulkFormData.exportFormat as 'excel' | 'pdf',
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ppdb-export-${Date.now()}.${bulkFormData.exportFormat === 'pdf' ? 'pdf' : 'csv'}`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      success('Data berhasil diexport');
                      setIsBulkModalOpen(false);
                    } catch (err: any) {
                      showError(err?.response?.data?.message || 'Gagal export data');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          )}

          {bulkOperation === 'notification' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Kirim notifikasi ke <strong>{selectedIds.length}</strong> pendaftar
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjek Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bulkFormData.notificationSubject}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, notificationSubject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subjek email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkFormData.notificationMessage}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, notificationMessage: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Isi pesan yang akan dikirim ke pendaftar"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={async () => {
                    if (!bulkFormData.notificationSubject || !bulkFormData.notificationMessage) {
                      showError('Subjek dan pesan wajib diisi');
                      return;
                    }
                    try {
                      const result = await ppdbApi.bulkSendNotification(
                        resolvedTenantId!,
                        selectedIds,
                        bulkFormData.notificationSubject,
                        bulkFormData.notificationMessage
                      );
                      success(`Notifikasi berhasil dikirim ke ${result.sent} pendaftar. Gagal: ${result.failed}`);
                      setSelectedIds([]);
                      setIsBulkModalOpen(false);
                    } catch (err: any) {
                      showError(err?.response?.data?.message || 'Gagal mengirim notifikasi');
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Notifikasi
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Search Student Modal */}
        <Modal
          isOpen={isSearchStudentModalOpen}
          onClose={() => {
            setIsSearchStudentModalOpen(false);
            setStudentSearchData({ nisn: '', sourceTenantNpsn: '' });
            setFoundStudent(null);
          }}
          title="Cari Siswa dari Sekolah Lain"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NPSN Sekolah Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentSearchData.sourceTenantNpsn}
                onChange={(e) => setStudentSearchData({ ...studentSearchData, sourceTenantNpsn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan NPSN sekolah asal (SD/SMP)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: 12345678 (8 digit NPSN)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NISN Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentSearchData.nisn}
                onChange={(e) => setStudentSearchData({ ...studentSearchData, nisn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan NISN siswa"
                required
              />
            </div>

            {foundStudent && (
              <div className={`p-4 rounded-lg border ${
                foundStudent.isEligible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2">
                  {foundStudent.isEligible ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      foundStudent.isEligible ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {foundStudent.eligibilityReason}
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                      <p><strong>Nama:</strong> {foundStudent.student.name}</p>
                      <p><strong>NISN:</strong> {foundStudent.student.nisn}</p>
                      <p><strong>Sekolah Asal:</strong> {foundStudent.sourceTenant.name}</p>
                      <p><strong>Jenjang:</strong> {foundStudent.sourceTenant.level}</p>
                      <p><strong>Kelas:</strong> {foundStudent.student.currentGrade || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsSearchStudentModalOpen(false);
                  setStudentSearchData({ nisn: '', sourceTenantNpsn: '' });
                  setFoundStudent(null);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!studentSearchData.nisn || !studentSearchData.sourceTenantNpsn) {
                    showError('NISN dan NPSN wajib diisi');
                    return;
                  }
                  setIsSearchingStudent(true);
                  try {
                    const result = await ppdbApi.searchStudentFromOtherTenant(
                      resolvedTenantId!,
                      studentSearchData.nisn,
                      studentSearchData.sourceTenantNpsn
                    );
                    setFoundStudent(result);
                    if (!result.isEligible) {
                      showError(result.eligibilityReason);
                    }
                  } catch (err: any) {
                    showError(err?.response?.data?.message || 'Gagal mencari siswa');
                    setFoundStudent(null);
                  } finally {
                    setIsSearchingStudent(false);
                  }
                }}
                loading={isSearchingStudent}
              >
                <Search className="w-4 h-4 mr-2" />
                Cari
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </TenantLayout>
  );
}

