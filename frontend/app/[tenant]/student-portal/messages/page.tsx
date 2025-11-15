'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import Pagination from '@/components/student/Pagination';
import { messageApi, Message, MessageCreateData } from '@/lib/api/message';
import { MessageSquare, Search, Filter, Send, Reply, Mail, MailOpen, Plus, User } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/lib/store/auth';
import { useToastStore } from '@/lib/store/toast';
import apiClient from '@/lib/api/client';

export default function StudentMessagesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'inbox' | 'sent' | 'unread' | 'read'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [composeForm, setComposeForm] = useState<MessageCreateData>({
    subject: '',
    content: '',
    recipient_id: undefined,
    recipient_type: 'user',
    priority: 'medium',
  });
  const [replyForm, setReplyForm] = useState({
    content: '',
  });
  const [sending, setSending] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const { success, error: showError } = useToastStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
        
        if (tenantIdNum) {
          try {
            let response;
            if (filterStatus === 'sent') {
              response = await messageApi.getSent(tenantIdNum);
            } else {
              response = await messageApi.getInbox(tenantIdNum);
            }
            setMessages(Array.isArray(response.data) ? response.data : []);
          } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError(err.response?.data?.message || 'Gagal memuat pesan');
          }
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, filterStatus]);

  // Fetch teachers for compose message
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
        if (tenantIdNum) {
          const response = await apiClient.get(`/tenants/${tenantIdNum}/teachers`, {
            params: { limit: 100 },
          });
          if (response.data?.data) {
            setTeachers(Array.isArray(response.data.data) ? response.data.data : []);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch teachers:', err);
      }
    };

    if (isComposeModalOpen) {
      fetchTeachers();
    }
  }, [tenantId, isComposeModalOpen]);

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter(m => m.status === 'unread');
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(m => m.status === 'read');
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.subject?.toLowerCase().includes(query) ||
        m.content?.toLowerCase().includes(query) ||
        m.sender_name?.toLowerCase().includes(query) ||
        m.recipient_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [messages, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleViewDetail = async (message: Message) => {
    setSelectedMessage(message);
    setIsDetailModalOpen(true);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
      if (tenantIdNum) {
        try {
          await messageApi.markAsRead(tenantIdNum, message.id);
          setMessages(prev => prev.map(m => 
            m.id === message.id ? { ...m, status: 'read' as const } : m
          ));
        } catch (err) {
          console.error('Failed to mark as read:', err);
        }
      }
    }
  };

  const handleCompose = () => {
    setComposeForm({
      subject: '',
      content: '',
      recipient_id: undefined,
      recipient_type: 'user',
      priority: 'medium',
    });
    setIsComposeModalOpen(true);
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyForm({
      content: '',
    });
    setIsReplyModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!composeForm.subject || !composeForm.content || !composeForm.recipient_id) {
      showError('Harap lengkapi semua field yang diperlukan');
      return;
    }

    try {
      setSending(true);
      const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
      if (tenantIdNum) {
        await messageApi.create(tenantIdNum, composeForm);
        success('Pesan berhasil dikirim');
        setIsComposeModalOpen(false);
        setComposeForm({
          subject: '',
          content: '',
          recipient_id: undefined,
          recipient_type: 'user',
          priority: 'medium',
        });
        // Refresh messages based on current filter
        if (filterStatus === 'sent') {
          const response = await messageApi.getSent(tenantIdNum);
          setMessages(Array.isArray(response.data) ? response.data : []);
        } else {
          // Refresh inbox if viewing inbox
          const response = await messageApi.getInbox(tenantIdNum);
          setMessages(Array.isArray(response.data) ? response.data : []);
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      showError(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyForm.content || !selectedMessage) {
      showError('Harap isi balasan');
      return;
    }

    try {
      setSending(true);
      const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
      if (tenantIdNum) {
        await messageApi.create(tenantIdNum, {
          subject: `Re: ${selectedMessage.subject}`,
          content: replyForm.content,
          recipient_id: selectedMessage.sender_id,
          recipient_type: 'user',
          priority: selectedMessage.priority || 'medium',
        });
        success('Balasan berhasil dikirim');
        setIsReplyModalOpen(false);
        setReplyForm({ content: '' });
        // Refresh inbox
        const response = await messageApi.getInbox(tenantIdNum);
        setMessages(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      console.error('Error sending reply:', err);
      showError(err.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Pesan
            </h1>
            <p className="text-gray-600 mt-1">Komunikasi dengan guru dan sekolah</p>
          </div>
          <button
            onClick={handleCompose}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tulis Pesan
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari pesan (subjek, konten, pengirim)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Filter:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'inbox', label: 'Kotak Masuk', icon: Mail },
              { key: 'sent', label: 'Terkirim', icon: Send },
              { key: 'unread', label: 'Belum Dibaca', icon: Mail },
              { key: 'read', label: 'Sudah Dibaca', icon: MailOpen },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  filterStatus === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Menampilkan {filteredMessages.length} dari {messages.length} pesan
            </p>
          )}
        </div>

        {/* Messages List */}
        {filteredMessages.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                    message.status === 'unread' 
                      ? 'border-blue-500 bg-blue-50/30' 
                      : 'border-gray-300'
                  } hover:shadow-xl transition-all cursor-pointer`}
                  onClick={() => handleViewDetail(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {message.status === 'unread' ? (
                          <Mail className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MailOpen className="w-5 h-5 text-gray-400" />
                        )}
                        <h2 className={`text-lg font-bold ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.subject}
                        </h2>
                        {message.priority === 'high' && (
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                            Penting
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {filterStatus === 'sent' 
                              ? `Kepada: ${message.recipient_name || '-'}`
                              : `Dari: ${message.sender_name || '-'}`
                            }
                          </span>
                        </div>
                        <span>{message.created_at ? formatDate(message.created_at) : '-'}</span>
                      </div>
                    </div>
                    {filterStatus === 'inbox' && message.status === 'read' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                        }}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Balas pesan"
                      >
                        <Reply className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <EmptyState
              icon={MessageSquare}
              title={searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada pesan"}
              description={searchQuery
                ? `Tidak ada pesan yang sesuai dengan pencarian "${searchQuery}".`
                : filterStatus === 'sent'
                ? "Anda belum mengirim pesan apapun."
                : "Tidak ada pesan masuk untuk saat ini."}
            />
          </div>
        )}

        {/* Detail Modal */}
        {selectedMessage && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedMessage(null);
            }}
            title={selectedMessage.subject}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {filterStatus === 'sent'
                      ? `Kepada: ${selectedMessage.recipient_name || '-'}`
                      : `Dari: ${selectedMessage.sender_name || '-'}`
                    }
                  </span>
                </div>
                <span>{selectedMessage.created_at ? formatDate(selectedMessage.created_at) : '-'}</span>
                {selectedMessage.priority === 'high' && (
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                    Penting
                  </span>
                )}
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{selectedMessage.content}</p>
              </div>

              {filterStatus === 'inbox' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleReply(selectedMessage);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Balas Pesan
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Compose Modal */}
        <Modal
          isOpen={isComposeModalOpen}
          onClose={() => {
            setIsComposeModalOpen(false);
            setComposeForm({
              subject: '',
              content: '',
              recipient_id: undefined,
              recipient_type: 'user',
              priority: 'medium',
            });
          }}
          title="Tulis Pesan Baru"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kepada (Guru)
              </label>
              <select
                value={composeForm.recipient_id || ''}
                onChange={(e) => setComposeForm({ ...composeForm, recipient_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Guru</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjek
              </label>
              <input
                type="text"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Subjek pesan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas
              </label>
              <select
                value={composeForm.priority}
                onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Pesan
              </label>
              <textarea
                value={composeForm.content}
                onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tulis pesan Anda di sini..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setIsComposeModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !composeForm.subject || !composeForm.content || !composeForm.recipient_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Reply Modal */}
        {selectedMessage && (
          <Modal
            isOpen={isReplyModalOpen}
            onClose={() => {
              setIsReplyModalOpen(false);
              setReplyForm({ content: '' });
            }}
            title={`Balas: ${selectedMessage.subject}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Dari:</strong> {selectedMessage.sender_name || '-'}
                </p>
                <p className="text-sm text-gray-700">{selectedMessage.content}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balasan Anda
                </label>
                <textarea
                  value={replyForm.content}
                  onChange={(e) => setReplyForm({ content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis balasan Anda di sini..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyForm.content}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Balasan
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </StudentLayout>
  );
}

