'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { ppdbApi, PpdbApplication, PpdbApplicationCreateData, RegistrationStatus, RegistrationPath } from '@/lib/api/ppdb';
import { useToastStore } from '@/lib/store/toast';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils/date';
import { CheckCircle, XCircle, Clock, FileText, AlertCircle, LogOut, Upload, Download, X, Eye, Check, AlertTriangle } from 'lucide-react';

export default function PpdbDashboardPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const { user, logout } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'transfer',
    reference: '',
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

  const queryClient = useQueryClient();

  const { data: registration, isLoading } = useQuery({
    queryKey: ['ppdb-my-registration', resolvedTenantId],
    queryFn: () => ppdbApi.getMyRegistration(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const { data: availableSchedules } = useQuery({
    queryKey: ['ppdb-available-schedules', resolvedTenantId],
    queryFn: () => ppdbApi.getAvailableSchedules(resolvedTenantId!),
    enabled: !!resolvedTenantId,
  });

  const { data: mySchedule } = useQuery({
    queryKey: ['ppdb-my-interview-schedule', resolvedTenantId],
    queryFn: () => ppdbApi.getMyInterviewSchedule(resolvedTenantId!),
    enabled: !!resolvedTenantId,
  });

  const bookScheduleMutation = useMutation({
    mutationFn: (scheduleId: number) => {
      if (!resolvedTenantId) throw new Error('Tenant ID tidak tersedia.');
      return ppdbApi.bookInterviewSchedule(resolvedTenantId, scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-my-interview-schedule', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['ppdb-available-schedules', resolvedTenantId] });
      success('Jadwal wawancara berhasil dipesan. Notifikasi telah dikirim ke email Anda.');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal memesan jadwal wawancara');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PpdbApplicationCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.createMyRegistration(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-my-registration', resolvedTenantId] });
      setIsFormModalOpen(false);
      resetForm();
      success('Data pendaftaran berhasil disimpan');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menyimpan data pendaftaran');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PpdbApplicationCreateData>) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.updateMyRegistration(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-my-registration', resolvedTenantId] });
      setIsFormModalOpen(false);
      resetForm();
      success('Data pendaftaran berhasil diupdate');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupdate data pendaftaran');
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.uploadDocument(resolvedTenantId, file, documentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-my-registration', resolvedTenantId] });
      setIsUploadModalOpen(false);
      setSelectedDocumentType('');
      success('Dokumen berhasil diupload');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupload dokumen');
    },
  });

  const uploadPaymentMutation = useMutation({
    mutationFn: ({ file, ...data }: { file: File; paymentAmount: number; paymentMethod?: string; paymentReference?: string; notes?: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return ppdbApi.uploadPayment(
        resolvedTenantId,
        file,
        data.paymentAmount,
        data.paymentMethod,
        data.paymentReference,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-my-registration', resolvedTenantId] });
      setIsPaymentModalOpen(false);
      setPaymentData({ amount: '', method: 'transfer', reference: '', notes: '' });
      success('Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengupload bukti pembayaran');
    },
  });

  useEffect(() => {
    if (registration) {
      setFormData({
        studentName: registration.studentName,
        studentNisn: registration.studentNisn,
        studentNik: registration.studentNik,
        birthPlace: registration.birthPlace,
        birthDate: registration.birthDate ? registration.birthDate.split('T')[0] : '',
        gender: registration.gender,
        religion: registration.religion,
        address: registration.address,
        phone: registration.phone || '',
        email: registration.email || '',
        parentName: registration.parentName,
        parentPhone: registration.parentPhone,
        parentOccupation: registration.parentOccupation,
        parentIncome: registration.parentIncome,
        previousSchool: registration.previousSchool,
        previousSchoolAddress: registration.previousSchoolAddress,
        registrationPath: registration.registrationPath,
        notes: registration.notes || '',
      });
    }
  }, [registration]);

  const resetForm = () => {
    if (registration) {
      setFormData({
        studentName: registration.studentName,
        studentNisn: registration.studentNisn,
        studentNik: registration.studentNik,
        birthPlace: registration.birthPlace,
        birthDate: registration.birthDate ? registration.birthDate.split('T')[0] : '',
        gender: registration.gender,
        religion: registration.religion,
        address: registration.address,
        phone: registration.phone || '',
        email: registration.email || '',
        parentName: registration.parentName,
        parentPhone: registration.parentPhone,
        parentOccupation: registration.parentOccupation,
        parentIncome: registration.parentIncome,
        previousSchool: registration.previousSchool,
        previousSchoolAddress: registration.previousSchoolAddress,
        registrationPath: registration.registrationPath,
        notes: registration.notes || '',
      });
    } else {
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      showError('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (registration) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/ppdb/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocumentType || !resolvedTenantId) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocumentMutation.mutateAsync({ file, documentType: selectedDocumentType });
    } catch (error) {
      // Error sudah di-handle di mutation
    } finally {
      setIsUploading(false);
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDownloadCertificate = async () => {
    if (!resolvedTenantId) {
      showError('Tenant ID tidak tersedia');
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await ppdbApi.downloadCertificate(resolvedTenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bukti-Pendaftaran-${registration?.registrationNumber || 'PPDB'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Bukti pendaftaran berhasil didownload');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mendownload bukti pendaftaran');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewDocument = (url: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    window.open(`${apiUrl}${url}`, '_blank');
  };

  const handleRemoveDocument = async (documentType: string) => {
    if (!registration || !resolvedTenantId) return;
    
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    const documents = { ...registration.documents };
    delete documents[documentType];

    try {
      await updateMutation.mutateAsync({ documents });
      success('Dokumen berhasil dihapus');
    } catch (error) {
      // Error sudah di-handle di mutation
    }
  };

  const handlePaymentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resolvedTenantId) {
      return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      showError('Jumlah pembayaran wajib diisi');
      return;
    }

    setIsUploading(true);
    try {
      await uploadPaymentMutation.mutateAsync({
        file,
        paymentAmount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.method,
        paymentReference: paymentData.reference,
        notes: paymentData.notes,
      });
    } catch (error) {
      // Error sudah di-handle di mutation
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const statusMap: Record<RegistrationStatus, { label: string; className: string; icon: any }> = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      registered: { label: 'Terdaftar', className: 'bg-blue-100 text-blue-800', icon: FileText },
      selection: { label: 'Seleksi', className: 'bg-purple-100 text-purple-800', icon: AlertCircle },
      announced: { label: 'Diumumkan', className: 'bg-indigo-100 text-indigo-800', icon: AlertCircle },
      accepted: { label: 'Diterima', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = statusInfo.icon;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 ${statusInfo.className}`}>
        <Icon className="w-4 h-4" />
        {statusInfo.label}
      </span>
    );
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard PPDB</h1>
              <p className="text-sm text-gray-600">Selamat datang, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {registration ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Status Pendaftaran</h2>
                  <div className="mb-4">{getStatusBadge(registration.status)}</div>
                  <p className="text-sm text-gray-600">
                    No. Pendaftaran: <span className="font-mono font-semibold">{registration.registrationNumber}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadCertificate}
                    loading={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Bukti
                  </Button>
                  {(registration.status === 'pending' || registration.status === 'registered') && (
                    <>
                      <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Dokumen
                      </Button>
                      <Button onClick={() => setIsFormModalOpen(true)}>
                        Edit Data
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Data Pendaftaran */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pendaftaran</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <p className="text-gray-900 font-medium">{registration.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">NISN</label>
                  <p className="text-gray-900">{registration.studentNisn}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">NIK</label>
                  <p className="text-gray-900">{registration.studentNik}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jalur Pendaftaran</label>
                  <p className="text-gray-900">{getPathLabel(registration.registrationPath)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tanggal Pendaftaran</label>
                  <p className="text-gray-900">{formatDate(registration.registrationDate)}</p>
                </div>
                {registration.totalScore !== null && registration.totalScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Skor</label>
                    <p className="text-gray-900 font-semibold text-lg">{registration.totalScore.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            {(registration.status === 'selection' || registration.status === 'announced') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Pendaftaran Anda sedang dalam proses seleksi. Silakan pantau status terbaru di sini.
                </p>
              </div>
            )}

            {registration.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Selamat!</strong> Anda diterima. Silakan hubungi sekolah untuk informasi lebih lanjut.
                </p>
              </div>
            )}

            {registration.status === 'rejected' && registration.rejectedReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Alasan penolakan:</strong> {registration.rejectedReason}
                </p>
              </div>
            )}

            {/* Status Pembayaran */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status Pembayaran</h2>
                {!registration.paymentStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Bukti Pembayaran
                  </Button>
                )}
              </div>
              
              {registration.paymentStatus ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Pembayaran Terverifikasi</p>
                  </div>
                  {registration.paymentAmount && (
                    <p className="text-sm text-green-700">
                      Jumlah: <strong>Rp {registration.paymentAmount.toLocaleString('id-ID')}</strong>
                    </p>
                  )}
                  {registration.paymentDate && (
                    <p className="text-xs text-green-600 mt-1">
                      Tanggal: {formatDate(registration.paymentDate)}
                    </p>
                  )}
                </div>
              ) : registration.paymentReceipt ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Menunggu Verifikasi</p>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Bukti pembayaran sudah diupload dan sedang menunggu verifikasi admin.
                  </p>
                  {registration.paymentReceipt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleViewDocument(registration.paymentReceipt!)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Bukti Pembayaran
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Belum ada bukti pembayaran yang diupload</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Bukti Pembayaran
                  </Button>
                </div>
              )}
            </div>

            {/* Jadwal Wawancara */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Jadwal Wawancara</h2>
              </div>
              
              {mySchedule ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Jadwal Telah Ditetapkan</p>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>Tanggal:</strong> {formatDate(mySchedule.scheduleDate)}</p>
                    <p><strong>Waktu:</strong> {mySchedule.startTime} - {mySchedule.endTime}</p>
                    {mySchedule.location && (
                      <p><strong>Lokasi:</strong> {mySchedule.location}</p>
                    )}
                    {mySchedule.notes && (
                      <p><strong>Catatan:</strong> {mySchedule.notes}</p>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    Notifikasi jadwal telah dikirim ke email Anda. Silakan hadir tepat waktu.
                  </p>
                </div>
              ) : availableSchedules && availableSchedules.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">Pilih jadwal wawancara yang tersedia:</p>
                  {availableSchedules.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <p className="font-medium text-gray-900">
                              {formatDate(schedule.scheduleDate)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Waktu:</strong> {schedule.startTime} - {schedule.endTime}
                          </p>
                          {schedule.location && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Lokasi:</strong> {schedule.location}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Tersedia: {schedule.maxParticipants - schedule.currentParticipants} slot
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm('Pesan jadwal wawancara ini?')) {
                              bookScheduleMutation.mutate(schedule.id);
                            }
                          }}
                          disabled={bookScheduleMutation.isPending}
                        >
                          Pilih
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Belum ada jadwal wawancara yang tersedia</p>
                  <p className="text-xs mt-1">Silakan hubungi admin untuk informasi lebih lanjut</p>
                </div>
              )}
            </div>

            {/* Dokumen Pendukung */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Dokumen Pendukung</h2>
                {(registration.status === 'pending' || registration.status === 'registered') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Dokumen
                  </Button>
                )}
              </div>
              
              {registration.documents && Object.keys(registration.documents).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(registration.documents).map(([type, doc]: [string, any]) => {
                    const verificationStatus = doc?.verificationStatus || 'pending';
                    const statusBadge = verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" /> Terverifikasi
                      </span>
                    ) : verificationStatus === 'rejected' ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" /> Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" /> Menunggu
                      </span>
                    );

                    return (
                      <div
                        key={type}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                          verificationStatus === 'rejected' ? 'border-red-200 bg-red-50' : 
                          verificationStatus === 'verified' ? 'border-green-200 bg-green-50' : 
                          'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {type.replace(/_/g, ' ')}
                              </p>
                              {statusBadge}
                            </div>
                            <p className="text-xs text-gray-500">
                              {doc.originalName || doc.filename}
                            </p>
                            {doc.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                <div className="flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <strong>Alasan penolakan:</strong> {doc.rejectionReason}
                                  </div>
                                </div>
                              </div>
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
                          {(registration.status === 'pending' || registration.status === 'registered') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveDocument(type)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Belum ada dokumen yang diupload</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Data Pendaftaran</h2>
            <p className="text-gray-600 mb-6">Silakan lengkapi data pendaftaran Anda untuk melanjutkan proses PPDB.</p>
            <Button onClick={() => setIsFormModalOpen(true)} size="lg">
              Lengkapi Data Pendaftaran
            </Button>
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            resetForm();
          }}
          title={registration ? 'Edit Data Pendaftaran' : 'Lengkapi Data Pendaftaran'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Data Siswa</h3>
              
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
                  setIsFormModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {registration ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Document Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedDocumentType('');
          }}
          title="Upload Dokumen Pendukung"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Dokumen <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
                options={[
                  { value: '', label: 'Pilih Jenis Dokumen' },
                  { value: 'akta_kelahiran', label: 'Akta Kelahiran' },
                  { value: 'kartu_keluarga', label: 'Kartu Keluarga (KK)' },
                  { value: 'ktp_ortu', label: 'KTP Orang Tua' },
                  { value: 'ijazah', label: 'Ijazah/SKL' },
                  { value: 'rapor', label: 'Rapor' },
                  { value: 'foto', label: 'Foto' },
                  { value: 'surat_keterangan', label: 'Surat Keterangan' },
                  { value: 'lainnya', label: 'Lainnya' },
                ]}
              />
            </div>

            {selectedDocumentType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={isUploading}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className={`cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? 'Mengupload...' : 'Pilih File'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: PDF, JPG, PNG, DOC, DOCX (Maks. 10MB)
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedDocumentType('');
                }}
                disabled={isUploading}
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>

        {/* Payment Upload Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: '', method: 'transfer', reference: '', notes: '' });
          }}
          title="Upload Bukti Pembayaran"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Pembayaran <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan jumlah pembayaran"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode Pembayaran
              </label>
              <Select
                value={paymentData.method}
                onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                options={[
                  { value: 'transfer', label: 'Transfer Bank' },
                  { value: 'qris', label: 'QRIS' },
                  { value: 'cash', label: 'Tunai' },
                  { value: 'edc', label: 'EDC/Kartu' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Referensi (opsional)
              </label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="No. referensi/transaksi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (opsional)
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Bukti Pembayaran <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handlePaymentUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isUploading || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
                  className="hidden"
                  id="payment-upload"
                />
                <label
                  htmlFor="payment-upload"
                  className={`cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    isUploading || !paymentData.amount || parseFloat(paymentData.amount) <= 0
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isUploading ? 'Mengupload...' : 'Pilih File Bukti Pembayaran'}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Format: PDF, JPG, PNG (Maks. 10MB)
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentData({ amount: '', method: 'transfer', reference: '', notes: '' });
                }}
                disabled={isUploading}
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

