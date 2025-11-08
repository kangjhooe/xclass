<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicPPDBController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Routes utama untuk aplikasi CLASS
| Termasuk authentication dan routing ke admin/tenant
|
*/

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');

// PPDB Public routes
Route::prefix('ppdb')->name('public.ppdb.')->group(function () {
    Route::get('/', [PublicPPDBController::class, 'index'])->name('index');
    Route::post('/', [PublicPPDBController::class, 'store'])->name('store');
    Route::get('/success/{registrationNumber}', [PublicPPDBController::class, 'success'])->name('success');
    Route::get('/pengumuman', [PublicPPDBController::class, 'announcement'])->name('announcement');
    Route::post('/cek-hasil', [PublicPPDBController::class, 'checkResult'])->name('check-result');
    Route::get('/announcement/export', [\App\Http\Controllers\PublicPPDBController::class, 'exportAccepted'])->name('export-accepted');
});

// PPDB Registration (Calon Siswa)
Route::middleware('guest')->prefix('ppdb')->name('ppdb.')->group(function () {
    Route::get('/daftar', [\App\Http\Controllers\Auth\PPDBRegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/daftar', [\App\Http\Controllers\Auth\PPDBRegisterController::class, 'register'])->middleware('throttle:5,1');
});

// PPDB Wizard (calon siswa)
Route::middleware(['auth', 'role:calon_siswa'])->prefix('ppdb')->name('ppdb.wizard.')->group(function () {
    Route::get('/wizard', [\App\Http\Controllers\PPDB\WizardController::class, 'index'])->name('index');
    // API autosave per step
    Route::get('/applications/{application}/profile', [\App\Http\Controllers\PPDB\ProfileController::class, 'get'])->name('profile.get');
    Route::post('/applications/{application}/profile/step/{step}', [\App\Http\Controllers\PPDB\ProfileController::class, 'saveStep'])->name('profile.saveStep');
    Route::post('/applications/{application}/profile/upload', [\App\Http\Controllers\PPDB\ProfileController::class, 'upload'])->name('profile.upload');
    Route::post('/applications/{application}/submit', [\App\Http\Controllers\PPDB\WizardController::class, 'submit'])->name('submit');
});

// Geo regions API (auth calon_siswa)
Route::middleware(['auth', 'role:calon_siswa'])->prefix('geo')->name('geo.')->group(function () {
    Route::get('/provinces', [\App\Http\Controllers\Geo\RegionController::class, 'provinces'])->name('provinces');
    Route::get('/regencies/{province}', [\App\Http\Controllers\Geo\RegionController::class, 'regencies'])->name('regencies');
    Route::get('/districts/{province}/{regency}', [\App\Http\Controllers\Geo\RegionController::class, 'districts'])->name('districts');
    Route::get('/villages/{province}/{regency}/{district}', [\App\Http\Controllers\Geo\RegionController::class, 'villages'])->name('villages');
});

// Authentication routes
// Route login harus selalu tersedia untuk middleware auth yang mencoba redirect
// Untuk development (local/testing), route login tersedia di semua host
// Untuk production, route login tersedia di admin domain dan juga fallback untuk localhost
Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('login', [LoginController::class, 'login'])->middleware('throttle:5,1');
    Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('register', [RegisterController::class, 'register'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'logout'])->name('logout');
    
    // Redirect berdasarkan role
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
});

// Untuk production, juga buat route di admin domain (untuk kompatibilitas)
if (!app()->environment('local', 'testing')) {
    Route::domain(config('tenant.domain.admin'))->middleware('guest')->group(function () {
        Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
        Route::post('login', [LoginController::class, 'login'])->middleware('throttle:5,1');
        Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
        Route::post('register', [RegisterController::class, 'register'])->middleware('throttle:5,1');
    });
}

// Public Guest Book routes sudah dipindahkan ke routes/publicpage.php
// Route ini tidak memerlukan auth, jadi bisa diakses tanpa login

// Include admin routes
require __DIR__.'/admin.php';

// Include publicpage routes (harus dimuat SEBELUM tenant routes agar route publik tidak tertangkap oleh route dashboard)
require __DIR__.'/publicpage.php';

// Include tenant routes
require __DIR__.'/tenant.php';

// Include tenant modules routes
require __DIR__.'/tenant-modules.php';

// Include error test routes (development only)
if (app()->environment('local', 'testing')) {
    require __DIR__.'/error-test.php';
}
