import apiClient from './client';

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  author?: string;
  publisher?: string;
  year?: number;
  category?: string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BookCreateData {
  title: string;
  isbn?: string;
  author?: string;
  publisher?: string;
  year?: number;
  category?: string;
  totalCopies?: number;
  description?: string;
  isActive?: boolean;
}

export interface Borrowing {
  id: number;
  bookId: number;
  book?: Book;
  studentId?: number;
  student?: {
    id: number;
    name: string;
  };
  borrowDate: string;
  returnDate?: string;
  dueDate: string;
  status: 'borrowed' | 'returned' | 'overdue';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BorrowingCreateData {
  bookId: number;
  studentId: number;
  borrowDate: string;
  dueDate: string;
  notes?: string;
}

export const libraryApi = {
  // Books
  getAllBooks: async (
    tenantId: number,
    params?: { search?: string; category?: string }
  ): Promise<{ data: Book[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/library/books`, { params });
    return response.data;
  },

  getBookById: async (tenantId: number, id: number): Promise<Book> => {
    const response = await apiClient.get(`/tenants/${tenantId}/library/books/${id}`);
    return response.data;
  },

  createBook: async (tenantId: number, data: BookCreateData): Promise<Book> => {
    const response = await apiClient.post(`/tenants/${tenantId}/library/books`, data);
    return response.data;
  },

  updateBook: async (tenantId: number, id: number, data: Partial<BookCreateData>): Promise<Book> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/library/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/library/books/${id}`);
  },

  // Borrowings
  getAllBorrowings: async (
    tenantId: number,
    params?: { studentId?: number; status?: string }
  ): Promise<{ data: Borrowing[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/library/borrowings`, { params });
    return response.data;
  },

  createBorrowing: async (tenantId: number, data: BorrowingCreateData): Promise<Borrowing> => {
    const response = await apiClient.post(`/tenants/${tenantId}/library/borrowings`, data);
    return response.data;
  },

  returnBook: async (tenantId: number, id: number): Promise<Borrowing> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/library/borrowings/${id}/return`);
    return response.data;
  },
};

