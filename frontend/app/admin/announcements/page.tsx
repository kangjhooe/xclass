'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  superAdminAnnouncementApi,
  SuperAdminAnnouncement,
  CreateSuperAdminAnnouncementData,
} from '@/lib/api/super-admin-announcement';
import { adminApi, Tenant } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToastStore } from '@/lib/store/toast';
import { formatDate } from '@/lib/utils/date';

const JENJANG_OPTIONS = [
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA', label: 'SMA' },
  { value: 'SMK', label: 'SMK' },
];

const JENIS_OPTIONS = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA' },
  { value: 'smk', label: 'SMK' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<SuperAdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<SuperAdminAnnouncement | null>(null);
  const [formData, setFormData] = useState<CreateSuperAdminAnnouncementData>({
    title: '',
    content: '',
    priority: 'medium',
    status: 'draft',
    targetTenantIds: [],
    targetJenjang: [],
    targetJenis: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const { success, error: showError } = useToastStore();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAnnouncements();
    }, filters.search ? 500 : 0); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [pagination.page, filters]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await superAdminAnnouncementApi.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setAnnouncements(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      showError(err?.response?.data?.message || 'Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await adminApi.getAllTenants({ page: 1, limit: 1000 });
      setTenants(response.data);
    } catch (err: any) {
      console.error('Error loading tenants:', err);
    }
  };

  const handleOpenModal = (announcement?: SuperAdminAnnouncement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        status: announcement.status,
        targetTenantIds: announcement.targetTenantIds || [],
        targetJenjang: announcement.targetJenjang || [],
        targetJenis: announcement.targetJenis || [],
        publishAt: announcement.publishAt,
        expiresAt: announcement.expiresAt,
      });
      setSelectedTenants(announcement.targetTenantIds || []);
      setExistingAttachments(announcement.attachments || []);
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        status: 'draft',
        targetTenantIds: [],
        targetJenjang: [],
        targetJenis: [],
      });
      setSelectedTenants([]);
      setExistingAttachments([]);
    }
    setAttachments([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      status: 'draft',
      targetTenantIds: [],
      targetJenjang: [],
      targetJenis: [],
    });
    setSelectedTenants([]);
    setAttachments([]);
    setExistingAttachments([]);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = 'Judul wajib diisi';
    }

    if (!formData.content?.trim()) {
      errors.content = 'Isi pengumuman wajib diisi';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const data: CreateSuperAdminAnnouncementData = {
        ...formData,
        targetTenantIds: selectedTenants.length > 0 ? selectedTenants : undefined,
        targetJenjang: formData.targetJenjang?.length ? formData.targetJenjang : undefined,
        targetJenis: formData.targetJenis?.length ? formData.targetJenis : undefined,
        attachments: existingAttachments,
      };

      if (editingAnnouncement) {
        await superAdminAnnouncementApi.update(
          editingAnnouncement.id,
          data,
          attachments.length > 0 ? attachments : undefined,
        );
        success('Pengumuman berhasil diperbarui');
      } else {
        await superAdminAnnouncementApi.create(
          data,
          attachments.length > 0 ? attachments : undefined,
        );
        success('Pengumuman berhasil dibuat');
      }

      handleCloseModal();
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      showError(err?.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      return;
    }

    try {
      await superAdminAnnouncementApi.delete(id);
      success('Pengumuman berhasil dihapus');
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      showError(err?.response?.data?.message || 'Gagal menghapus pengumuman');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
            <p className="text-gray-600 mt-1">
              Kelola pengumuman untuk semua tenant
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>+ Buat Pengumuman</Button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Cari pengumuman..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
          <Select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
          <Select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">Semua Prioritas</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        {/* Announcements List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {announcement.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {announcement.content.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        announcement.priority,
                      )}`}
                    >
                      {announcement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        announcement.status,
                      )}`}
                    >
                      {announcement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {announcement.targetTenantIds?.length
                      ? `${announcement.targetTenantIds.length} tenant`
                      : announcement.targetJenjang?.length || announcement.targetJenis?.length
                      ? `${announcement.targetJenjang?.join(', ') || ''} ${announcement.targetJenis?.join(', ') || ''}`
                      : 'Semua tenant'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(announcement.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(announcement)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {announcements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada pengumuman</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              dari {pagination.total} pengumuman
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page >= pagination.totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                error={formErrors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Isi Pengumuman *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
                error={formErrors.content}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritas
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as any,
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Tenant (kosongkan untuk semua tenant)
              </label>
              <Select
                multiple
                value={selectedTenants.map(String)}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value),
                  );
                  setSelectedTenants(values);
                }}
                className="h-32"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.npsn})
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Tahan Ctrl/Cmd untuk memilih multiple tenant
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Jenjang (kosongkan untuk semua)
                </label>
                <Select
                  multiple
                  value={formData.targetJenjang || []}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setFormData({ ...formData, targetJenjang: values });
                  }}
                  className="h-24"
                >
                  {JENJANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Jenis (kosongkan untuk semua)
                </label>
                <Select
                  multiple
                  value={formData.targetJenis || []}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setFormData({ ...formData, targetJenis: values });
                  }}
                  className="h-24"
                >
                  {JENIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Publish
                </label>
                <Input
                  type="datetime-local"
                  value={
                    formData.publishAt
                      ? new Date(formData.publishAt)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publishAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Expire
                </label>
                <Input
                  type="datetime-local"
                  value={
                    formData.expiresAt
                      ? new Date(formData.expiresAt)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiresAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lampiran
              </label>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    // Validate file size (max 10MB per file)
                    const validFiles = files.filter((file) => {
                      if (file.size > 10 * 1024 * 1024) {
                        showError(`File ${file.name} terlalu besar (max 10MB)`);
                        return false;
                      }
                      return true;
                    });
                    setAttachments((prev) => [...prev, ...validFiles]);
                  }
                }}
              />
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 mb-1">File baru yang akan diupload:</p>
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-xs text-gray-400 mx-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachments(attachments.filter((_, i) => i !== idx));
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {existingAttachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 mb-1">Lampiran yang sudah ada:</p>
                  {existingAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 flex items-center justify-between bg-blue-50 p-2 rounded"
                    >
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate flex-1"
                      >
                        {att.originalName}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setExistingAttachments(
                            existingAttachments.filter((_, i) => i !== idx),
                          );
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

