import apiClient from './client';

export enum BookStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

export enum BookCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear?: number;
  category?: string;
  subcategory?: string;
  language?: string;
  pages?: number;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  shelfNumber?: string;
  price?: number;
  status: BookStatus;
  condition?: BookCondition;
  purchaseDate?: string;
  purchasePrice?: number;
  donor?: string;
  notes?: string;
  isOnline: boolean;
  pdfFile?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  isPublic: boolean;
  allowDownload: boolean;
  viewCount: number;
  downloadCount: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookCreateData {
  isbn?: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear?: number;
  category?: string;
  subcategory?: string;
  language?: string;
  pages?: number;
  description?: string;
  coverImage?: string;
  totalCopies?: number;
  location?: string;
  shelfNumber?: string;
  price?: number;
  status?: BookStatus;
  condition?: BookCondition;
  purchaseDate?: string;
  purchasePrice?: number;
  donor?: string;
  notes?: string;
  isOnline?: boolean;
  pdfFile?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  isPublic?: boolean;
  allowDownload?: boolean;
}

export interface BookLoan {
  id: number;
  bookId: number;
  book?: Book;
  studentId?: number;
  student?: {
    id: number;
    name: string;
  };
  teacherId?: number;
  teacher?: {
    id: number;
    name: string;
  };
  staffId?: number;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  loanNotes?: string;
  returnNotes?: string;
  fineAmount?: number;
  finePaid?: boolean;
  finePaidDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookLoanCreateData {
  bookId: number;
  studentId?: number;
  teacherId?: number;
  staffId?: number;
  loanDate?: string;
  dueDate: string;
  loanNotes?: string;
}

export interface BookLoanReturnData {
  returnNotes?: string;
  fineAmount?: number;
}

export interface LibraryStatistics {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  activeLoans: number;
  overdueLoans: number;
}

export const libraryApi = {
  // Books
  getAllBooks: async (
    params?: {
      search?: string;
      category?: string;
      status?: BookStatus;
      author?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/library/books', { params });
    return response.data;
  },

  getBookById: async (id: number): Promise<Book> => {
    const response = await apiClient.get(`/library/books/${id}`);
    return response.data;
  },

  createBook: async (data: BookCreateData): Promise<Book> => {
    const response = await apiClient.post('/library/books', data);
    return response.data;
  },

  updateBook: async (id: number, data: Partial<BookCreateData>): Promise<Book> => {
    const response = await apiClient.patch(`/library/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id: number): Promise<void> => {
    await apiClient.delete(`/library/books/${id}`);
  },

  // Loans
  getAllLoans: async (
    params?: {
      bookId?: number;
      studentId?: number;
      teacherId?: number;
      status?: LoanStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: BookLoan[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get('/library/loans', { params });
    return response.data;
  },

  getLoanById: async (id: number): Promise<BookLoan> => {
    const response = await apiClient.get(`/library/loans/${id}`);
    return response.data;
  },

  createLoan: async (data: BookLoanCreateData, createdBy?: number): Promise<BookLoan> => {
    const response = await apiClient.post('/library/loans', data, {
      params: createdBy ? { createdBy } : undefined,
    });
    return response.data;
  },

  returnLoan: async (id: number, data: BookLoanReturnData, returnedBy?: number): Promise<BookLoan> => {
    const response = await apiClient.post(`/library/loans/${id}/return`, data, {
      params: returnedBy ? { returnedBy } : undefined,
    });
    return response.data;
  },

  getOverdueLoans: async (): Promise<BookLoan[]> => {
    const response = await apiClient.get('/library/loans/overdue');
    return response.data;
  },

  // Statistics
  getStatistics: async (): Promise<LibraryStatistics> => {
    const response = await apiClient.get('/library/statistics');
    return response.data;
  },
};

