<?php

namespace App\Http\Controllers\PublicPage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\News;
use Modules\PublicPage\Models\TenantProfile;
use Modules\PublicPage\Models\Menu;

class NewsController extends Controller
{
    /**
     * Display a listing of news
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

        $query = News::where('instansi_id', $tenant->id)
            ->where('status', 'published')
            ->where('published_at', '<=', now());

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $news = $query->orderBy('published_at', 'desc')->paginate(10);

        return view('publicpage::public.news.index', compact('profile', 'menus', 'news'));
    }

    /**
     * Display the specified news
     */
    public function show($slug)
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

        $news = News::where('instansi_id', $tenant->id)
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->first();

        if (!$news) {
            abort(404, 'Berita tidak ditemukan');
        }

        // Increment views count
        $news->increment('views_count');

        // Get related news
        $relatedNews = News::where('instansi_id', $tenant->id)
            ->where('id', '!=', $news->id)
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();

        return view('publicpage::public.news.show', compact('profile', 'menus', 'news', 'relatedNews'));
    }
}
