'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { messageApi, Message, MessageCreateData } from '@/lib/api/message';
import { conversationApi, Conversation, ConversationCreateData } from '@/lib/api/conversation';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages';

export default function MessagePage() {
  const tenantId = useTenantId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isConversationViewOpen, setIsConversationViewOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'conversations'>('inbox');
  const [formData, setFormData] = useState<MessageCreateData>({
    subject: '',
    content: '',
    recipient_id: undefined,
    recipient_type: 'all',
    priority: 'medium',
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    isRead: '',
    startDate: '',
    endDate: '',
    sortBy: 'date' as 'date' | 'priority' | 'subject',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
  });

  const queryClient = useQueryClient();

  // Real-time messages hook
  const { unreadCount: realtimeUnreadCount, isConnected: isRealtimeConnected } = useRealtimeMessages({
    onNewMessage: (message) => {
      // Auto refresh if on inbox tab
      if (activeTab === 'inbox') {
        queryClient.invalidateQueries({ queryKey: ['messages', 'inbox', tenantId] });
      }
    },
    playSound: true,
    showNotification: true,
  });

  // Build query params
  const queryParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.isRead && { isRead: filters.isRead }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
  };

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox', tenantId, queryParams],
    queryFn: () => messageApi.getInbox(tenantId!, queryParams),
    enabled: activeTab === 'inbox' && !!tenantId,
  });

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['messages', 'sent', tenantId, queryParams],
    queryFn: () => messageApi.getSent(tenantId!, queryParams),
    enabled: activeTab === 'sent' && !!tenantId,
  });

  // Conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', tenantId],
    queryFn: () => conversationApi.getAll(tenantId!),
    enabled: activeTab === 'conversations' && !!tenantId,
  });

  // Conversation messages
  const { data: conversationMessagesData, isLoading: conversationMessagesLoading } = useQuery({
    queryKey: ['messages', 'conversation', selectedConversation?.id, tenantId],
    queryFn: () => messageApi.getAll(tenantId!, { conversationId: selectedConversation?.id }),
    enabled: !!selectedConversation && !!tenantId,
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
      attachments: [],
    });
    setSelectedFiles([]);
    setSelectedMessage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      priority: '',
      isRead: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'DESC',
    });
  };

  const hasActiveFilters = searchQuery || filters.priority || filters.isRead || filters.startDate || filters.endDate;

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

  // Use real-time unread count if available, otherwise fallback to calculated count
  const unreadCount = realtimeUnreadCount > 0 ? realtimeUnreadCount : (inboxData?.data?.filter((m) => m.status === 'unread').length || 0);
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
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Pesan
                </h1>
                {isRealtimeConnected && (
                  <span className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Terhubung
                  </span>
                )}
              </div>
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

          {/* Search and Filter Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pesan (subjek atau isi)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Toggle and Sort */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {[searchQuery, filters.priority, filters.isRead, filters.startDate, filters.endDate].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date-DESC">Terbaru</option>
                  <option value="date-ASC">Terlama</option>
                  <option value="priority-DESC">Prioritas: Tinggi ke Rendah</option>
                  <option value="priority-ASC">Prioritas: Rendah ke Tinggi</option>
                  <option value="subject-ASC">Subjek: A-Z</option>
                  <option value="subject-DESC">Subjek: Z-A</option>
                </select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua</option>
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>

                  {activeTab === 'inbox' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.isRead}
                        onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Semua</option>
                        <option value="false">Belum Dibaca</option>
                        <option value="true">Sudah Dibaca</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lampiran (Maks. 10 file, 10MB per file)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Lampiran ({selectedMessage.attachments.length})</p>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, index) => {
                      const isImage = attachment.mimeType?.startsWith('image/');
                      const attachmentUrl = messageApi.getAttachmentUrl(tenantId!, attachment.filename);
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1">
                            {isImage ? (
                              <img 
                                src={attachmentUrl} 
                                alt={attachment.originalName}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{attachment.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            {isImage ? 'Lihat' : 'Download'}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Conversations Tab Content */}
        {activeTab === 'conversations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Grup Percakapan</h2>
              <Button
                onClick={() => setIsConversationModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Grup
              </Button>
            </div>

            {conversationsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat conversations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversationsData?.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setIsConversationViewOpen(true);
                    }}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {conversation.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{conversation.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {conversation.members.length} anggota
                        </p>
                        {conversation.description && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{conversation.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {conversationsData?.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">Belum ada grup percakapan</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Conversation Modal */}
        <Modal
          isOpen={isConversationModalOpen}
          onClose={() => setIsConversationModalOpen(false)}
          title="Buat Grup Percakapan"
          size="lg"
        >
          <CreateConversationForm
            tenantId={tenantId}
            onSuccess={() => {
              setIsConversationModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['conversations', tenantId] });
            }}
          />
        </Modal>

        {/* Conversation View Modal */}
        <Modal
          isOpen={isConversationViewOpen}
          onClose={() => {
            setIsConversationViewOpen(false);
            setSelectedConversation(null);
          }}
          title={selectedConversation?.name || 'Grup Percakapan'}
          size="lg"
        >
          {selectedConversation && (
            <ConversationView
              conversation={selectedConversation}
              tenantId={tenantId}
              messages={conversationMessagesData?.data || []}
              isLoading={conversationMessagesLoading}
            />
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}

// Create Conversation Form Component
function CreateConversationForm({
  tenantId,
  onSuccess,
}: {
  tenantId: number | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<ConversationCreateData>({
    name: '',
    memberIds: [],
    description: '',
  });
  const queryClient = useQueryClient();

  // Get users for member selection (simplified - you may want to fetch from API)
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: number; name: string }>>([]);

  const createMutation = useMutation({
    mutationFn: (data: ConversationCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return conversationApi.create(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', tenantId] });
      onSuccess();
    },
  });

  // TODO: Fetch users from API
  // For now, using placeholder
  const handleMemberToggle = (userId: number) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tenantId || formData.memberIds.length === 0) {
          alert('Pilih minimal 1 anggota');
          return;
        }
        createMutation.mutate(formData);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Grup <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Anggota <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Pilih minimal 1 anggota untuk membuat grup
        </p>
        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
          <p className="text-sm text-gray-500 text-center py-4">
            Fitur pemilihan anggota akan diimplementasikan dengan API users/students/teachers
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFormData({ name: '', memberIds: [], description: '' });
          }}
        >
          Reset
        </Button>
        <Button type="submit" loading={createMutation.isPending}>
          Buat Grup
        </Button>
      </div>
    </form>
  );
}

// Conversation View Component
function ConversationView({
  conversation,
  tenantId,
  messages,
  isLoading,
}: {
  conversation: Conversation;
  tenantId: number | null;
  messages: Message[];
  isLoading: boolean;
}) {
  const [messageContent, setMessageContent] = useState('');
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (data: MessageCreateData) => {
      if (!tenantId) throw new Error('Tenant ID tidak tersedia');
      return messageApi.create(tenantId, { ...data, conversationId: conversation.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', conversation.id, tenantId] });
      setMessageContent('');
    },
  });

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Anggota ({conversation.members.length})</p>
        <div className="flex flex-wrap gap-2">
          {conversation.members.map((member) => (
            <span
              key={member.id}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {member.userName} {member.role === 'admin' && '(Admin)'}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-gray-800">{message.sender_name}</span>
                <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Belum ada pesan dalam grup ini</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!messageContent.trim() || !tenantId) return;
          sendMessageMutation.mutate({
            subject: `Pesan di ${conversation.name}`,
            content: messageContent,
            priority: 'medium',
          });
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" loading={sendMessageMutation.isPending}>
          Kirim
        </Button>
      </form>
    </div>
  );
}
