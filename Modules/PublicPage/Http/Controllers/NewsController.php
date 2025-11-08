<?php

namespace Modules\PublicPage\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\News;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get published news with pagination
        $query = News::where('instansi_id', tenant('id'))
                    ->published()
                    ->orderBy('published_at', 'desc');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        // Featured filter
        if ($request->has('featured') && $request->featured) {
            $query->where('is_featured', true);
        }

        $news = $query->paginate(12);
        
        return view('publicpage::public.news.index', compact('news'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('publicpage::admin.news.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'author' => 'required|string|max:255',
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        $data = $request->all();
        $data['instansi_id'] = tenant('id');
        $data['slug'] = Str::slug($request->title);
        $data['is_featured'] = $request->has('is_featured');

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('news/images', 'public');
        }

        // Set published_at if status is published and no date provided
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        News::create($data);

        return redirect()->route('tenant.admin.news.index')
                        ->with('success', 'Berita berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        $news = News::where('instansi_id', tenant('id'))
                   ->where('slug', $slug)
                   ->published()
                   ->firstOrFail();

        // Increment view count
        $news->incrementViewCount();

        // Get related news
        $relatedNews = News::where('instansi_id', tenant('id'))
                          ->published()
                          ->where('id', '!=', $news->id)
                          ->orderBy('published_at', 'desc')
                          ->limit(4)
                          ->get();

        return view('publicpage::public.news.show', compact('news', 'relatedNews'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);
        return view('publicpage::admin.news.edit', compact('news'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'author' => 'required|string|max:255',
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->title);
        $data['is_featured'] = $request->has('is_featured');

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image
            if ($news->featured_image) {
                Storage::disk('public')->delete($news->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('news/images', 'public');
        }

        // Set published_at if status is published and no date provided
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $news->update($data);

        return redirect()->route('tenant.admin.news.index')
                        ->with('success', 'Berita berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);

        // Delete featured image
        if ($news->featured_image) {
            Storage::disk('public')->delete($news->featured_image);
        }

        $news->delete();

        return redirect()->route('tenant.admin.news.index')
                        ->with('success', 'Berita berhasil dihapus.');
    }

    /**
     * Display admin listing of news
     */
    public function adminIndex(Request $request)
    {
        $query = News::where('instansi_id', tenant('id'));

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%')
                  ->orWhere('author', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Featured filter
        if ($request->has('featured') && $request->featured !== '') {
            $query->where('is_featured', $request->featured == '1');
        }

        // Author filter
        if ($request->has('author') && $request->author) {
            $query->where('author', 'like', '%' . $request->author . '%');
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('published_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('published_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['created_at', 'published_at', 'title', 'view_count', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 15);
        $news = $query->paginate($perPage)->appends($request->query());

        // Get statistics
        $stats = [
            'total' => News::where('instansi_id', tenant('id'))->count(),
            'published' => News::where('instansi_id', tenant('id'))->where('status', 'published')->count(),
            'draft' => News::where('instansi_id', tenant('id'))->where('status', 'draft')->count(),
            'featured' => News::where('instansi_id', tenant('id'))->where('is_featured', true)->count(),
            'total_views' => News::where('instansi_id', tenant('id'))->sum('view_count'),
        ];

        // Get unique authors for filter
        $authors = News::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('author')
            ->filter()
            ->sort()
            ->values();

        return view('publicpage::admin.news.index', compact('news', 'stats', 'authors'));
    }

    /**
     * Bulk actions on news
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,publish,unpublish,toggle_featured',
            'ids' => 'required|array',
            'ids.*' => 'exists:news,id'
        ]);

        $news = News::where('instansi_id', tenant('id'))
            ->whereIn('id', $request->ids)
            ->get();

        $action = $request->action;
        $count = 0;

        switch ($action) {
            case 'delete':
                foreach ($news as $item) {
                    if ($item->featured_image) {
                        Storage::disk('public')->delete($item->featured_image);
                    }
                    $item->delete();
                    $count++;
                }
                $message = "{$count} berita berhasil dihapus.";
                break;

            case 'publish':
                foreach ($news as $item) {
                    $item->update([
                        'status' => 'published',
                        'published_at' => $item->published_at ?? now()
                    ]);
                    $count++;
                }
                $message = "{$count} berita berhasil dipublish.";
                break;

            case 'unpublish':
                foreach ($news as $item) {
                    $item->update(['status' => 'draft']);
                    $count++;
                }
                $message = "{$count} berita berhasil diubah ke draft.";
                break;

            case 'toggle_featured':
                foreach ($news as $item) {
                    $item->update(['is_featured' => !$item->is_featured]);
                    $count++;
                }
                $message = "Status unggulan {$count} berita berhasil diubah.";
                break;
        }

        return redirect()->route('tenant.admin.news.index')
            ->with('success', $message);
    }

    /**
     * Quick toggle status
     */
    public function toggleStatus($id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $newStatus = $news->status === 'published' ? 'draft' : 'published';
        $publishedAt = $news->published_at;
        
        if ($newStatus === 'published' && !$publishedAt) {
            $publishedAt = now();
        }
        
        $news->update([
            'status' => $newStatus,
            'published_at' => $publishedAt
        ]);

        return response()->json([
            'success' => true,
            'status' => $newStatus,
            'message' => 'Status berita berhasil diubah.'
        ]);
    }

    /**
     * Quick toggle featured
     */
    public function toggleFeatured($id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $news->update(['is_featured' => !$news->is_featured]);

        return response()->json([
            'success' => true,
            'is_featured' => $news->is_featured,
            'message' => 'Status unggulan berhasil diubah.'
        ]);
    }

    /**
     * Duplicate/Clone news
     */
    public function duplicate($id)
    {
        $news = News::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $newNews = $news->replicate();
        $newNews->title = $news->title . ' (Copy)';
        $newNews->slug = Str::slug($newNews->title) . '-' . time();
        $newNews->status = 'draft';
        $newNews->published_at = null;
        $newNews->view_count = 0;
        $newNews->is_featured = false;
        $newNews->save();

        return redirect()->route('tenant.admin.news.edit', $newNews->id)
            ->with('success', 'Berita berhasil diduplikasi. Silakan edit sesuai kebutuhan.');
    }

    /**
     * Export news to CSV
     */
    public function export(Request $request)
    {
        $query = News::where('instansi_id', tenant('id'));

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $news = $query->get();

        $filename = 'news-export-' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($news) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Header
            fputcsv($file, ['ID', 'Judul', 'Penulis', 'Status', 'Tanggal Publikasi', 'Views', 'Unggulan', 'Dibuat']);

            // Data
            foreach ($news as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->title,
                    $item->author,
                    $item->status,
                    $item->published_at ? $item->published_at->format('d-m-Y H:i') : '-',
                    $item->view_count,
                    $item->is_featured ? 'Ya' : 'Tidak',
                    $item->created_at->format('d-m-Y H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $tenantId = tenant('id');
        
        $stats = [
            'total' => News::where('instansi_id', $tenantId)->count(),
            'published' => News::where('instansi_id', $tenantId)->where('status', 'published')->count(),
            'draft' => News::where('instansi_id', $tenantId)->where('status', 'draft')->count(),
            'featured' => News::where('instansi_id', $tenantId)->where('is_featured', true)->count(),
            'total_views' => News::where('instansi_id', $tenantId)->sum('view_count'),
            'this_month' => News::where('instansi_id', $tenantId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'this_week' => News::where('instansi_id', $tenantId)
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ];

        return response()->json($stats);
    }
}
