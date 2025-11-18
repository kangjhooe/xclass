'use client';

import { useState, useEffect } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  extracurricularApi,
  Extracurricular,
  ExtracurricularCreateData,
  ExtracurricularCategory,
  ExtracurricularStatus,
  ExtracurricularParticipant,
  ExtracurricularParticipantCreateData,
  ExtracurricularActivity,
  ExtracurricularActivityCreateData,
  ActivityType,
  ActivityStatus,
  ParticipantStatus,
} from '@/lib/api/extracurricular';
import { studentsApi, Student } from '@/lib/api/students';
import { teachersApi, Teacher } from '@/lib/api/teachers';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Search,
  Filter,
  X,
  UserPlus,
  Activity,
  BarChart3,
  Download,
} from 'lucide-react';

type TabType = 'list' | 'participants' | 'activities' | 'report';

export default function ExtracurricularPage() {
  const tenantId = useTenantId();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedExtracurricular, setSelectedExtracurricular] = useState<Extracurricular | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ExtracurricularActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExtracurricularCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ExtracurricularStatus | 'all'>('all');
  const [formData, setFormData] = useState<ExtracurricularCreateData>({
    name: '',
    description: '',
    category: ExtracurricularCategory.SPORTS,
    supervisorId: undefined,
    assistantSupervisorId: undefined,
    venue: '',
    maxParticipants: undefined,
    status: ExtracurricularStatus.ACTIVE,
    startDate: '',
    endDate: '',
    requirements: [],
    equipmentNeeded: [],
    cost: undefined,
    notes: '',
  });
  const [participantFormData, setParticipantFormData] = useState<ExtracurricularParticipantCreateData>({
    extracurricularId: 0,
    studentId: 0,
    status: ParticipantStatus.ACTIVE,
    notes: '',
  });
  const [activityFormData, setActivityFormData] = useState<ExtracurricularActivityCreateData>({
    extracurricularId: 0,
    title: '',
    description: '',
    activityDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    type: ActivityType.REGULAR,
    status: ActivityStatus.SCHEDULED,
    notes: '',
  });
  const [requirementInput, setRequirementInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');

  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();

  // Fetch extracurriculars
  const { data, isLoading } = useQuery({
    queryKey: ['extracurriculars', tenantId, currentPage, searchQuery, categoryFilter, statusFilter],
    queryFn: () =>
      extracurricularApi.getAll(tenantId!, {
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      }),
    enabled: !!tenantId,
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['extracurricular-statistics', tenantId],
    queryFn: () => extracurricularApi.getStatistics(tenantId!),
    enabled: !!tenantId,
  });

  // Fetch teachers for supervisor selection
  const { data: teachersData } = useQuery({
    queryKey: ['teachers', tenantId, 'for-extracurricular'],
    queryFn: () => teachersApi.getAll(tenantId!, { isActive: true, limit: 1000 }),
    enabled: !!tenantId,
  });

  // Fetch students for participant selection
  const { data: studentsData } = useQuery({
    queryKey: ['students', tenantId, 'for-extracurricular'],
    queryFn: () => studentsApi.getAll(tenantId!, { limit: 1000 }),
    enabled: !!tenantId && isParticipantModalOpen,
  });

  // Fetch participants for selected extracurricular
  const { data: participantsData, refetch: refetchParticipants } = useQuery({
    queryKey: ['extracurricular-participants', tenantId, selectedExtracurricular?.id],
    queryFn: () => extracurricularApi.getParticipants(tenantId!, selectedExtracurricular!.id),
    enabled: !!tenantId && !!selectedExtracurricular && activeTab === 'participants',
  });

  // Fetch activities for selected extracurricular
  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['extracurricular-activities', tenantId, selectedExtracurricular?.id],
    queryFn: () => extracurricularApi.getActivities(tenantId!, selectedExtracurricular!.id),
    enabled: !!tenantId && !!selectedExtracurricular && activeTab === 'activities',
  });

  const createMutation = useMutation({
    mutationFn: (data: ExtracurricularCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurriculars', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['extracurricular-statistics', tenantId] });
      setIsModalOpen(false);
      resetForm();
      success('Ekstrakurikuler berhasil ditambahkan');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menambahkan ekstrakurikuler');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExtracurricularCreateData> }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.update(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurriculars', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['extracurricular-statistics', tenantId] });
      setIsModalOpen(false);
      setSelectedExtracurricular(null);
      resetForm();
      success('Ekstrakurikuler berhasil diupdate');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal mengupdate ekstrakurikuler');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurriculars', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['extracurricular-statistics', tenantId] });
      success('Ekstrakurikuler berhasil dihapus');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menghapus ekstrakurikuler');
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data: ExtracurricularParticipantCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.addParticipant(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurricular-participants', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['extracurriculars', tenantId] });
      setIsParticipantModalOpen(false);
      setParticipantFormData({
        extracurricularId: selectedExtracurricular?.id || 0,
        studentId: 0,
        status: ParticipantStatus.ACTIVE,
        notes: '',
      });
      success('Peserta berhasil ditambahkan');
      refetchParticipants();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menambahkan peserta');
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: ({ participantId, notes }: { participantId: number; notes?: string }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.removeParticipant(tenantId, participantId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurricular-participants', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['extracurriculars', tenantId] });
      success('Peserta berhasil dihapus');
      refetchParticipants();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menghapus peserta');
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: ExtracurricularActivityCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.createActivity(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurricular-activities', tenantId] });
      setIsActivityModalOpen(false);
      resetActivityForm();
      success('Aktivitas berhasil ditambahkan');
      refetchActivities();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menambahkan aktivitas');
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExtracurricularActivityCreateData> }) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.updateActivity(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurricular-activities', tenantId] });
      setIsActivityModalOpen(false);
      setSelectedActivity(null);
      resetActivityForm();
      success('Aktivitas berhasil diupdate');
      refetchActivities();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal mengupdate aktivitas');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia.');
      return extracurricularApi.deleteActivity(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracurricular-activities', tenantId] });
      success('Aktivitas berhasil dihapus');
      refetchActivities();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Gagal menghapus aktivitas');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: ExtracurricularCategory.SPORTS,
      supervisorId: undefined,
      assistantSupervisorId: undefined,
      venue: '',
      maxParticipants: undefined,
      status: ExtracurricularStatus.ACTIVE,
      startDate: '',
      endDate: '',
      requirements: [],
      equipmentNeeded: [],
      cost: undefined,
      notes: '',
    });
    setRequirementInput('');
    setEquipmentInput('');
    setSelectedExtracurricular(null);
  };

  const resetActivityForm = () => {
    setActivityFormData({
      extracurricularId: selectedExtracurricular?.id || 0,
      title: '',
      description: '',
      activityDate: '',
      startTime: '',
      endTime: '',
      venue: '',
      type: ActivityType.REGULAR,
      status: ActivityStatus.SCHEDULED,
      notes: '',
    });
    setSelectedActivity(null);
  };

  const handleEdit = (extracurricular: Extracurricular) => {
    setSelectedExtracurricular(extracurricular);
    setFormData({
      name: extracurricular.name,
      description: extracurricular.description || '',
      category: extracurricular.category,
      supervisorId: extracurricular.supervisorId,
      assistantSupervisorId: extracurricular.assistantSupervisorId,
      venue: extracurricular.venue || '',
      maxParticipants: extracurricular.maxParticipants,
      status: extracurricular.status,
      startDate: extracurricular.startDate ? extracurricular.startDate.split('T')[0] : '',
      endDate: extracurricular.endDate ? extracurricular.endDate.split('T')[0] : '',
      requirements: extracurricular.requirements || [],
      equipmentNeeded: extracurricular.equipmentNeeded || [],
      cost: extracurricular.cost,
      notes: extracurricular.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      showError('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    if (selectedExtracurricular) {
      updateMutation.mutate({ id: selectedExtracurricular.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      if (!data?.data || data.data.length === 0) {
        showError('Tidak ada data untuk diekspor');
        return;
      }

      const exportData = extracurriculars.map((ext) => ({
        'Nama': ext.name,
        'Kategori': getCategoryLabel(ext.category),
        'Deskripsi': ext.description || '',
        'Pembina': ext.supervisor?.name || '',
        'Pembina Pendamping': ext.assistantSupervisor?.name || '',
        'Lokasi': ext.venue || '',
        'Maksimal Peserta': ext.maxParticipants || '',
        'Peserta Saat Ini': ext.currentParticipants,
        'Status': ext.status === ExtracurricularStatus.ACTIVE ? 'Aktif' :
                  ext.status === ExtracurricularStatus.INACTIVE ? 'Tidak Aktif' :
                  ext.status === ExtracurricularStatus.SUSPENDED ? 'Ditangguhkan' : 'Selesai',
        'Tanggal Mulai': ext.startDate ? formatDate(ext.startDate) : '',
        'Tanggal Selesai': ext.endDate ? formatDate(ext.endDate) : '',
        'Biaya': ext.cost || '',
        'Persyaratan': ext.requirements?.join('; ') || '',
        'Perlengkapan': ext.equipmentNeeded?.join('; ') || '',
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map((row) =>
            headers.map((header) => {
              const value = row[header as keyof typeof row];
              return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            }).join(',')
          ),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ekstrakurikuler-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        success('Data berhasil diekspor ke CSV');
      } else if (format === 'excel') {
        const { exportImportApi } = await import('@/lib/api/export-import');
        await exportImportApi.exportExcel(
          {
            data: exportData,
            filename: `ekstrakurikuler-${new Date().toISOString().split('T')[0]}`,
            sheetName: 'Ekstrakurikuler',
          },
          tenantId?.toString(),
        );
        success('Data berhasil diekspor ke Excel');
      }
    } catch (error: any) {
      showError(error.message || 'Gagal mengekspor data');
    }
  };

  const handleViewDetails = (extracurricular: Extracurricular) => {
    setSelectedExtracurricular(extracurricular);
    setActiveTab('participants');
  };

  const handleAddParticipant = () => {
    setParticipantFormData({
      extracurricularId: selectedExtracurricular?.id || 0,
      studentId: 0,
      status: ParticipantStatus.ACTIVE,
      notes: '',
    });
    setIsParticipantModalOpen(true);
  };

  const handleSubmitParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExtracurricular) return;
    addParticipantMutation.mutate({
      ...participantFormData,
      extracurricularId: selectedExtracurricular.id,
    });
  };

  const handleRemoveParticipant = (participantId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
      removeParticipantMutation.mutate({ participantId });
    }
  };

  const handleAddActivity = () => {
    resetActivityForm();
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity: ExtracurricularActivity) => {
    setSelectedActivity(activity);
    setActivityFormData({
      extracurricularId: activity.extracurricularId,
      title: activity.title,
      description: activity.description || '',
      activityDate: activity.activityDate ? activity.activityDate.split('T')[0] : '',
      startTime: activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : '',
      endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : '',
      venue: activity.venue || '',
      type: activity.type,
      status: activity.status,
      notes: activity.notes || '',
    });
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus aktivitas ini?')) {
      deleteActivityMutation.mutate(id);
    }
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExtracurricular) return;
    if (selectedActivity) {
      updateActivityMutation.mutate({
        id: selectedActivity.id,
        data: {
          ...activityFormData,
          extracurricularId: selectedExtracurricular.id,
        },
      });
    } else {
      createActivityMutation.mutate({
        ...activityFormData,
        extracurricularId: selectedExtracurricular.id,
      });
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), requirementInput.trim()],
      });
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData({
        ...formData,
        equipmentNeeded: [...(formData.equipmentNeeded || []), equipmentInput.trim()],
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    const newEquipment = formData.equipmentNeeded?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, equipmentNeeded: newEquipment });
  };

  const getCategoryLabel = (category: ExtracurricularCategory) => {
    const labels: Record<ExtracurricularCategory, string> = {
      [ExtracurricularCategory.SPORTS]: 'Olahraga',
      [ExtracurricularCategory.ARTS]: 'Seni',
      [ExtracurricularCategory.ACADEMIC]: 'Akademik',
      [ExtracurricularCategory.SOCIAL]: 'Sosial',
      [ExtracurricularCategory.RELIGIOUS]: 'Keagamaan',
      [ExtracurricularCategory.TECHNOLOGY]: 'Teknologi',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: ExtracurricularStatus) => {
    const badges: Record<ExtracurricularStatus, { label: string; className: string }> = {
      [ExtracurricularStatus.ACTIVE]: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      [ExtracurricularStatus.INACTIVE]: { label: 'Tidak Aktif', className: 'bg-gray-100 text-gray-800' },
      [ExtracurricularStatus.SUSPENDED]: { label: 'Ditangguhkan', className: 'bg-yellow-100 text-yellow-800' },
      [ExtracurricularStatus.COMPLETED]: { label: 'Selesai', className: 'bg-blue-100 text-blue-800' },
    };
    const badge = badges[status] || badges[ExtracurricularStatus.ACTIVE];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const extracurriculars = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const participants = participantsData || [];
  const activities = activitiesData || [];

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ekstrakurikuler</h1>
            <p className="text-gray-600 mt-1">Kelola ekstrakurikuler sekolah</p>
          </div>
          {!selectedExtracurricular && (
            <div className="flex gap-2">
              <div className="relative group">
                <Button variant="outline" onClick={() => {}}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Export ke Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Export ke CSV
                  </button>
                </div>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Ekstrakurikuler
              </Button>
            </div>
          )}
          {selectedExtracurricular && (
            <Button variant="outline" onClick={() => {
              setSelectedExtracurricular(null);
              setActiveTab('list');
            }}>
              <X className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          )}
        </div>

        {/* Statistics */}
        {statistics && !selectedExtracurricular && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ekstrakurikuler</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{statistics.active}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Peserta</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{statistics.totalParticipants}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Selected Extracurricular Header */}
        {selectedExtracurricular && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedExtracurricular.name}</h2>
                <p className="text-gray-600 mt-1">{selectedExtracurricular.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-600">
                    Kategori: <span className="font-medium">{getCategoryLabel(selectedExtracurricular.category)}</span>
                  </span>
                  {getStatusBadge(selectedExtracurricular.status)}
                  <span className="text-sm text-gray-600">
                    Peserta: <span className="font-medium">{selectedExtracurricular.currentParticipants}</span>
                    {selectedExtracurricular.maxParticipants && ` / ${selectedExtracurricular.maxParticipants}`}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={() => handleEdit(selectedExtracurricular)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        {selectedExtracurricular && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'participants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Peserta ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Aktivitas ({activities.length})
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'report'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Laporan
              </button>
            </nav>
          </div>
        )}

        {/* Participants Tab */}
        {selectedExtracurricular && activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Daftar Peserta</h3>
              <Button onClick={handleAddParticipant}>
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Peserta
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NIS/NISN</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tanggal Bergabung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Belum ada peserta
                      </TableCell>
                    </TableRow>
                  ) : (
                    participants.map((participant, index) => (
                      <TableRow key={participant.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{participant.student?.name || '-'}</TableCell>
                        <TableCell>{participant.student?.studentNumber || (participant.student as any)?.nisn || '-'}</TableCell>
                        <TableCell>{participant.student?.classRoom?.name || '-'}</TableCell>
                        <TableCell>{formatDate(participant.joinedAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            participant.status === ParticipantStatus.ACTIVE
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.status === ParticipantStatus.ACTIVE ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {participant.status === ParticipantStatus.ACTIVE && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {selectedExtracurricular && activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Daftar Aktivitas</h3>
              <Button onClick={handleAddActivity}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aktivitas
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Belum ada aktivitas
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity, index) => (
                      <TableRow key={activity.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>{formatDate(activity.activityDate)}</TableCell>
                        <TableCell>
                          {activity.startTime && activity.endTime
                            ? `${new Date(activity.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(activity.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                            : '-'}
                        </TableCell>
                        <TableCell>{activity.venue || '-'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {activity.type === ActivityType.REGULAR ? 'Reguler' :
                             activity.type === ActivityType.COMPETITION ? 'Kompetisi' :
                             activity.type === ActivityType.TRAINING ? 'Pelatihan' :
                             activity.type === ActivityType.EVENT ? 'Acara' : 'Rapat'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === ActivityStatus.COMPLETED
                              ? 'bg-green-100 text-green-800'
                              : activity.status === ActivityStatus.ONGOING
                              ? 'bg-blue-100 text-blue-800'
                              : activity.status === ActivityStatus.CANCELLED
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status === ActivityStatus.COMPLETED ? 'Selesai' :
                             activity.status === ActivityStatus.ONGOING ? 'Berlangsung' :
                             activity.status === ActivityStatus.CANCELLED ? 'Dibatalkan' : 'Terjadwal'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditActivity(activity)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Report Tab */}
        {selectedExtracurricular && activeTab === 'report' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Laporan Keikutsertaan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Peserta</p>
                  <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Peserta Aktif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {participants.filter(p => p.status === ParticipantStatus.ACTIVE).length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Aktivitas</p>
                  <p className="text-2xl font-bold text-purple-600">{activities.length}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Daftar Peserta</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>NIS/NISN</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Tanggal Bergabung</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Belum ada peserta
                          </TableCell>
                        </TableRow>
                      ) : (
                        participants.map((participant, index) => (
                          <TableRow key={participant.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{participant.student?.name || '-'}</TableCell>
                            <TableCell>{participant.student?.studentNumber || (participant.student as any)?.nisn || '-'}</TableCell>
                            <TableCell>{participant.student?.classRoom?.name || '-'}</TableCell>
                            <TableCell>{formatDate(participant.joinedAt)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                participant.status === ParticipantStatus.ACTIVE
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {participant.status === ParticipantStatus.ACTIVE ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Ringkasan Aktivitas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Aktivitas Terjadwal</p>
                    <p className="text-xl font-bold">
                      {activities.filter(a => a.status === ActivityStatus.SCHEDULED).length}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Aktivitas Selesai</p>
                    <p className="text-xl font-bold text-green-600">
                      {activities.filter(a => a.status === ActivityStatus.COMPLETED).length}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Aktivitas Berlangsung</p>
                    <p className="text-xl font-bold text-blue-600">
                      {activities.filter(a => a.status === ActivityStatus.ONGOING).length}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Aktivitas Dibatalkan</p>
                    <p className="text-xl font-bold text-red-600">
                      {activities.filter(a => a.status === ActivityStatus.CANCELLED).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {!selectedExtracurricular && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Cari ekstrakurikuler..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value as ExtracurricularCategory | 'all');
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Semua Kategori</option>
                  {Object.values(ExtracurricularCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ExtracurricularStatus | 'all');
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Semua Status</option>
                  {Object.values(ExtracurricularStatus).map((status) => {
                    const labels: Record<ExtracurricularStatus, string> = {
                      [ExtracurricularStatus.ACTIVE]: 'Aktif',
                      [ExtracurricularStatus.INACTIVE]: 'Tidak Aktif',
                      [ExtracurricularStatus.SUSPENDED]: 'Ditangguhkan',
                      [ExtracurricularStatus.COMPLETED]: 'Selesai',
                    };
                    return (
                      <option key={status} value={status}>
                        {labels[status] || status}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Memuat data...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Pembina</TableHead>
                          <TableHead>Peserta</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extracurriculars.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              Tidak ada data ekstrakurikuler
                            </TableCell>
                          </TableRow>
                        ) : (
                          extracurriculars.map((extracurricular, index) => (
                            <TableRow key={extracurricular.id}>
                              <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{extracurricular.name}</div>
                                  {extracurricular.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-md">
                                      {extracurricular.description}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getCategoryLabel(extracurricular.category)}</TableCell>
                              <TableCell>{extracurricular.supervisor?.name || '-'}</TableCell>
                              <TableCell>
                                {extracurricular.currentParticipants}
                                {extracurricular.maxParticipants && ` / ${extracurricular.maxParticipants}`}
                              </TableCell>
                              <TableCell>{getStatusBadge(extracurricular.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(extracurricular)}
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(extracurricular)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(extracurricular.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={data?.total || 0}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedExtracurricular ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ekstrakurikuler <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExtracurricularCategory })
                  }
                  required
                >
                  {Object.values(ExtracurricularCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ExtracurricularStatus })
                  }
                >
                  {Object.values(ExtracurricularStatus).map((status) => {
                    const labels: Record<ExtracurricularStatus, string> = {
                      [ExtracurricularStatus.ACTIVE]: 'Aktif',
                      [ExtracurricularStatus.INACTIVE]: 'Tidak Aktif',
                      [ExtracurricularStatus.SUSPENDED]: 'Ditangguhkan',
                      [ExtracurricularStatus.COMPLETED]: 'Selesai',
                    };
                    return (
                      <option key={status} value={status}>
                        {labels[status] || status}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pembina</label>
                <Select
                  value={formData.supervisorId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supervisorId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">Pilih Pembina</option>
                  {teachersData?.data?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pembina Pendamping</label>
                <Select
                  value={formData.assistantSupervisorId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assistantSupervisorId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">Pilih Pembina Pendamping</option>
                  {teachersData?.data?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal Peserta</label>
                <Input
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biaya</label>
              <Input
                type="number"
                value={formData.cost || ''}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persyaratan</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                  placeholder="Tambah persyaratan"
                />
                <Button type="button" onClick={addRequirement}>
                  Tambah
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perlengkapan yang Diperlukan</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEquipment();
                    }
                  }}
                  placeholder="Tambah perlengkapan"
                />
                <Button type="button" onClick={addEquipment}>
                  Tambah
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.equipmentNeeded?.map((eq, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                  >
                    {eq}
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {selectedExtracurricular ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Participant Modal */}
        <Modal
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
          title="Tambah Peserta"
        >
          <form onSubmit={handleSubmitParticipant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa <span className="text-red-500">*</span>
              </label>
              <Select
                value={participantFormData.studentId}
                onChange={(e) =>
                  setParticipantFormData({
                    ...participantFormData,
                    studentId: Number(e.target.value),
                  })
                }
                required
              >
                <option value="">Pilih Siswa</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.studentNumber ? `(${student.studentNumber})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={participantFormData.status}
                onChange={(e) =>
                  setParticipantFormData({
                    ...participantFormData,
                    status: e.target.value as ParticipantStatus,
                  })
                }
              >
                <option value={ParticipantStatus.ACTIVE}>Aktif</option>
                <option value={ParticipantStatus.INACTIVE}>Tidak Aktif</option>
                <option value={ParticipantStatus.GRADUATED}>Lulus</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <Textarea
                value={participantFormData.notes}
                onChange={(e) =>
                  setParticipantFormData({ ...participantFormData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsParticipantModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={addParticipantMutation.isPending}>
                Tambah
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add/Edit Activity Modal */}
        <Modal
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            resetActivityForm();
          }}
          title={selectedActivity ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
        >
          <form onSubmit={handleSubmitActivity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <Input
                value={activityFormData.title}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <Textarea
                value={activityFormData.description}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={activityFormData.activityDate}
                  onChange={(e) =>
                    setActivityFormData({ ...activityFormData, activityDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <Input
                  value={activityFormData.venue}
                  onChange={(e) =>
                    setActivityFormData({ ...activityFormData, venue: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                <Input
                  type="datetime-local"
                  value={activityFormData.startTime}
                  onChange={(e) =>
                    setActivityFormData({ ...activityFormData, startTime: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                <Input
                  type="datetime-local"
                  value={activityFormData.endTime}
                  onChange={(e) =>
                    setActivityFormData({ ...activityFormData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <Select
                  value={activityFormData.type}
                  onChange={(e) =>
                    setActivityFormData({
                      ...activityFormData,
                      type: e.target.value as ActivityType,
                    })
                  }
                >
                  <option value={ActivityType.REGULAR}>Reguler</option>
                  <option value={ActivityType.COMPETITION}>Kompetisi</option>
                  <option value={ActivityType.TRAINING}>Pelatihan</option>
                  <option value={ActivityType.EVENT}>Acara</option>
                  <option value={ActivityType.MEETING}>Rapat</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={activityFormData.status}
                  onChange={(e) =>
                    setActivityFormData({
                      ...activityFormData,
                      status: e.target.value as ActivityStatus,
                    })
                  }
                >
                  <option value={ActivityStatus.SCHEDULED}>Terjadwal</option>
                  <option value={ActivityStatus.ONGOING}>Berlangsung</option>
                  <option value={ActivityStatus.COMPLETED}>Selesai</option>
                  <option value={ActivityStatus.CANCELLED}>Dibatalkan</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <Textarea
                value={activityFormData.notes}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsActivityModalOpen(false);
                  resetActivityForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createActivityMutation.isPending || updateActivityMutation.isPending}>
                {selectedActivity ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

