<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicPage\Admin\MenuController;
use App\Http\Controllers\PublicPage\Admin\NewsController;
use App\Http\Controllers\PublicPage\Admin\GalleryController;
use App\Http\Controllers\PublicPage\Admin\TenantProfileController;
use App\Http\Controllers\PublicPage\HomeController;
use App\Http\Controllers\PublicPage\NewsController as PublicNewsController;
use App\Http\Controllers\PublicPage\GalleryController as PublicGalleryController;
use App\Http\Controllers\PublicPage\GuestBookController as PublicGuestBookController;
use App\Http\Controllers\PublicLibraryController;
use Modules\PublicPage\Http\Controllers\ThemeController;

/*
|--------------------------------------------------------------------------
| PublicPage Module Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul PublicPage
| - Admin routes untuk tenant management
| - Public routes untuk frontend tenant
|
*/

// Guest Book Public routes - HARUS di paling atas untuk prioritas maksimal
// Route ini harus didefinisikan sebelum route lain yang mungkin menangkapnya
Route::get('{tenant}/guest-book/create', [PublicGuestBookController::class, 'create'])
    ->where('tenant', '[0-9]+')
    ->middleware(['web', 'tenant'])
    ->name('tenant.public.guest-book.create');
Route::post('{tenant}/guest-book/store', [PublicGuestBookController::class, 'store'])
    ->where('tenant', '[0-9]+')
    ->middleware(['web', 'tenant'])
    ->name('tenant.public.guest-book.store');

