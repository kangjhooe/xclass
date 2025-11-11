'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { messageApi, Message, MessageCreateData } from '@/lib/api/message';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function MessagePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [formData, setFormData] = useState<MessageCreateData>({
    subject: '',
    content: '',
    recipient_id: undefined,
    recipient_type: 'all',
    priority: 'medium',
  });

  const queryClient = useQueryClient();

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox', tenantId],
    queryFn: () => messageApi.getInbox(tenantId!),
    enabled: activeTab === 'inbox' && !!tenantId,
  });

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['messages', 'sent', tenantId],
    queryFn: () => messageApi.getSent(tenantId!),
    enabled: activeTab === 'sent' && !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: MessageCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return messageApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return messageApi.markAsRead(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return messageApi.delete(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      content: '',
      recipient_id: undefined,
      recipient_type: 'all',
      priority: 'medium',
    });
    setSelectedMessage(null);
  };

  const handleView = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      if (tenantId) {
        markAsReadMutation.mutate(message.id);
      }
    }
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      if (!tenantId) {
        alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
        return;
      }
      deleteMutation.mutate(id);
    }
  };

  const currentData = activeTab === 'inbox' ? inboxData : sentData;
  const isLoading = activeTab === 'inbox' ? inboxLoading : sentLoading;

  const unreadCount = inboxData?.data?.filter((m) => m.status === 'unread').length || 0;
  const totalInbox = inboxData?.data?.length || 0;
  const totalSent = sentData?.data?.length || 0;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Pesan
              </h1>
              <p className="text-gray-600">Sistem pesan internal instansi</p>
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
              Tulis Pesan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kotak Masuk</p>
                <p className="text-3xl font-bold text-blue-600">{totalInbox}</p>
                {unreadCount > 0 && (
                  <p className="text-sm text-yellow-600 font-medium mt-1">{unreadCount} belum dibaca</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terkirim</p>
                <p className="text-3xl font-bold text-green-600">{totalSent}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Kotak Masuk
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Terkirim
              </div>
            </button>
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
                    {activeTab === 'inbox' && (
                      <TableHead className="font-semibold text-gray-700">Pengirim</TableHead>
                    )}
                    {activeTab === 'sent' && (
                      <TableHead className="font-semibold text-gray-700">Penerima</TableHead>
                    )}
                    <TableHead className="font-semibold text-gray-700">Subjek</TableHead>
                    <TableHead className="font-semibold text-gray-700">Prioritas</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData?.data?.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={`hover:bg-blue-50/50 transition-colors ${
                        message.status === 'unread' ? 'bg-blue-50/30 font-semibold' : ''
                      }`}
                    >
                      <TableCell className="font-medium text-gray-800">
                        {activeTab === 'inbox' ? message.sender_name || '-' : message.recipient_name || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800 max-w-md">
                        <div className="truncate" title={message.subject}>
                          {message.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority === 'high' ? 'Tinggi' :
                           message.priority === 'medium' ? 'Sedang' :
                           message.priority === 'low' ? 'Rendah' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          message.status === 'unread' 
                            ? 'bg-yellow-500 text-white' 
                            : message.status === 'read'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {message.status === 'unread' ? 'Belum Dibaca' :
                           message.status === 'read' ? 'Sudah Dibaca' :
                           message.status === 'archived' ? 'Diarsipkan' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(message)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Lihat
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {currentData?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">
                            {activeTab === 'inbox' ? 'Tidak ada pesan masuk' : 'Tidak ada pesan terkirim'}
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
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Tulis Pesan Baru"
          size="lg"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!tenantId) {
              alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
              return;
            }
            createMutation.mutate(formData);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konten <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Penerima</label>
                <select
                  value={formData.recipient_type}
                  onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua</option>
                  <option value="user">Pengguna Tertentu</option>
                  <option value="class">Kelas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
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
                Kirim
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedMessage(null);
          }}
          title={selectedMessage?.subject || 'Detail Pesan'}
          size="lg"
        >
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Dari</p>
                  <p className="font-semibold text-gray-800">{selectedMessage.sender_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kepada</p>
                  <p className="font-semibold text-gray-800">{selectedMessage.recipient_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedMessage.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prioritas</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority === 'high' ? 'Tinggi' :
                     selectedMessage.priority === 'medium' ? 'Sedang' :
                     selectedMessage.priority === 'low' ? 'Rendah' : '-'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Isi Pesan</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}
