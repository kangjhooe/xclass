'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
  CheckCircle2,
  Paperclip,
  Plus,
} from 'lucide-react';

interface Message {
  id: number;
  senderName: string;
  senderId: number;
  senderType: 'student' | 'parent' | 'admin';
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  attachments?: Array<{ id: number; name: string; url: string }>;
}

interface Conversation {
  id: number;
  participantName: string;
  participantId: number;
  participantType: 'student' | 'parent';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

export default function TeacherMessagesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [tenantId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation, tenantId]);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/messages/conversations`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/messages/conversations/${selectedConversation}`,
        {
          headers: { 'X-Tenant-NPSN': tenantId },
        }
      );
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await apiClient.post(
        `/tenants/${tenantId}/messages`,
        {
          conversationId: selectedConversation,
          content: newMessage,
        },
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );
      setNewMessage('');
      fetchMessages();
      fetchConversations();
    } catch (error: any) {
      alert('Gagal mengirim pesan: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Pesan
            </h1>
            <p className="text-gray-600 mt-1">Komunikasi dengan siswa dan orang tua</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-md flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {conversation.participantName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessageTime).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Tidak ada percakapan</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col">
            {selectedConversation && selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedConv.participantName}</p>
                      <p className="text-sm text-gray-600">
                        {selectedConv.participantType === 'student' ? 'Siswa' : 'Orang Tua'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'admin' || message.senderType === 'teacher' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === 'admin' || message.senderType === 'teacher'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm mb-1">{message.content}</p>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <p
                              className={`text-xs ${
                                message.senderType === 'admin' || message.senderType === 'teacher'
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {message.senderType === 'admin' || message.senderType === 'teacher' ? (
                              <CheckCircle2 className="w-3 h-3 text-blue-100" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Belum ada pesan</p>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ketik pesan..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Kirim
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">Pilih percakapan untuk mulai chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
