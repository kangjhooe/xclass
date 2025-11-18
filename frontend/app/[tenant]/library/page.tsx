'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { libraryApi, Book, BookCreateData, BookLoan, BookLoanCreateData, BookLoanReturnData, BookStatus, BookCondition, LoanStatus, LibraryStatistics } from '@/lib/api/library';
import { studentsApi } from '@/lib/api/students';
import { teachersApi } from '@/lib/api/teachers';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import { storageApi } from '@/lib/api/storage';
import { FileUpload } from '@/components/ui/FileUpload';

type TabType = 'books' | 'loans' | 'statistics';

export default function LibraryPage() {
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLoanPage, setCurrentLoanPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | ''>('');
  const [filterLoanStatus, setFilterLoanStatus] = useState<LoanStatus | ''>('');

  const [bookFormData, setBookFormData] = useState<BookCreateData>({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    category: '',
    subcategory: '',
    language: 'id',
    pages: undefined,
    description: '',
    totalCopies: 1,
    location: '',
    shelfNumber: '',
    price: undefined,
    status: BookStatus.AVAILABLE,
    condition: BookCondition.GOOD,
    purchaseDate: undefined,
    purchasePrice: undefined,
    donor: '',
    notes: '',
    isOnline: false,
    isPublic: false,
    allowDownload: false,
  });

  const [loanFormData, setLoanFormData] = useState<BookLoanCreateData>({
    bookId: 0,
    studentId: undefined,
    teacherId: undefined,
    staffId: undefined,
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    loanNotes: '',
  });

  const [returnFormData, setReturnFormData] = useState<BookLoanReturnData>({
    returnNotes: '',
    fineAmount: 0,
  });

  const queryClient = useQueryClient();

  // Books query
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['library-books', currentPage, searchTerm, filterCategory, filterStatus],
    queryFn: () => libraryApi.getAllBooks({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      category: filterCategory || undefined,
      status: filterStatus || undefined,
    }),
  });

  // Loans query
  const { data: loansData, isLoading: loansLoading } = useQuery({
    queryKey: ['library-loans', currentLoanPage, filterLoanStatus],
    queryFn: () => libraryApi.getAllLoans({
      page: currentLoanPage,
      limit: itemsPerPage,
      status: filterLoanStatus || undefined,
    }),
    enabled: activeTab === 'loans',
  });

  // Overdue loans query
  const { data: overdueLoans, isLoading: overdueLoading } = useQuery({
    queryKey: ['library-overdue'],
    queryFn: () => libraryApi.getOverdueLoans(),
    enabled: activeTab === 'statistics',
  });

  // Statistics query
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['library-statistics'],
    queryFn: () => libraryApi.getStatistics(),
    enabled: activeTab === 'statistics',
  });

  // Students query for loan form
  const { data: studentsData } = useQuery({
    queryKey: ['students-for-loan', tenantId],
    queryFn: () => studentsApi.getAll(tenantId!, { page: 1, limit: 1000 }),
    enabled: isLoanModalOpen && !!tenantId,
  });

  // Teachers query for loan form
  const { data: teachersData } = useQuery({
    queryKey: ['teachers-for-loan', tenantId],
    queryFn: () => teachersApi.getAll(tenantId!, { page: 1, limit: 1000 }),
    enabled: isLoanModalOpen && !!tenantId,
  });

  // Book mutations
  const createBookMutation = useMutation({
    mutationFn: (data: BookCreateData) => libraryApi.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-statistics'] });
      setIsBookModalOpen(false);
      resetBookForm();
      success('Buku berhasil ditambahkan');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menambahkan buku');
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookCreateData> }) =>
      libraryApi.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-statistics'] });
      setIsBookModalOpen(false);
      setSelectedBook(null);
      resetBookForm();
      success('Buku berhasil diperbarui');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal memperbarui buku');
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => libraryApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-statistics'] });
      success('Buku berhasil dihapus');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menghapus buku');
    },
  });

  // Loan mutations
  const createLoanMutation = useMutation({
    mutationFn: (data: BookLoanCreateData) => libraryApi.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-statistics'] });
      setIsLoanModalOpen(false);
      resetLoanForm();
      success('Peminjaman berhasil dibuat');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal membuat peminjaman');
    },
  });

  const returnLoanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookLoanReturnData }) =>
      libraryApi.returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['library-overdue'] });
      setIsReturnModalOpen(false);
      setSelectedLoan(null);
      resetReturnForm();
      success('Buku berhasil dikembalikan');
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengembalikan buku');
    },
  });

  const resetBookForm = () => {
    setBookFormData({
      title: '',
      isbn: '',
      author: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      category: '',
      subcategory: '',
      language: 'id',
      pages: undefined,
      description: '',
      totalCopies: 1,
      location: '',
      shelfNumber: '',
      price: undefined,
      status: BookStatus.AVAILABLE,
      condition: BookCondition.GOOD,
      purchaseDate: undefined,
      purchasePrice: undefined,
      donor: '',
      notes: '',
      isOnline: false,
      isPublic: false,
      allowDownload: false,
    });
    setSelectedBook(null);
    setCoverImagePreview(null);
    setCoverImageFile(null);
    setPdfFile(null);
  };

  const resetLoanForm = () => {
    setLoanFormData({
      bookId: 0,
      studentId: undefined,
      teacherId: undefined,
      staffId: undefined,
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loanNotes: '',
    });
  };

  const resetReturnForm = () => {
    setReturnFormData({
      returnNotes: '',
      fineAmount: 0,
    });
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setBookFormData({
      title: book.title,
      isbn: book.isbn || '',
      author: book.author,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      category: book.category || '',
      subcategory: book.subcategory || '',
      language: book.language || 'id',
      pages: book.pages,
      description: book.description || '',
      totalCopies: book.totalCopies,
      location: book.location || '',
      shelfNumber: book.shelfNumber || '',
      price: book.price,
      status: book.status,
      condition: book.condition,
      purchaseDate: book.purchaseDate ? book.purchaseDate.split('T')[0] : undefined,
      purchasePrice: book.purchasePrice,
      donor: book.donor || '',
      notes: book.notes || '',
      isOnline: book.isOnline,
      isPublic: book.isPublic,
      allowDownload: book.allowDownload,
      coverImage: book.coverImage,
      pdfFile: book.pdfFile,
      pdfFileName: book.pdfFileName,
      pdfFileSize: book.pdfFileSize,
    });
    setCoverImagePreview(book.coverImage || null);
    setIsBookModalOpen(true);
  };

  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBook) {
      updateBookMutation.mutate({ id: selectedBook.id, data: bookFormData });
    } else {
      createBookMutation.mutate(bookFormData);
    }
  };

  const handleDeleteBook = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      deleteBookMutation.mutate(id);
    }
  };

  const handleCreateLoan = (book: Book) => {
    setLoanFormData({
      ...loanFormData,
      bookId: book.id,
    });
    setIsLoanModalOpen(true);
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanFormData.bookId) {
      showError('Pilih buku terlebih dahulu');
      return;
    }
    if (!loanFormData.studentId && !loanFormData.teacherId && !loanFormData.staffId) {
      showError('Pilih peminjam (siswa, guru, atau staff)');
      return;
    }
    createLoanMutation.mutate(loanFormData);
  };

  const handleViewDetail = async (book: Book) => {
    try {
      const bookDetail = await libraryApi.getBookById(book.id);
      setDetailBook(bookDetail);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal memuat detail buku');
    }
  };

  const handleCoverImageUpload = async (files: File[]) => {
    if (!files[0] || !tenantId) return;
    
    setIsUploadingCover(true);
    try {
      const file = files[0];
      const uploadResult = await storageApi.upload(tenantId, file, {
        category: 'library',
        folder: 'covers',
      });
      
      setBookFormData({ ...bookFormData, coverImage: uploadResult.data.url });
      setCoverImagePreview(uploadResult.data.url);
      setCoverImageFile(file);
      success('Cover image berhasil diupload');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mengupload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePdfUpload = async (files: File[]) => {
    if (!files[0] || !tenantId) return;
    
    setIsUploadingPdf(true);
    try {
      const file = files[0];
      const uploadResult = await storageApi.upload(tenantId, file, {
        category: 'library',
        folder: 'ebooks',
      });
      
      setBookFormData({
        ...bookFormData,
        pdfFile: uploadResult.data.url,
        pdfFileName: uploadResult.data.original_name,
        pdfFileSize: uploadResult.data.size,
        isOnline: true,
      });
      setPdfFile(file);
      success('PDF berhasil diupload');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mengupload PDF');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (format === 'csv') {
      try {
        const allBooks = await libraryApi.getAllBooks({ page: 1, limit: 10000 });
        const headers = ['Judul', 'ISBN', 'Pengarang', 'Penerbit', 'Tahun', 'Kategori', 'Total', 'Tersedia', 'Status'];
        const rows = allBooks.data.map(book => [
          book.title,
          book.isbn || '',
          book.author,
          book.publisher,
          book.publicationYear?.toString() || '',
          book.category || '',
          book.totalCopies.toString(),
          book.availableCopies.toString(),
          book.status,
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `buku_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        success('Data berhasil diekspor ke CSV');
      } catch (err: any) {
        showError('Gagal mengekspor data');
      }
    } else {
      showError(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
    }
  };

  const handleReturnLoan = (loan: BookLoan) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    returnLoanMutation.mutate({ id: selectedLoan.id, data: returnFormData });
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`Exporting to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const getStatusBadge = (status: BookStatus | LoanStatus) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      [BookStatus.AVAILABLE]: { label: 'Tersedia', className: 'bg-green-100 text-green-800' },
      [BookStatus.UNAVAILABLE]: { label: 'Tidak Tersedia', className: 'bg-red-100 text-red-800' },
      [BookStatus.MAINTENANCE]: { label: 'Perawatan', className: 'bg-yellow-100 text-yellow-800' },
      [BookStatus.LOST]: { label: 'Hilang', className: 'bg-gray-100 text-gray-800' },
      [BookStatus.DAMAGED]: { label: 'Rusak', className: 'bg-orange-100 text-orange-800' },
      [LoanStatus.ACTIVE]: { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      [LoanStatus.RETURNED]: { label: 'Dikembalikan', className: 'bg-green-100 text-green-800' },
      [LoanStatus.OVERDUE]: { label: 'Terlambat', className: 'bg-red-100 text-red-800' },
      [LoanStatus.LOST]: { label: 'Hilang', className: 'bg-gray-100 text-gray-800' },
      [LoanStatus.DAMAGED]: { label: 'Rusak', className: 'bg-orange-100 text-orange-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Perpustakaan</h1>
          {activeTab === 'books' && (
            <div className="flex space-x-2">
              <ExportButton onExport={handleExport} filename="buku" />
              <Button
                onClick={() => {
                  resetBookForm();
                  setIsBookModalOpen(true);
                }}
              >
                Tambah Buku
              </Button>
            </div>
          )}
          {activeTab === 'loans' && (
            <Button
              onClick={() => {
                resetLoanForm();
                setIsLoanModalOpen(true);
              }}
            >
              Peminjaman Baru
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('books')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buku ({booksData?.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Peminjaman ({loansData?.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistik
            </button>
          </nav>
        </div>

        {/* Books Tab */}
        {activeTab === 'books' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Cari buku (judul, pengarang, ISBN)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {Array.from(new Set(booksData?.data.map(b => b.category).filter(Boolean))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as BookStatus | '');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value={BookStatus.AVAILABLE}>Tersedia</option>
                <option value={BookStatus.UNAVAILABLE}>Tidak Tersedia</option>
                <option value={BookStatus.MAINTENANCE}>Perawatan</option>
                <option value={BookStatus.LOST}>Hilang</option>
                <option value={BookStatus.DAMAGED}>Rusak</option>
              </select>
            </div>

            {booksLoading ? (
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
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booksData?.data.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.isbn || '-'}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.publisher}</TableCell>
                          <TableCell>{book.publicationYear || '-'}</TableCell>
                          <TableCell>{book.category || '-'}</TableCell>
                          <TableCell>{book.totalCopies}</TableCell>
                          <TableCell>
                            <span className={book.availableCopies === 0 ? 'text-red-600 font-semibold' : ''}>
                              {book.availableCopies}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(book.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(book)}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBook(book)}
                              >
                                Edit
                              </Button>
                              {book.availableCopies > 0 && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleCreateLoan(book)}
                                >
                                  Pinjam
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!booksData?.data || booksData.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                            Tidak ada data buku
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {booksData && booksData.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={booksData.totalPages}
                    totalItems={booksData.total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <>
            {/* Filters */}
            <div className="mb-4">
              <select
                value={filterLoanStatus}
                onChange={(e) => {
                  setFilterLoanStatus(e.target.value as LoanStatus | '');
                  setCurrentLoanPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value={LoanStatus.ACTIVE}>Aktif</option>
                <option value={LoanStatus.RETURNED}>Dikembalikan</option>
                <option value={LoanStatus.OVERDUE}>Terlambat</option>
              </select>
            </div>

            {loansLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buku</TableHead>
                        <TableHead>Peminjam</TableHead>
                        <TableHead>Tanggal Pinjam</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Tanggal Kembali</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Denda</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loansData?.data.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {loan.book?.title || `Buku #${loan.bookId}`}
                          </TableCell>
                          <TableCell>
                            {loan.student?.name || loan.teacher?.name || `Staff #${loan.staffId}` || '-'}
                          </TableCell>
                          <TableCell>{formatDate(loan.loanDate)}</TableCell>
                          <TableCell>
                            <span className={new Date(loan.dueDate) < new Date() && loan.status === LoanStatus.ACTIVE ? 'text-red-600 font-semibold' : ''}>
                              {formatDate(loan.dueDate)}
                            </span>
                          </TableCell>
                          <TableCell>{loan.returnDate ? formatDate(loan.returnDate) : '-'}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell>
                            {loan.fineAmount ? (
                              <span className={loan.finePaid ? 'text-green-600' : 'text-red-600 font-semibold'}>
                                Rp {loan.fineAmount.toLocaleString('id-ID')} {loan.finePaid ? '(Lunas)' : '(Belum Lunas)'}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {loan.status === LoanStatus.ACTIVE && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleReturnLoan(loan)}
                              >
                                Kembalikan
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!loansData?.data || loansData.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Tidak ada data peminjaman
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {loansData && loansData.totalPages > 1 && (
                  <Pagination
                    currentPage={currentLoanPage}
                    totalPages={loansData.totalPages}
                    totalItems={loansData.total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentLoanPage}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <>
            {statsLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Buku</h3>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.totalBooks || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Buku Tersedia</h3>
                  <p className="text-3xl font-bold text-green-600">{statistics?.availableBooks || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Buku Dipinjam</h3>
                  <p className="text-3xl font-bold text-blue-600">{statistics?.borrowedBooks || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Peminjaman Aktif</h3>
                  <p className="text-3xl font-bold text-purple-600">{statistics?.activeLoans || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Terlambat</h3>
                  <p className="text-3xl font-bold text-red-600">{statistics?.overdueLoans || 0}</p>
                </div>
              </div>
            )}

            {/* Overdue Loans */}
            {overdueLoading ? (
              <div className="text-center py-4">Memuat data...</div>
            ) : overdueLoans && overdueLoans.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Peminjaman Terlambat</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buku</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Terlambat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueLoans.map((loan) => {
                      const daysOverdue = Math.floor((new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {loan.book?.title || `Buku #${loan.bookId}`}
                          </TableCell>
                          <TableCell>
                            {loan.student?.name || loan.teacher?.name || `Staff #${loan.staffId}` || '-'}
                          </TableCell>
                          <TableCell>{formatDate(loan.loanDate)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{formatDate(loan.dueDate)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{daysOverdue} hari</TableCell>
                          <TableCell>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReturnLoan(loan)}
                            >
                              Kembalikan
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Tidak ada peminjaman terlambat
              </div>
            )}
          </>
        )}

        {/* Book Modal */}
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            resetBookForm();
          }}
          title={selectedBook ? 'Edit Buku' : 'Tambah Buku'}
          size="lg"
        >
          <form onSubmit={handleSubmitBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  value={bookFormData.isbn}
                  onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pengarang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookFormData.author}
                  onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penerbit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookFormData.publisher}
                  onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                <input
                  type="number"
                  value={bookFormData.publicationYear}
                  onChange={(e) => setBookFormData({ ...bookFormData, publicationYear: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={bookFormData.category}
                  onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subkategori</label>
                <input
                  type="text"
                  value={bookFormData.subcategory}
                  onChange={(e) => setBookFormData({ ...bookFormData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa</label>
                <select
                  value={bookFormData.language}
                  onChange={(e) => setBookFormData({ ...bookFormData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="id">Indonesia</option>
                  <option value="en">English</option>
                  <option value="ar">Arab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Halaman</label>
                <input
                  type="number"
                  value={bookFormData.pages || ''}
                  onChange={(e) => setBookFormData({ ...bookFormData, pages: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Eksemplar</label>
                <input
                  type="number"
                  min="1"
                  value={bookFormData.totalCopies}
                  onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={bookFormData.location}
                  onChange={(e) => setBookFormData({ ...bookFormData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rak</label>
                <input
                  type="text"
                  value={bookFormData.shelfNumber}
                  onChange={(e) => setBookFormData({ ...bookFormData, shelfNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                <input
                  type="number"
                  value={bookFormData.price || ''}
                  onChange={(e) => setBookFormData({ ...bookFormData, price: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={bookFormData.status}
                  onChange={(e) => setBookFormData({ ...bookFormData, status: e.target.value as BookStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={BookStatus.AVAILABLE}>Tersedia</option>
                  <option value={BookStatus.UNAVAILABLE}>Tidak Tersedia</option>
                  <option value={BookStatus.MAINTENANCE}>Perawatan</option>
                  <option value={BookStatus.LOST}>Hilang</option>
                  <option value={BookStatus.DAMAGED}>Rusak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                <select
                  value={bookFormData.condition}
                  onChange={(e) => setBookFormData({ ...bookFormData, condition: e.target.value as BookCondition })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={BookCondition.EXCELLENT}>Sangat Baik</option>
                  <option value={BookCondition.GOOD}>Baik</option>
                  <option value={BookCondition.FAIR}>Cukup</option>
                  <option value={BookCondition.POOR}>Buruk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembelian</label>
                <input
                  type="date"
                  value={bookFormData.purchaseDate || ''}
                  onChange={(e) => setBookFormData({ ...bookFormData, purchaseDate: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli</label>
                <input
                  type="number"
                  value={bookFormData.purchasePrice || ''}
                  onChange={(e) => setBookFormData({ ...bookFormData, purchasePrice: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donatur</label>
                <input
                  type="text"
                  value={bookFormData.donor}
                  onChange={(e) => setBookFormData({ ...bookFormData, donor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={bookFormData.description}
                  onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={bookFormData.notes}
                  onChange={(e) => setBookFormData({ ...bookFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                {coverImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-32 h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview(null);
                        setCoverImageFile(null);
                        setBookFormData({ ...bookFormData, coverImage: undefined });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    accept="image/*"
                    onUpload={handleCoverImageUpload}
                    maxSize={5}
                    multiple={false}
                    disabled={isUploadingCover}
                  />
                )}
                {isUploadingCover && <p className="text-sm text-gray-500 mt-2">Mengupload...</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Book PDF</label>
                {bookFormData.pdfFile ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      {bookFormData.pdfFileName} ({((bookFormData.pdfFileSize || 0) / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        setBookFormData({
                          ...bookFormData,
                          pdfFile: undefined,
                          pdfFileName: undefined,
                          pdfFileSize: undefined,
                          isOnline: false,
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                    {bookFormData.isPublic && (
                      <a
                        href={bookFormData.pdfFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Buka
                      </a>
                    )}
                  </div>
                ) : (
                  <FileUpload
                    accept=".pdf"
                    onUpload={handlePdfUpload}
                    maxSize={50}
                    multiple={false}
                    disabled={isUploadingPdf}
                  />
                )}
                {isUploadingPdf && <p className="text-sm text-gray-500 mt-2">Mengupload...</p>}
              </div>

              <div className="col-span-2 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bookFormData.isOnline}
                    onChange={(e) => setBookFormData({ ...bookFormData, isOnline: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Buku Online/Digital</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bookFormData.isPublic}
                    onChange={(e) => setBookFormData({ ...bookFormData, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publik</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bookFormData.allowDownload}
                    onChange={(e) => setBookFormData({ ...bookFormData, allowDownload: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Izinkan Download</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsBookModalOpen(false);
                  resetBookForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createBookMutation.isPending || updateBookMutation.isPending}
              >
                {selectedBook ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Loan Modal */}
        <Modal
          isOpen={isLoanModalOpen}
          onClose={() => {
            setIsLoanModalOpen(false);
            resetLoanForm();
          }}
          title="Peminjaman Baru"
          size="lg"
        >
          <form onSubmit={handleSubmitLoan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buku <span className="text-red-500">*</span>
              </label>
              <select
                value={loanFormData.bookId}
                onChange={(e) => setLoanFormData({ ...loanFormData, bookId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Pilih Buku</option>
                {booksData?.data
                  .filter(book => book.availableCopies > 0 && book.status === BookStatus.AVAILABLE)
                  .map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - Tersedia: {book.availableCopies}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peminjam <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  value={loanFormData.studentId || ''}
                  onChange={(e) => setLoanFormData({
                    ...loanFormData,
                    studentId: e.target.value ? parseInt(e.target.value) : undefined,
                    teacherId: undefined,
                    staffId: undefined,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Siswa</option>
                  {studentsData?.data.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
                <select
                  value={loanFormData.teacherId || ''}
                  onChange={(e) => setLoanFormData({
                    ...loanFormData,
                    teacherId: e.target.value ? parseInt(e.target.value) : undefined,
                    studentId: undefined,
                    staffId: undefined,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Guru</option>
                  {teachersData?.data.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                <input
                  type="date"
                  value={loanFormData.loanDate}
                  onChange={(e) => setLoanFormData({ ...loanFormData, loanDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={loanFormData.dueDate}
                  onChange={(e) => setLoanFormData({ ...loanFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea
                value={loanFormData.loanNotes}
                onChange={(e) => setLoanFormData({ ...loanFormData, loanNotes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsLoanModalOpen(false);
                  resetLoanForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={createLoanMutation.isPending}
              >
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Return Modal */}
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            resetReturnForm();
            setSelectedLoan(null);
          }}
          title="Pengembalian Buku"
          size="md"
        >
          {selectedLoan && (
            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Buku</p>
                <p className="font-medium">{selectedLoan.book?.title || `Buku #${selectedLoan.bookId}`}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Peminjam</p>
                <p className="font-medium">
                  {selectedLoan.student?.name || selectedLoan.teacher?.name || `Staff #${selectedLoan.staffId}`}
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Jatuh Tempo</p>
                <p className="font-medium">{formatDate(selectedLoan.dueDate)}</p>
                {new Date(selectedLoan.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 mt-2">
                    Terlambat: {Math.floor((new Date().getTime() - new Date(selectedLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24))} hari
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Pengembalian</label>
                <textarea
                  value={returnFormData.returnNotes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, returnNotes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {new Date(selectedLoan.dueDate) < new Date() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Denda (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={returnFormData.fineAmount || 0}
                    onChange={(e) => setReturnFormData({ ...returnFormData, fineAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsReturnModalOpen(false);
                    resetReturnForm();
                    setSelectedLoan(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={returnLoanMutation.isPending}
                >
                  Kembalikan
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Detail Book Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailBook(null);
          }}
          title="Detail Buku"
          size="lg"
        >
          {detailBook && (
            <div className="space-y-4">
              {detailBook.coverImage && (
                <div className="flex justify-center">
                  <img
                    src={detailBook.coverImage}
                    alt={detailBook.title}
                    className="w-48 h-72 object-cover rounded-lg shadow"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Judul</label>
                  <p className="text-lg font-semibold">{detailBook.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ISBN</label>
                  <p>{detailBook.isbn || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pengarang</label>
                  <p>{detailBook.author}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Penerbit</label>
                  <p>{detailBook.publisher}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tahun Terbit</label>
                  <p>{detailBook.publicationYear || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategori</label>
                  <p>{detailBook.category || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subkategori</label>
                  <p>{detailBook.subcategory || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bahasa</label>
                  <p>{detailBook.language || 'id'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Jumlah Halaman</label>
                  <p>{detailBook.pages || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Eksemplar</label>
                  <p>{detailBook.totalCopies}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tersedia</label>
                  <p className={detailBook.availableCopies === 0 ? 'text-red-600 font-semibold' : ''}>
                    {detailBook.availableCopies}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p>{getStatusBadge(detailBook.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kondisi</label>
                  <p>{detailBook.condition ? getStatusBadge(detailBook.condition as any) : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lokasi</label>
                  <p>{detailBook.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Rak</label>
                  <p>{detailBook.shelfNumber || '-'}</p>
                </div>
                {detailBook.price && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Harga</label>
                    <p>Rp {detailBook.price.toLocaleString('id-ID')}</p>
                  </div>
                )}
                {detailBook.purchaseDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Pembelian</label>
                    <p>{formatDate(detailBook.purchaseDate)}</p>
                  </div>
                )}
                {detailBook.donor && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Donatur</label>
                    <p>{detailBook.donor}</p>
                  </div>
                )}
              </div>

              {detailBook.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                  <p className="text-gray-700">{detailBook.description}</p>
                </div>
              )}

              {detailBook.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Catatan</label>
                  <p className="text-gray-700">{detailBook.notes}</p>
                </div>
              )}

              {detailBook.isOnline && detailBook.pdfFile && (
                <div>
                  <label className="text-sm font-medium text-gray-500">E-Book</label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={detailBook.pdfFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {detailBook.pdfFileName || 'Buka PDF'}
                    </a>
                    {detailBook.pdfFileSize && (
                      <span className="text-sm text-gray-500">
                        ({(detailBook.pdfFileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setDetailBook(null);
                  }}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEditBook(detailBook);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}
