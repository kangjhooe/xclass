'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { backupApi, Backup, BackupType, BackupStatus } from '@/lib/api/backup';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loading } from '@/components/ui/Loading';
import { formatDate } from '@/lib/utils/date';

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [formData, setFormData] = useState({
    type: BackupType.DATABASE,
    name: '',
    description: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadBackups();
  }, [pagination.page]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await backupApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });
      setBackups(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await backupApi.create(formData);
      setIsCreateModalOpen(false);
      setFormData({ type: BackupType.DATABASE, name: '', description: '' });
      loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Gagal membuat backup');
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    if (!confirm('Yakin ingin restore backup ini? Data saat ini akan diganti!')) return;
    try {
      await backupApi.restore(selectedBackup.id);
      setIsRestoreModalOpen(false);
      setSelectedBackup(null);
      alert('Backup berhasil di-restore');
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Gagal restore backup');
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const response = await backupApi.download(backup.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backup.id}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Gagal mengunduh backup');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus backup ini?')) return;
    try {
      await backupApi.delete(id);
      loadBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Gagal menghapus backup');
    }
  };

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case BackupStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case BackupStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case BackupStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Backup & Recovery
            </h1>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Backup Baru
            </Button>
          </div>
          <p className="text-gray-600">Kelola backup dan restore data sistem</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ukuran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {backup.name}
                    </div>
                    {backup.description && (
                      <div className="text-sm text-gray-500">
                        {backup.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                        backup.status === BackupStatus.COMPLETED
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : backup.status === BackupStatus.IN_PROGRESS
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                      }`}
                    >
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(backup.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(backup.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {backup.status === BackupStatus.COMPLETED && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(backup)}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsRestoreModalOpen(true);
                            }}
                          >
                            Restore
                          </Button>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(backup.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium">
              Menampilkan <span className="font-bold text-blue-600">{backups.length}</span> dari <span className="font-bold text-purple-600">{pagination.total}</span> backup
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                className="disabled:opacity-50"
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                className="disabled:opacity-50"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Create Backup Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Buat Backup Baru"
        >
          <div className="space-y-4">
            <Input
              label="Nama Backup"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Backup
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as BackupType })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={BackupType.DATABASE}>Database</option>
                <option value={BackupType.FULL}>Full</option>
              </select>
            </div>
            <Textarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateBackup}>Buat Backup</Button>
            </div>
          </div>
        </Modal>

        {/* Restore Modal */}
        <Modal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
          title="Restore Backup"
        >
          <div className="space-y-4">
            <p className="text-red-600 font-semibold">
              Peringatan: Restore backup akan mengganti semua data saat ini dengan
              data dari backup. Pastikan Anda sudah membuat backup terbaru!
            </p>
            {selectedBackup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Backup:</strong> {selectedBackup.name}
                </p>
                <p>
                  <strong>Tanggal:</strong> {formatDate(selectedBackup.createdAt)}
                </p>
                <p>
                  <strong>Ukuran:</strong> {formatFileSize(selectedBackup.fileSize)}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsRestoreModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleRestore}>
                Ya, Restore
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

