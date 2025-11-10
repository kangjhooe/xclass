'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cardManagementApi, Card, CardCreateData } from '@/lib/api/card-management';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CardManagementPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenant as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<CardCreateData>({
    card_number: '',
    card_type: 'student',
    student_id: undefined,
    teacher_id: undefined,
    qr_code: '',
    nfc_id: '',
    status: 'active',
    issued_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cards', tenantId],
    queryFn: () => cardManagementApi.getAll(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CardCreateData) => cardManagementApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CardCreateData> }) =>
      cardManagementApi.update(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', tenantId] });
      setIsModalOpen(false);
      setSelectedCard(null);
      resetForm();
    },
  });

  const blockMutation = useMutation({
    mutationFn: (id: number) => cardManagementApi.block(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', tenantId] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: number) => cardManagementApi.unblock(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cardManagementApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      card_number: '',
      card_type: 'student',
      student_id: undefined,
      teacher_id: undefined,
      qr_code: '',
      nfc_id: '',
      status: 'active',
      issued_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
    });
    setSelectedCard(null);
  };

  const handleEdit = (card: Card) => {
    setSelectedCard(card);
    setFormData({
      card_number: card.card_number,
      card_type: card.card_type || 'student',
      student_id: card.student_id,
      teacher_id: card.teacher_id,
      qr_code: card.qr_code || '',
      nfc_id: card.nfc_id || '',
      status: card.status || 'active',
      issued_date: card.issued_date ? card.issued_date.split('T')[0] : new Date().toISOString().split('T')[0],
      expiry_date: card.expiry_date ? card.expiry_date.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCard) {
      updateMutation.mutate({ id: selectedCard.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredData = data?.data?.filter((card) => {
    if (filterType !== 'all' && card.card_type !== filterType) return false;
    if (filterStatus !== 'all' && card.status !== filterStatus) return false;
    return true;
  }) || [];

  const totalCards = data?.data?.length || 0;
  const activeCards = data?.data?.filter((c) => c.status === 'active').length || 0;
  const blockedCards = data?.data?.filter((c) => c.status === 'blocked').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Manajemen Kartu
              </h1>
              <p className="text-gray-600">Manajemen kartu siswa, guru, dan staf</p>
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
              Tambah Kartu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kartu</p>
                <p className="text-3xl font-bold text-blue-600">{totalCards}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kartu Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeCards}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kartu Diblokir</p>
                <p className="text-3xl font-bold text-red-600">{blockedCards}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tipe</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
                <option value="staff">Staf</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="blocked">Diblokir</option>
                <option value="lost">Hilang</option>
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
                    <TableHead className="font-semibold text-gray-700">No. Kartu</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                    <TableHead className="font-semibold text-gray-700">Pemilik</TableHead>
                    <TableHead className="font-semibold text-gray-700">QR Code</TableHead>
                    <TableHead className="font-semibold text-gray-700">NFC ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Terbit</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((card) => (
                    <TableRow key={card.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{card.card_number}</TableCell>
                      <TableCell>
                        {card.card_type === 'student' ? 'Siswa' :
                         card.card_type === 'teacher' ? 'Guru' :
                         card.card_type === 'staff' ? 'Staf' : '-'}
                      </TableCell>
                      <TableCell>{card.student_name || card.teacher_name || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{card.qr_code || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{card.nfc_id || '-'}</TableCell>
                      <TableCell>{card.issued_date ? formatDate(card.issued_date) : '-'}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          card.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : card.status === 'blocked'
                            ? 'bg-red-500 text-white'
                            : card.status === 'lost'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {card.status === 'active' ? 'Aktif' :
                           card.status === 'inactive' ? 'Tidak Aktif' :
                           card.status === 'blocked' ? 'Diblokir' :
                           card.status === 'lost' ? 'Hilang' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(card)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Edit
                          </Button>
                          {card.status === 'blocked' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unblockMutation.mutate(card.id)}
                              className="hover:bg-green-50 hover:border-green-300 transition-colors"
                              loading={unblockMutation.isPending}
                            >
                              Buka Blokir
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => blockMutation.mutate(card.id)}
                              className="hover:bg-red-50 hover:border-red-300 transition-colors"
                              loading={blockMutation.isPending}
                            >
                              Blokir
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus kartu ini?')) {
                                deleteMutation.mutate(card.id);
                              }
                            }}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Belum ada data kartu</p>
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
          title={selectedCard ? 'Edit Kartu' : 'Tambah Kartu'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Kartu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.card_number}
                  onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kartu</label>
                <select
                  value={formData.card_type}
                  onChange={(e) => setFormData({ ...formData, card_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                  <option value="staff">Staf</option>
                </select>
              </div>

              {formData.card_type === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Siswa</label>
                  <input
                    type="number"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              )}

              {formData.card_type === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Guru</label>
                  <input
                    type="number"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                <input
                  type="text"
                  value={formData.qr_code}
                  onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NFC ID</label>
                <input
                  type="text"
                  value={formData.nfc_id}
                  onChange={(e) => setFormData({ ...formData, nfc_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terbit</label>
                <input
                  type="date"
                  value={formData.issued_date}
                  onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kedaluwarsa</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="blocked">Diblokir</option>
                  <option value="lost">Hilang</option>
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
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedCard ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}
