<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Book;
use App\Models\Tenant\BookLoan;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LibraryController extends Controller
{
    use HasInstansiId;

    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_books' => Book::where('instansi_id', $instansiId)->count(),
            'available_books' => Book::where('instansi_id', $instansiId)->where('status', 'available')->count(),
            'borrowed_books' => Book::where('instansi_id', $instansiId)->where('status', 'unavailable')->count(),
            'active_loans' => BookLoan::where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'overdue_loans' => BookLoan::where('instansi_id', $instansiId)
                ->where('status', 'active')
                ->where('due_date', '<', now()->toDateString())
                ->count(),
        ];

        $recentLoans = BookLoan::with(['book', 'student', 'teacher', 'staff'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.library.index', [
            'title' => 'Perpustakaan',
            'page-title' => 'Sistem Perpustakaan',
            'stats' => $stats,
            'recentLoans' => $recentLoans
        ]);
    }

    public function books(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Book::where('instansi_id', $instansiId);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('publisher', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $books = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get unique categories for filter
        $categories = Book::where('instansi_id', $instansiId)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return view('tenant.library.books', [
            'title' => 'Daftar Buku',
            'page-title' => 'Daftar Buku Perpustakaan',
            'books' => $books,
            'categories' => $categories,
            'search' => $request->search,
            'filterCategory' => $request->category,
            'filterStatus' => $request->status
        ]);
    }

    public function createBook()
    {
        $instansiId = $this->getInstansiId();
        return view('tenant.library.create-book', [
            'title' => 'Tambah Buku',
            'page-title' => 'Tambah Data Buku'
        ]);
    }

    public function storeBook(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20|unique:books,isbn',
            'publisher' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'total_copies' => 'required|integer|min:1',
            'available_copies' => 'required|integer|min:0',
            'pdf_file' => 'nullable|file|mimes:pdf|max:102400', // max 100MB
            'is_online' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
            'allow_download' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $bookData = [
                'title' => $request->title,
                'author' => $request->author,
                'isbn' => $request->isbn,
                'publisher' => $request->publisher,
                'publication_year' => $request->year,
                'category' => $request->category,
                'description' => $request->description,
                'total_copies' => $request->total_copies,
                'available_copies' => $request->available_copies,
                'status' => $request->available_copies > 0 ? 'available' : 'unavailable',
                'instansi_id' => $instansiId,
                'is_online' => $request->has('is_online') ? true : false,
                'is_public' => $request->has('is_public') ? true : false,
                'allow_download' => $request->has('allow_download') ? true : false,
                'published_at' => $request->published_at ? $request->published_at : ($request->has('is_online') && $request->is_public ? now() : null),
            ];

            // Handle PDF upload
            if ($request->hasFile('pdf_file')) {
                $pdfFile = $request->file('pdf_file');
                $pdfPath = $pdfFile->store('library/pdfs', 'public');
                
                $bookData['pdf_file'] = $pdfPath;
                $bookData['pdf_file_name'] = $pdfFile->getClientOriginalName();
                $bookData['pdf_file_size'] = $pdfFile->getSize();
                $bookData['is_online'] = true; // Auto set is_online jika ada PDF
            }

            Book::create($bookData);

            DB::commit();
            return redirect()->route('tenant.library.books')->with('success', 'Data buku berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function createLoan()
    {
        $instansiId = $this->getInstansiId();
        
        $books = Book::where('instansi_id', $instansiId)
            ->where('status', 'available')
            ->orderBy('title')
            ->get();

        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.library.create-loan', [
            'title' => 'Tambah Peminjaman',
            'page-title' => 'Tambah Data Peminjaman',
            'books' => $books,
            'students' => $students
        ]);
    }

    public function storeLoan(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_id' => 'required|exists:students,id',
            'loan_date' => 'required|date',
            'due_date' => 'required|date|after:loan_date',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $book = Book::where('instansi_id', $instansiId)
                ->findOrFail($request->book_id);

            if ($book->available_copies <= 0) {
                return redirect()->back()->with('error', 'Buku tidak tersedia untuk dipinjam')->withInput();
            }

            // Update available copies first
            $book->decrement('available_copies');
            
            BookLoan::create([
                'book_id' => $request->book_id,
                'student_id' => $request->student_id,
                'loan_date' => $request->loan_date,
                'due_date' => $request->due_date,
                'status' => 'active',
                'loan_notes' => $request->notes,
                'created_by' => auth()->id(),
                'instansi_id' => $instansiId
            ]);

            // Update book status if no copies available
            if ($book->available_copies <= 0) {
                $book->update(['status' => 'unavailable']);
            }

            DB::commit();
            return redirect()->route('tenant.library.loans')->with('success', 'Data peminjaman berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function showBook($id)
    {
        $instansiId = $this->getInstansiId();
        
        $book = Book::where('instansi_id', $instansiId)
            ->with(['loans' => function($query) {
                $query->latest()->limit(10);
            }])
            ->findOrFail($id);

        $activeLoans = $book->activeLoans()->with(['student', 'teacher', 'staff'])->get();
        $totalLoans = $book->loans()->count();

        return view('tenant.library.show-book', [
            'title' => 'Detail Buku',
            'page-title' => 'Detail Buku',
            'book' => $book,
            'activeLoans' => $activeLoans,
            'totalLoans' => $totalLoans
        ]);
    }

    public function editBook($id)
    {
        $instansiId = $this->getInstansiId();
        
        $book = Book::where('instansi_id', $instansiId)
            ->findOrFail($id);

        return view('tenant.library.edit-book', [
            'title' => 'Edit Buku',
            'page-title' => 'Edit Data Buku',
            'book' => $book
        ]);
    }

    public function updateBook(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        $book = Book::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20|unique:books,isbn,' . $book->id,
            'publisher' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'total_copies' => 'required|integer|min:1',
            'available_copies' => 'required|integer|min:0',
            'status' => 'required|in:available,unavailable,maintenance,lost,damaged',
            'condition' => 'nullable|in:excellent,good,fair,poor',
            'pdf_file' => 'nullable|file|mimes:pdf|max:102400', // max 100MB
            'is_online' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
            'allow_download' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            // Ensure available_copies doesn't exceed total_copies
            $availableCopies = min($request->available_copies, $request->total_copies);

            $updateData = [
                'title' => $request->title,
                'author' => $request->author,
                'isbn' => $request->isbn,
                'publisher' => $request->publisher,
                'publication_year' => $request->year,
                'category' => $request->category,
                'description' => $request->description,
                'total_copies' => $request->total_copies,
                'available_copies' => $availableCopies,
                'status' => $request->status,
                'condition' => $request->condition,
                'location' => $request->location,
                'shelf_number' => $request->shelf_number,
                'language' => $request->language ?? 'id',
                'pages' => $request->pages,
                'price' => $request->price,
                'purchase_date' => $request->purchase_date,
                'purchase_price' => $request->purchase_price,
                'donor' => $request->donor,
                'notes' => $request->notes,
                'is_online' => $request->has('is_online') ? true : false,
                'is_public' => $request->has('is_public') ? true : false,
                'allow_download' => $request->has('allow_download') ? true : false,
                'published_at' => $request->published_at ?? ($book->is_online && $book->is_public ? $book->published_at : null),
            ];

            // Handle PDF upload
            if ($request->hasFile('pdf_file')) {
                // Delete old PDF if exists
                if ($book->pdf_file && file_exists(storage_path('app/public/' . $book->pdf_file))) {
                    unlink(storage_path('app/public/' . $book->pdf_file));
                }

                $pdfFile = $request->file('pdf_file');
                $pdfPath = $pdfFile->store('library/pdfs', 'public');
                
                $updateData['pdf_file'] = $pdfPath;
                $updateData['pdf_file_name'] = $pdfFile->getClientOriginalName();
                $updateData['pdf_file_size'] = $pdfFile->getSize();
                $updateData['is_online'] = true; // Auto set is_online jika ada PDF
            }

            $book->update($updateData);

            DB::commit();
            return redirect()->route('tenant.library.books')->with('success', 'Data buku berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function destroyBook($id)
    {
        $instansiId = $this->getInstansiId();
        
        try {
            DB::beginTransaction();

            $book = Book::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Check if book has active loans
            $activeLoans = $book->activeLoans()->count();
            if ($activeLoans > 0) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus buku yang masih dalam peminjaman aktif');
            }

            $book->delete();

            DB::commit();
            return redirect()->route('tenant.library.books')->with('success', 'Buku berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function loans(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = BookLoan::with(['book', 'student', 'teacher', 'staff'])
            ->where('instansi_id', $instansiId);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('book', function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            })->orWhereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter overdue
        if ($request->has('overdue') && $request->overdue == '1') {
            $query->where('status', 'active')
                  ->where('due_date', '<', now()->toDateString());
        }

        $loans = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('tenant.library.loans', [
            'title' => 'Peminjaman',
            'page-title' => 'Data Peminjaman Buku',
            'loans' => $loans,
            'search' => $request->search,
            'filterStatus' => $request->status,
            'filterOverdue' => $request->overdue
        ]);
    }

    public function showLoan($id)
    {
        $instansiId = $this->getInstansiId();
        
        $loan = BookLoan::with(['book', 'student', 'teacher', 'staff', 'creator', 'returner'])
            ->where('instansi_id', $instansiId)
            ->findOrFail($id);

        return view('tenant.library.show-loan', [
            'title' => 'Detail Peminjaman',
            'page-title' => 'Detail Peminjaman Buku',
            'loan' => $loan
        ]);
    }

    public function editLoan($id)
    {
        $instansiId = $this->getInstansiId();
        
        $loan = BookLoan::with(['book', 'student'])
            ->where('instansi_id', $instansiId)
            ->findOrFail($id);

        $books = Book::where('instansi_id', $instansiId)
            ->orderBy('title')
            ->get();

        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.library.edit-loan', [
            'title' => 'Edit Peminjaman',
            'page-title' => 'Edit Data Peminjaman',
            'loan' => $loan,
            'books' => $books,
            'students' => $students
        ]);
    }

    public function updateLoan(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        $loan = BookLoan::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_id' => 'required|exists:students,id',
            'loan_date' => 'required|date',
            'due_date' => 'required|date|after:loan_date',
            'status' => 'required|in:active,returned,overdue,lost,damaged',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $loan->update([
                'book_id' => $request->book_id,
                'student_id' => $request->student_id,
                'loan_date' => $request->loan_date,
                'due_date' => $request->due_date,
                'status' => $request->status,
                'loan_notes' => $request->notes
            ]);

            // Update book status if needed
            if ($request->status === 'returned' && !$loan->return_date) {
                $loan->update(['return_date' => now()]);
                $loan->book->increment('available_copies');
                if ($loan->book->available_copies > 0) {
                    $loan->book->update(['status' => 'available']);
                }
            }

            DB::commit();
            return redirect()->route('tenant.library.loans')->with('success', 'Data peminjaman berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function returnBook($id)
    {
        $instansiId = $this->getInstansiId();
        
        try {
            DB::beginTransaction();

            $loan = BookLoan::where('instansi_id', $instansiId)
                ->findOrFail($id);

            if ($loan->status === 'returned') {
                return redirect()->back()->with('error', 'Buku sudah dikembalikan sebelumnya');
            }

            $loan->markAsReturned(auth()->id());

            DB::commit();
            return redirect()->route('tenant.library.loans')->with('success', 'Buku berhasil dikembalikan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function markAsLost(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        try {
            DB::beginTransaction();

            $loan = BookLoan::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $loan->markAsLost($request->notes);

            DB::commit();
            return redirect()->route('tenant.library.loans')->with('success', 'Peminjaman ditandai sebagai hilang');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function markAsDamaged(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        try {
            DB::beginTransaction();

            $loan = BookLoan::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $loan->markAsDamaged($request->notes);

            DB::commit();
            return redirect()->route('tenant.library.loans')->with('success', 'Peminjaman ditandai sebagai rusak');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function statistics()
    {
        $instansiId = $this->getInstansiId();

        // Overall statistics
        $stats = [
            'total_books' => Book::where('instansi_id', $instansiId)->count(),
            'available_books' => Book::where('instansi_id', $instansiId)->where('status', 'available')->count(),
            'borrowed_books' => Book::where('instansi_id', $instansiId)->where('status', 'unavailable')->count(),
            'total_loans' => BookLoan::where('instansi_id', $instansiId)->count(),
            'active_loans' => BookLoan::where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'overdue_loans' => BookLoan::where('instansi_id', $instansiId)
                ->where('status', 'active')
                ->where('due_date', '<', now()->toDateString())
                ->count(),
            'returned_loans' => BookLoan::where('instansi_id', $instansiId)->where('status', 'returned')->count(),
        ];

        // Books by category
        $booksByCategory = Book::where('instansi_id', $instansiId)
            ->select('category', DB::raw('count(*) as total'))
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        // Books by status
        $booksByStatus = Book::where('instansi_id', $instansiId)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // Loans by month (last 12 months)
        $loansByMonth = BookLoan::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Most borrowed books
        $mostBorrowedBooks = Book::where('instansi_id', $instansiId)
            ->withCount('loans')
            ->orderBy('loans_count', 'desc')
            ->limit(10)
            ->get();

        // Most active borrowers
        $mostActiveBorrowers = Student::where('instansi_id', $instansiId)
            ->withCount(['bookLoans' => function($query) {
                $query->where('instansi_id', $instansiId);
            }])
            ->having('book_loans_count', '>', 0)
            ->orderBy('book_loans_count', 'desc')
            ->limit(10)
            ->get();

        return view('tenant.library.statistics', [
            'title' => 'Statistik Perpustakaan',
            'page-title' => 'Statistik Perpustakaan',
            'stats' => $stats,
            'booksByCategory' => $booksByCategory,
            'booksByStatus' => $booksByStatus,
            'loansByMonth' => $loansByMonth,
            'mostBorrowedBooks' => $mostBorrowedBooks,
            'mostActiveBorrowers' => $mostActiveBorrowers
        ]);
    }
}