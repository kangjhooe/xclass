'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { libraryApi, Book, BookCreateData } from '@/lib/api/library';
import { studentsApi } from '@/lib/api/students';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function LibraryPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<BookCreateData>({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    year: new Date().getFullYear(),
    category: '',
    totalCopies: 1,
    description: '',
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['library-books', resolvedTenantId, currentPage],
    queryFn: () => libraryApi.getAllBooks(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: BookCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return libraryApi.createBook(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return libraryApi.updateBook(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', resolvedTenantId] });
      setIsModalOpen(false);
      setSelectedBook(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return libraryApi.deleteBook(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books', resolvedTenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      isbn: '',
      author: '',
      publisher: '',
      year: new Date().getFullYear(),
      category: '',
      totalCopies: 1,
      description: '',
      isActive: true,
    });
    setSelectedBook(null);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      isbn: book.isbn || '',
      author: book.author || '',
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      category: book.category || '',
      totalCopies: book.totalCopies || 1,
      description: book.description || '',
      isActive: book.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBook) {
      updateMutation.mutate({ id: selectedBook.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`Exporting to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const totalPages = data ? Math.ceil((data.total || 0) / itemsPerPage) : 1;
  const paginatedData = data?.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Perpustakaan</h1>
          <div className="flex space-x-2">
            <ExportButton onExport={handleExport} filename="buku" />
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Tambah Buku
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Pengarang</TableHead>
                    <TableHead>Penerbit</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Tersedia</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.isbn || '-'}</TableCell>
                      <TableCell>{book.author || '-'}</TableCell>
                      <TableCell>{book.publisher || '-'}</TableCell>
                      <TableCell>{book.year || '-'}</TableCell>
                      <TableCell>{book.category || '-'}</TableCell>
                      <TableCell>{book.totalCopies || 0}</TableCell>
                      <TableCell>
                        <span className={book.availableCopies === 0 ? 'text-red-600 font-semibold' : ''}>
                          {book.availableCopies || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(book)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Tidak ada data buku
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

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedBook ? 'Edit Buku' : 'Tambah Buku'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Eksemplar</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                {selectedBook ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TenantLayout>
  );
}

