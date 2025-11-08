<?php

namespace App\Http\Controllers\PublicPage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Gallery;
use Modules\PublicPage\Models\TenantProfile;
use Modules\PublicPage\Models\Menu;

class GalleryController extends Controller
{
    /**
     * Display a listing of gallery items
     */
    public function index(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }
        
        $profile = TenantProfile::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        if (!$profile) {
            abort(404, 'Profil tenant tidak ditemukan');
        }

        $menus = Menu::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $query = Gallery::where('instansi_id', $tenant->id)
            ->where('is_active', true);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('file_type', $request->type);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $galleries = $query->orderBy('order')->paginate(12);

        // Get categories for filter
        $categories = Gallery::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return view('publicpage::public.gallery.index', compact('profile', 'menus', 'galleries', 'categories'));
    }

    /**
     * Display the specified gallery item
     */
    public function show($id)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }
        
        $profile = TenantProfile::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        if (!$profile) {
            abort(404, 'Profil tenant tidak ditemukan');
        }

        $menus = Menu::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $gallery = Gallery::where('instansi_id', $tenant->id)
            ->where('id', $id)
            ->where('is_active', true)
            ->first();

        if (!$gallery) {
            abort(404, 'Item galeri tidak ditemukan');
        }

        // Get related gallery items
        $relatedGalleries = Gallery::where('instansi_id', $tenant->id)
            ->where('id', '!=', $gallery->id)
            ->where('file_type', $gallery->file_type)
            ->where('is_active', true)
            ->orderBy('order')
            ->limit(6)
            ->get();

        return view('publicpage::public.gallery.show', compact('profile', 'menus', 'gallery', 'relatedGalleries'));
    }
}
