<?php

namespace App\Http\Controllers\PublicPage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\TenantProfile;
use Modules\PublicPage\Models\Menu;
use Modules\PublicPage\Models\News;
use Modules\PublicPage\Models\Gallery;

class HomeController extends Controller
{
    /**
     * Display the home page
     */
    public function index()
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

        // Get latest news (excluding featured ones)
        $latestNews = News::where('instansi_id', $tenant->id)
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->where(function($query) {
                $query->where('is_featured', false)
                      ->orWhereNull('is_featured');
            })
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        // Ensure all news have slug
        foreach ($latestNews as $news) {
            if (empty($news->slug)) {
                $news->slug = \Illuminate\Support\Str::slug($news->title);
                $news->save();
            }
        }

        // Get featured news
        $featuredNews = News::where('instansi_id', $tenant->id)
            ->where('status', 'published')
            ->where('is_featured', true)
            ->where('published_at', '<=', now())
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        // Ensure all featured news have slug
        foreach ($featuredNews as $news) {
            if (empty($news->slug)) {
                $news->slug = \Illuminate\Support\Str::slug($news->title);
                $news->save();
            }
        }

        // Get news count for statistics
        $newsCount = News::where('instansi_id', $tenant->id)
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->count();

        // Get student count if available
        $studentCount = 0;
        if (class_exists(\App\Models\Tenant\Student::class)) {
            $studentCount = \App\Models\Tenant\Student::where('instansi_id', $tenant->id)->count();
        }

        // Get teacher count if available
        $teacherCount = 0;
        if (class_exists(\App\Models\Tenant\Teacher::class)) {
            $teacherCount = \App\Models\Tenant\Teacher::where('instansi_id', $tenant->id)->count();
        }

        // Get years of experience (calculate from tenant creation or use a default)
        $yearCount = $tenant->created_at ? now()->diffInYears($tenant->created_at) : 0;
        if ($yearCount == 0) {
            $yearCount = date('Y') - 2020; // Default fallback
        }

        $galleries = Gallery::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->where('file_type', 'image')
            ->orderBy('order')
            ->limit(6)
            ->get();

        return view('publicpage::public.home', compact(
            'profile', 
            'menus', 
            'latestNews', 
            'featuredNews', 
            'newsCount',
            'studentCount',
            'teacherCount',
            'yearCount',
            'galleries', 
            'tenant'
        ));
    }

    /**
     * Display the about page
     */
    public function about()
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

        return view('publicpage::public.about', compact('profile', 'menus', 'tenant'));
    }

    /**
     * Display the contact page
     */
    public function contact()
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

        return view('publicpage::public.contact', compact('profile', 'menus', 'tenant'));
    }
}
