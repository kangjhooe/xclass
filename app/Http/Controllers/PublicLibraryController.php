<?php

namespace App\Http\Controllers;

use App\Models\Tenant\Book;
use App\Models\Tenant\BookReading;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicLibraryController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get current tenant ID
     */
    protected function getInstansiId()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        if ($tenant) {
            return $tenant->id;
        }
        return null;
    }

    /**
     * Display public library index
     */
    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            abort(404, 'Tenant tidak ditemukan');
        }

        $query = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('publisher', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Sort
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'popular':
                $query->orderBy('view_count', 'desc');
                break;
            case 'title':
                $query->orderBy('title', 'asc');
                break;
            case 'author':
                $query->orderBy('author', 'asc');
                break;
            default:
                $query->orderBy('published_at', 'desc')->orderBy('created_at', 'desc');
        }

        $books = $query->paginate(12);

        // Get unique categories for filter
        $categories = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        // Get popular books
        $popularBooks = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true)
            ->orderBy('view_count', 'desc')
            ->limit(6)
            ->get();

        // Get recent books
        $recentBooks = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true)
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        return view('public.library.index', [
            'title' => 'Perpustakaan Online',
            'books' => $books,
            'categories' => $categories,
            'popularBooks' => $popularBooks,
            'recentBooks' => $recentBooks,
            'search' => $request->search,
            'filterCategory' => $request->category,
            'sort' => $sort,
        ]);
    }

    /**
     * Show book detail and viewer
     */
    public function show($id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            abort(404, 'Tenant tidak ditemukan');
        }

        $book = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true)
            ->findOrFail($id);

        // Increment view count
        $book->incrementViewCount();

        // Get or create reading record if user is authenticated
        $reading = null;
        if (auth()->check()) {
            $reading = BookReading::firstOrCreate(
                [
                    'instansi_id' => $instansiId,
                    'book_id' => $book->id,
                    'user_id' => auth()->id(),
                ],
                [
                    'reader_type' => $this->getReaderType(),
                    'student_id' => auth()->user()->student_id ?? null,
                    'last_page' => 1,
                    'progress_percentage' => 0,
                ]
            );
        }

        // Get related books
        $relatedBooks = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('is_public', true)
            ->where('id', '!=', $book->id)
            ->where('category', $book->category)
            ->limit(4)
            ->get();

        return view('public.library.show', [
            'title' => $book->title,
            'book' => $book,
            'reading' => $reading,
            'relatedBooks' => $relatedBooks,
        ]);
    }

    /**
     * Read book (PDF viewer)
     */
    public function read($id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            abort(404, 'Tenant tidak ditemukan');
        }

        $book = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where(function($query) {
                // Allow if public OR if user is authenticated
                $query->where('is_public', true)
                      ->orWhere(function($q) {
                          if (auth()->check()) {
                              $q->where('is_public', false);
                          }
                      });
            })
            ->findOrFail($id);

        if (!$book->hasPdf()) {
            abort(404, 'PDF tidak ditemukan');
        }

        // Get or create reading record if user is authenticated
        $reading = null;
        if (auth()->check()) {
            $reading = BookReading::firstOrCreate(
                [
                    'instansi_id' => $instansiId,
                    'book_id' => $book->id,
                    'user_id' => auth()->id(),
                ],
                [
                    'reader_type' => $this->getReaderType(),
                    'student_id' => auth()->user()->student_id ?? null,
                    'last_page' => 1,
                    'progress_percentage' => 0,
                ]
            );
        }

        // Increment view count
        $book->incrementViewCount();

        return view('public.library.reader', [
            'title' => 'Baca: ' . $book->title,
            'book' => $book,
            'reading' => $reading,
        ]);
    }

    /**
     * Download PDF
     */
    public function download($id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            abort(404, 'Tenant tidak ditemukan');
        }

        $book = Book::where('instansi_id', $instansiId)
            ->where('is_online', true)
            ->where('allow_download', true)
            ->findOrFail($id);

        if (!$book->hasPdf()) {
            abort(404, 'PDF tidak ditemukan');
        }

        // Increment download count
        $book->incrementDownloadCount();

        $filePath = storage_path('app/public/' . $book->pdf_file);
        
        if (!file_exists($filePath)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->download($filePath, $book->pdf_file_name ?? 'book.pdf');
    }

    /**
     * Update reading progress (AJAX)
     */
    public function updateProgress(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'page' => 'required|integer|min:1',
            'total_pages' => 'required|integer|min:1',
            'reading_time' => 'nullable|integer|min:0',
        ]);

        $book = Book::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $reading = BookReading::firstOrCreate(
            [
                'instansi_id' => $instansiId,
                'book_id' => $book->id,
                'user_id' => auth()->id(),
            ],
            [
                'reader_type' => $this->getReaderType(),
                'student_id' => auth()->user()->student_id ?? null,
            ]
        );

        $reading->updateProgress($request->page, $request->total_pages);

        // Update reading time if provided
        if ($request->has('reading_time')) {
            $reading->increment('reading_time_seconds', $request->reading_time);
        }

        return response()->json([
            'success' => true,
            'progress' => $reading->progress_percentage,
            'last_page' => $reading->last_page,
        ]);
    }

    /**
     * Add bookmark (AJAX)
     */
    public function addBookmark(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'page' => 'required|integer|min:1',
            'note' => 'nullable|string|max:500',
        ]);

        $book = Book::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $reading = BookReading::firstOrCreate(
            [
                'instansi_id' => $instansiId,
                'book_id' => $book->id,
                'user_id' => auth()->id(),
            ],
            [
                'reader_type' => $this->getReaderType(),
                'student_id' => auth()->user()->student_id ?? null,
            ]
        );

        $reading->addBookmark($request->page, $request->note);

        return response()->json([
            'success' => true,
            'bookmarks' => $reading->bookmarks,
        ]);
    }

    /**
     * Remove bookmark (AJAX)
     */
    public function removeBookmark(Request $request, $id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'page' => 'required|integer|min:1',
        ]);

        $book = Book::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $reading = BookReading::where('instansi_id', $instansiId)
            ->where('book_id', $book->id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $reading->removeBookmark($request->page);

        return response()->json([
            'success' => true,
            'bookmarks' => $reading->bookmarks,
        ]);
    }

    /**
     * Toggle favorite (AJAX)
     */
    public function toggleFavorite($id)
    {
        $instansiId = $this->getInstansiId();
        
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $book = Book::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $reading = BookReading::firstOrCreate(
            [
                'instansi_id' => $instansiId,
                'book_id' => $book->id,
                'user_id' => auth()->id(),
            ],
            [
                'reader_type' => $this->getReaderType(),
                'student_id' => auth()->user()->student_id ?? null,
            ]
        );

        $isFavorite = $reading->toggleFavorite();

        return response()->json([
            'success' => true,
            'is_favorite' => $isFavorite,
        ]);
    }

    /**
     * Get reader type based on user role
     */
    protected function getReaderType()
    {
        if (!auth()->check()) {
            return 'guest';
        }

        $user = auth()->user();
        
        if ($user->hasRole('siswa')) {
            return 'student';
        } elseif ($user->hasRole('guru')) {
            return 'teacher';
        } elseif ($user->hasRole('staff')) {
            return 'staff';
        }

        return 'user';
    }
}