// Admin routes (dalam tenant dashboard)
Route::prefix('{tenant}/public-page')->name('tenant.public-page.')->middleware(['web', 'auth', 'tenant'])->group(function () {
    
    // Menu Management
    Route::resource('menus', MenuController::class);
    Route::post('menus/update-order', [MenuController::class, 'updateOrder'])->name('menus.update-order');
    
    // News Management
    Route::resource('news', NewsController::class);
    Route::post('news/{news}/toggle-featured', [NewsController::class, 'toggleFeatured'])->name('news.toggle-featured');
    Route::post('news/bulk-action', [NewsController::class, 'bulkAction'])->name('news.bulk-action');
    
    // Gallery Management
    Route::resource('gallery', GalleryController::class);
    Route::post('gallery/update-order', [GalleryController::class, 'updateOrder'])->name('gallery.update-order');
    
    // Tenant Profile Management
    Route::get('profile', [TenantProfileController::class, 'show'])->name('profile.show');
    Route::get('profile/create', [TenantProfileController::class, 'create'])->name('profile.create');
    Route::post('profile', [TenantProfileController::class, 'store'])->name('profile.store');
    Route::get('profile/edit', [TenantProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [TenantProfileController::class, 'update'])->name('profile.update');
    Route::get('profile/preview', [TenantProfileController::class, 'preview'])->name('profile.preview');
    
    // Theme Management
    Route::resource('themes', ThemeController::class)->except(['show']);
    Route::post('themes/apply', [ThemeController::class, 'apply'])->name('themes.apply');
    Route::get('themes/preview/{themeName?}', [ThemeController::class, 'preview'])->name('themes.preview-name');
    Route::get('themes/{theme}/preview', [ThemeController::class, 'preview'])->name('themes.preview');
    Route::get('themes/{theme}/export', [ThemeController::class, 'export'])->name('themes.export');
    Route::post('themes/import', [ThemeController::class, 'import'])->name('themes.import');
    Route::post('themes/{theme}/duplicate', [ThemeController::class, 'duplicate'])->name('themes.duplicate');
});

// Public routes (frontend tenant) - untuk localhost dengan parameter tenant
Route::prefix('{tenant}')->name('tenant.')->middleware(['web', 'tenant'])->group(function () {
    
    // Home page
    Route::get('/', [HomeController::class, 'index'])->name('public.home');
    Route::get('/about', [HomeController::class, 'about'])->name('public.about');
    Route::get('/contact', [HomeController::class, 'contact'])->name('public.contact');
    
    // News routes
    Route::get('/news', [PublicNewsController::class, 'index'])->name('public.news.index');
    Route::get('/news/{slug}', [PublicNewsController::class, 'show'])->name('public.news.show');
    
    // Gallery routes
    Route::get('/gallery', [PublicGalleryController::class, 'index'])->name('public.gallery.index');
    Route::get('/gallery/{id}', [PublicGalleryController::class, 'show'])->name('public.gallery.show');
    
    // Public Library routes
    Route::prefix('library')->name('public.library.')->group(function () {
        Route::get('/', [PublicLibraryController::class, 'index'])->name('index');
        Route::get('/{id}', [PublicLibraryController::class, 'show'])->name('show');
        Route::get('/{id}/read', [PublicLibraryController::class, 'read'])->name('read');
        Route::get('/{id}/download', [PublicLibraryController::class, 'download'])->name('download');
        
        // AJAX routes for authenticated users
        Route::middleware('auth')->group(function () {
            Route::post('/{id}/progress', [PublicLibraryController::class, 'updateProgress'])->name('progress');
            Route::post('/{id}/bookmark', [PublicLibraryController::class, 'addBookmark'])->name('bookmark');
            Route::delete('/{id}/bookmark', [PublicLibraryController::class, 'removeBookmark'])->name('bookmark.remove');
            Route::post('/{id}/favorite', [PublicLibraryController::class, 'toggleFavorite'])->name('favorite');
        });
    });
    
    // PPDB Public routes (with tenant prefix)
    Route::prefix('ppdb')->name('public.ppdb.tenant.')->group(function () {
        Route::get('/{slug}', [\App\Http\Controllers\PublicPPDBController::class, 'showBySlug'])->name('show');
    });
    
    // Login routes untuk tenant
    Route::middleware('guest')->group(function () {
        Route::get('/login', [\App\Http\Controllers\PublicPage\TenantAuthController::class, 'showLoginForm'])->name('public.login');
        Route::post('/login', [\App\Http\Controllers\PublicPage\TenantAuthController::class, 'login'])->middleware('throttle:5,1');
    });
    
    // Logout route untuk tenant
    Route::post('/logout', [\App\Http\Controllers\PublicPage\TenantAuthController::class, 'logout'])->name('public.logout');
});

// Public routes untuk domain/subdomain tenant (tanpa parameter tenant)
// Hanya untuk domain yang bukan localhost atau 127.0.0.1
Route::middleware(['web', 'tenant.domain'])->group(function () {
    
    // Home page - hanya untuk domain yang bukan localhost
    // Route ini dihapus untuk menghindari konflik dengan route utama
    // Route::get('/', [HomeController::class, 'index'])->name('tenant.public.home');
    Route::get('/about', [HomeController::class, 'about'])->name('tenant.public.about');
    Route::get('/contact', [HomeController::class, 'contact'])->name('tenant.public.contact');
    
    // News routes
    Route::get('/news', [PublicNewsController::class, 'index'])->name('tenant.public.news.index');
    Route::get('/news/{slug}', [PublicNewsController::class, 'show'])->name('tenant.public.news.show');
    
    // Gallery routes
    Route::get('/gallery', [PublicGalleryController::class, 'index'])->name('tenant.public.gallery.index');
    Route::get('/gallery/{id}', [PublicGalleryController::class, 'show'])->name('tenant.public.gallery.show');
    
    // Public Library routes
    Route::prefix('library')->name('tenant.public.library.')->group(function () {
        Route::get('/', [PublicLibraryController::class, 'index'])->name('index');
        Route::get('/{id}', [PublicLibraryController::class, 'show'])->name('show');
        Route::get('/{id}/read', [PublicLibraryController::class, 'read'])->name('read');
        Route::get('/{id}/download', [PublicLibraryController::class, 'download'])->name('download');
        
        // AJAX routes for authenticated users
        Route::middleware('auth')->group(function () {
            Route::post('/{id}/progress', [PublicLibraryController::class, 'updateProgress'])->name('progress');
            Route::post('/{id}/bookmark', [PublicLibraryController::class, 'addBookmark'])->name('bookmark');
            Route::delete('/{id}/bookmark', [PublicLibraryController::class, 'removeBookmark'])->name('bookmark.remove');
            Route::post('/{id}/favorite', [PublicLibraryController::class, 'toggleFavorite'])->name('favorite');
        });
    });
    
    // Login routes untuk tenant - hanya untuk domain yang bukan localhost
    // Hapus route login di sini karena sudah ada di web.php untuk menghindari konflik
    // Route login untuk tenant public menggunakan path {tenant}/login yang berbeda
    
    // Logout route untuk tenant
    Route::post('/logout', [\App\Http\Controllers\PublicPage\TenantAuthController::class, 'logout'])->name('tenant.public.logout');
});
