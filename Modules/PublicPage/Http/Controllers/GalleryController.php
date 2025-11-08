<?php

namespace Modules\PublicPage\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Gallery;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class GalleryController extends Controller
{
    /**
     * Display admin listing of galleries
     */
    public function adminIndex(Request $request)
    {
        $query = Gallery::where('instansi_id', tenant('id'));

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('caption', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->where(function($q) {
                    $q->where('is_active', true)->orWhere('status', 'active');
                });
            } else {
                $query->where('status', $request->status)
                      ->where('is_active', false);
            }
        }

        // Featured filter
        if ($request->has('featured') && $request->featured !== '') {
            $query->where('is_featured', $request->featured == '1');
        }

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // File type filter
        if ($request->has('file_type') && $request->file_type) {
            $query->where('file_type', $request->file_type);
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['created_at', 'title', 'sort_order', 'file_size', 'category'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 15);
        $galleries = $query->paginate($perPage)->appends($request->query());

        // Get statistics
        $stats = [
            'total' => Gallery::where('instansi_id', tenant('id'))->count(),
            'active' => Gallery::where('instansi_id', tenant('id'))
                ->where(function($q) {
                    $q->where('is_active', true)->orWhere('status', 'active');
                })->count(),
            'featured' => Gallery::where('instansi_id', tenant('id'))->where('is_featured', true)->count(),
            'total_size' => Gallery::where('instansi_id', tenant('id'))->sum('file_size'),
            'this_month' => Gallery::where('instansi_id', tenant('id'))
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        // Get unique categories for filter
        $categories = Gallery::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        // Get unique file types
        $fileTypes = Gallery::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('file_type')
            ->filter()
            ->sort()
            ->values();

        return view('publicpage::admin.gallery.index', compact('galleries', 'stats', 'categories', 'fileTypes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Gallery::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return view('publicpage::admin.gallery.create', compact('categories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'status' => 'nullable|string|in:active,inactive',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data = $request->all();
        $data['instansi_id'] = tenant('id');
        $data['is_featured'] = $request->has('is_featured');
        $data['is_active'] = $request->has('is_active') || $request->status === 'active';

        // Handle tags
        if ($request->has('tags') && $request->tags) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $data['tags'] = array_map('trim', $tags);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $data['file_path'] = $image->store('gallery/images', 'public');
            $data['file_type'] = 'image';
            $data['file_size'] = $image->getSize();
            $data['image'] = $data['file_path'];
        }

        // Set sort_order if not provided
        if (empty($data['sort_order'])) {
            $maxOrder = Gallery::where('instansi_id', tenant('id'))->max('sort_order') ?? 0;
            $data['sort_order'] = $maxOrder + 1;
        }

        Gallery::create($data);

        return redirect()->route('tenant.admin.gallery.index')
            ->with('success', 'Galeri berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $categories = Gallery::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return view('publicpage::admin.gallery.edit', compact('gallery', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'status' => 'nullable|string|in:active,inactive',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data = $request->all();
        $data['is_featured'] = $request->has('is_featured');
        $data['is_active'] = $request->has('is_active') || $request->status === 'active';

        // Handle tags
        if ($request->has('tags') && $request->tags) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $data['tags'] = array_map('trim', $tags);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($gallery->file_path && !filter_var($gallery->file_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($gallery->file_path);
                if ($gallery->image && $gallery->image !== $gallery->file_path) {
                    Storage::disk('public')->delete($gallery->image);
                }
            }

            $image = $request->file('image');
            $data['file_path'] = $image->store('gallery/images', 'public');
            $data['file_type'] = 'image';
            $data['file_size'] = $image->getSize();
            $data['image'] = $data['file_path'];
        }

        $gallery->update($data);

        return redirect()->route('tenant.admin.gallery.index')
            ->with('success', 'Galeri berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);

        // Delete image
        if ($gallery->file_path && !filter_var($gallery->file_path, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($gallery->file_path);
            if ($gallery->image && $gallery->image !== $gallery->file_path) {
                Storage::disk('public')->delete($gallery->image);
            }
        }

        $gallery->delete();

        return redirect()->route('tenant.admin.gallery.index')
            ->with('success', 'Galeri berhasil dihapus.');
    }

    /**
     * Bulk actions on galleries
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate,toggle_featured',
            'ids' => 'required|array',
            'ids.*' => 'exists:galleries,id'
        ]);

        $galleries = Gallery::where('instansi_id', tenant('id'))
            ->whereIn('id', $request->ids)
            ->get();

        $action = $request->action;
        $count = 0;

        switch ($action) {
            case 'delete':
                foreach ($galleries as $item) {
                    if ($item->file_path && !filter_var($item->file_path, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($item->file_path);
                        if ($item->image && $item->image !== $item->file_path) {
                            Storage::disk('public')->delete($item->image);
                        }
                    }
                    $item->delete();
                    $count++;
                }
                $message = "{$count} galeri berhasil dihapus.";
                break;

            case 'activate':
                foreach ($galleries as $item) {
                    $item->update(['is_active' => true, 'status' => 'active']);
                    $count++;
                }
                $message = "{$count} galeri berhasil diaktifkan.";
                break;

            case 'deactivate':
                foreach ($galleries as $item) {
                    $item->update(['is_active' => false, 'status' => 'inactive']);
                    $count++;
                }
                $message = "{$count} galeri berhasil dinonaktifkan.";
                break;

            case 'toggle_featured':
                foreach ($galleries as $item) {
                    $item->update(['is_featured' => !$item->is_featured]);
                    $count++;
                }
                $message = "Status unggulan {$count} galeri berhasil diubah.";
                break;
        }

        return redirect()->route('tenant.admin.gallery.index')
            ->with('success', $message);
    }

    /**
     * Quick toggle status
     */
    public function toggleStatus($id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $newStatus = $gallery->is_active ? false : true;
        
        $gallery->update([
            'is_active' => $newStatus,
            'status' => $newStatus ? 'active' : 'inactive'
        ]);

        return response()->json([
            'success' => true,
            'is_active' => $newStatus,
            'message' => 'Status galeri berhasil diubah.'
        ]);
    }

    /**
     * Quick toggle featured
     */
    public function toggleFeatured($id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $gallery->update(['is_featured' => !$gallery->is_featured]);

        return response()->json([
            'success' => true,
            'is_featured' => $gallery->is_featured,
            'message' => 'Status unggulan berhasil diubah.'
        ]);
    }

    /**
     * Duplicate/Clone gallery
     */
    public function duplicate($id)
    {
        $gallery = Gallery::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $newGallery = $gallery->replicate();
        $newGallery->title = $gallery->title . ' (Copy)';
        $newGallery->is_active = false;
        $newGallery->is_featured = false;
        $newGallery->sort_order = (Gallery::where('instansi_id', tenant('id'))->max('sort_order') ?? 0) + 1;
        $newGallery->save();

        return redirect()->route('tenant.admin.gallery.edit', $newGallery->id)
            ->with('success', 'Galeri berhasil diduplikasi. Silakan edit sesuai kebutuhan.');
    }

    /**
     * Export galleries to CSV
     */
    public function export(Request $request)
    {
        $query = Gallery::where('instansi_id', tenant('id'));

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->where(function($q) {
                    $q->where('is_active', true)->orWhere('status', 'active');
                });
            } else {
                $query->where('status', $request->status);
            }
        }

        $galleries = $query->get();

        $filename = 'gallery-export-' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($galleries) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Header
            fputcsv($file, ['ID', 'Judul', 'Kategori', 'Status', 'Unggulan', 'Ukuran File', 'Tipe', 'Dibuat']);

            // Data
            foreach ($galleries as $item) {
                $fileSize = $item->file_size ? number_format($item->file_size / 1024, 2) . ' KB' : '-';
                fputcsv($file, [
                    $item->id,
                    $item->title,
                    $item->category ?? '-',
                    $item->is_active ? 'Aktif' : 'Tidak Aktif',
                    $item->is_featured ? 'Ya' : 'Tidak',
                    $fileSize,
                    $item->file_type ?? '-',
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
            'total' => Gallery::where('instansi_id', $tenantId)->count(),
            'active' => Gallery::where('instansi_id', $tenantId)
                ->where(function($q) {
                    $q->where('is_active', true)->orWhere('status', 'active');
                })->count(),
            'featured' => Gallery::where('instansi_id', $tenantId)->where('is_featured', true)->count(),
            'total_size' => Gallery::where('instansi_id', $tenantId)->sum('file_size'),
            'this_month' => Gallery::where('instansi_id', $tenantId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'this_week' => Gallery::where('instansi_id', $tenantId)
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ];

        return response()->json($stats);
    }
}

