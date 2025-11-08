<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\TeacherController;
use App\Http\Controllers\Tenant\ClassController;
use App\Http\Controllers\Tenant\SubjectController;
use App\Http\Controllers\Tenant\ScheduleController;
use App\Http\Controllers\Tenant\AttendanceController;
use App\Http\Controllers\Tenant\GradeController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\MessageController;
use App\Http\Controllers\Tenant\AnnouncementController;
use App\Http\Controllers\Tenant\ReportController;
use App\Http\Controllers\Tenant\IncomingLetterController;
use App\Http\Controllers\Tenant\OutgoingLetterController;
use App\Http\Controllers\Tenant\LetterTemplateController;
use App\Http\Controllers\Tenant\LetterNumberSettingController;
use App\Http\Controllers\Tenant\LetterDashboardController;
use App\Http\Controllers\Tenant\AlumniController;
use App\Http\Controllers\Tenant\PpdbController;
use App\Http\Controllers\Tenant\GuestBookController;
use App\Http\Controllers\Tenant\TenantSettingsController;
use App\Http\Controllers\Tenant\UserManagementController;
use App\Http\Controllers\Tenant\CardController;
use App\Http\Controllers\Tenant\CardTemplateController;
use App\Http\Controllers\NotificationController;
// use Modules\PublicPage\Http\Controllers\Admin\MenuController;
// use Modules\PublicPage\Http\Controllers\Admin\NewsController;
// use Modules\PublicPage\Http\Controllers\Admin\GalleryController;
// use Modules\PublicPage\Http\Controllers\Admin\TenantProfileController;
// use Modules\PublicPage\Http\Controllers\Public\HomeController;
// use Modules\PublicPage\Http\Controllers\Public\NewsController as PublicNewsController;
// use Modules\PublicPage\Http\Controllers\Public\GalleryController as PublicGalleryController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Routes untuk setiap tenant (sekolah)
| Setiap route akan memiliki prefix {tenant} dan middleware tenant
|
*/

Route::prefix('{tenant}')->name('tenant.')->middleware(['web', 'auth', 'tenant', 'tenant.model.binding'])->group(function () {
    
    // Logout route untuk tenant
    Route::post('logout', [\App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');
    
    // Geo regions API untuk tenant admin
    Route::prefix('geo')->name('geo.')->group(function () {
        Route::get('/provinces', [\App\Http\Controllers\Geo\RegionController::class, 'provinces'])->name('provinces');
        Route::get('/regencies/{province}', [\App\Http\Controllers\Geo\RegionController::class, 'regencies'])->name('regencies');
        Route::get('/districts/{province}/{regency}', [\App\Http\Controllers\Geo\RegionController::class, 'districts'])->name('districts');
        Route::get('/villages/{province}/{regency}/{district}', [\App\Http\Controllers\Geo\RegionController::class, 'villages'])->name('villages');
    });
    
    // Dashboard - hanya menggunakan /dashboard, bukan / karena / digunakan untuk halaman publik
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Teacher Dashboard - untuk guru melihat dan melengkapi data sendiri
    Route::get('/teacher/dashboard', [\App\Http\Controllers\Tenant\TeacherDashboardController::class, 'index'])->name('teacher.dashboard');
    
    // Billing & Subscription
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Tenant\BillingController::class, 'index'])->name('index');
        Route::get('/history', [\App\Http\Controllers\Tenant\BillingController::class, 'history'])->name('history');
    });
    
    // Profile Management - Redirect to settings (Profil Instansi)
    Route::get('profile/edit', function() {
        return redirect()->route('tenant.settings.index', ['tenant' => request()->route('tenant')->npsn]);
    })->name('profile.edit');
    Route::put('profile/update', function() {
        return redirect()->route('tenant.settings.index', ['tenant' => request()->route('tenant')->npsn])
            ->with('info', 'Silakan gunakan menu Profil Instansi untuk mengupdate profil.');
    })->name('profile.update');
    
    // Student Management - Moved to tenant-modules.php with access control
    
    // Teacher Management - Moved to tenant-modules.php with access control
    // Route resource sudah dipindah ke tenant-modules.php untuk kontrol akses yang lebih baik
    
    // Additional Duties Management (hanya untuk admin tenant)
    Route::middleware('tenant.access:permission,teachers:update')->group(function () {
        Route::resource('additional-duties', \App\Http\Controllers\Tenant\AdditionalDutyController::class)
            ->parameters(['additional-duties' => 'additionalDuty']);
    });
    
    // Class Management - Moved to tenant-modules.php with access control
    // Route resource sudah dipindah ke tenant-modules.php untuk kontrol akses yang lebih baik
    // Route tambahan untuk classes (add-students, set-homeroom-teacher, dll) juga sudah ada di tenant-modules.php
    
    // Subject Management
    Route::resource('subjects', SubjectController::class);
    Route::get('subjects/{subject}/teachers', [SubjectController::class, 'teachers'])->name('subjects.teachers');
    
    // Schedule Management
    Route::resource('schedules', ScheduleController::class);
    Route::get('schedules/teacher/{teacher}', [ScheduleController::class, 'byTeacher'])->name('schedules.by-teacher');
    Route::get('schedules/class/{class}', [ScheduleController::class, 'byClass'])->name('schedules.by-class');
    Route::get('schedules/weekly', [ScheduleController::class, 'weekly'])->name('schedules.weekly');
    
    // Attendance Management
    Route::resource('attendances', AttendanceController::class);
    Route::get('attendances/class/{class}', [AttendanceController::class, 'byClass'])->name('attendances.by-class');
    Route::get('attendances/student/{student}', [AttendanceController::class, 'byStudent'])->name('attendances.by-student');
    Route::post('attendances/bulk', [AttendanceController::class, 'bulkUpdate'])->name('attendances.bulk');
    
    // Grade Management
    Route::resource('grades', GradeController::class);
    Route::get('grades/student/{student}', [GradeController::class, 'byStudent'])->name('grades.by-student');
    Route::get('grades/subject/{subject}', [GradeController::class, 'bySubject'])->name('grades.by-subject');
    Route::post('grades/bulk', [GradeController::class, 'bulkCreate'])->name('grades.bulk');
    
    // Academic Year Management
    Route::resource('academic-years', \App\Http\Controllers\Tenant\AcademicYearController::class);
    Route::post('academic-years/{academicYear}/set-active', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'setActive'])->name('academic-years.set-active');
    Route::post('academic-years/{academicYear}/set-semester', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'setActiveSemester'])->name('academic-years.set-semester');
    Route::get('academic-years/{academicYear}/copy-data', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'showCopyForm'])->name('academic-years.copy-data');
    Route::get('academic-years/{academicYear}/get-classes', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'getClasses'])->name('academic-years.get-classes');
    Route::post('academic-years/{academicYear}/copy-schedules', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'copySchedules'])->name('academic-years.copy-schedules');
    Route::post('academic-years/{academicYear}/copy-classes', [\App\Http\Controllers\Tenant\AcademicYearController::class, 'copyClasses'])->name('academic-years.copy-classes');
    
    // Student Promotion Management
    Route::resource('promotions', \App\Http\Controllers\Tenant\PromotionController::class);
    Route::post('promotions/{promotion}/approve', [\App\Http\Controllers\Tenant\PromotionController::class, 'approve'])->name('promotions.approve');
    Route::post('promotions/{promotion}/complete', [\App\Http\Controllers\Tenant\PromotionController::class, 'complete'])->name('promotions.complete');
    Route::post('promotions/{promotion}/cancel', [\App\Http\Controllers\Tenant\PromotionController::class, 'cancel'])->name('promotions.cancel');
    Route::post('promotions/bulk-complete', [\App\Http\Controllers\Tenant\PromotionController::class, 'bulkComplete'])->name('promotions.bulk-complete');
    Route::get('promotions/students-by-class', [\App\Http\Controllers\Tenant\PromotionController::class, 'getStudentsByClass'])->name('promotions.students-by-class');
    
    // Grade Weight Management
    Route::resource('grade-weights', \App\Http\Controllers\Tenant\GradeWeightController::class);
    Route::post('grade-weights/reset-default', [\App\Http\Controllers\Tenant\GradeWeightController::class, 'resetToDefault'])->name('grade-weights.reset-default');
    Route::post('grade-weights/{gradeWeight}/toggle-active', [\App\Http\Controllers\Tenant\GradeWeightController::class, 'toggleActive'])->name('grade-weights.toggle-active');
    
    // Student Grade Management
    Route::resource('student-grades', \App\Http\Controllers\Tenant\StudentGradeController::class);
    Route::get('student-grades/bulk-input', [\App\Http\Controllers\Tenant\StudentGradeController::class, 'bulkInput'])->name('student-grades.bulk-input');
    Route::post('student-grades/bulk-store', [\App\Http\Controllers\Tenant\StudentGradeController::class, 'storeBulk'])->name('student-grades.bulk-store');
    Route::get('student-grades/students-by-class', [\App\Http\Controllers\Tenant\StudentGradeController::class, 'getStudentsByClass'])->name('student-grades.students-by-class');
    
    // Academic Reports
    Route::prefix('academic-reports')->name('academic-reports.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Tenant\AcademicReportController::class, 'dashboard'])->name('dashboard');
        Route::get('class-report', [\App\Http\Controllers\Tenant\AcademicReportController::class, 'classReport'])->name('class-report');
        Route::get('student-report', [\App\Http\Controllers\Tenant\AcademicReportController::class, 'studentReport'])->name('student-report');
        Route::post('print-report', [\App\Http\Controllers\Tenant\AcademicReportController::class, 'printReport'])->name('print-report');
        Route::post('export-grades', [\App\Http\Controllers\Tenant\AcademicReportController::class, 'exportGrades'])->name('export-grades');
    });
    
    // Staff Management
    Route::resource('staff', StaffController::class);
    Route::get('staff/statistics', [StaffController::class, 'statistics'])->name('staff.statistics');
    
    // Alumni Management - Moved to tenant-modules.php with access control
    
    // Data Pokok Management - Moved to tenant-modules.php with access control
    
    // Messaging System
    Route::resource('messages', MessageController::class);
    Route::get('messages/inbox', [MessageController::class, 'inbox'])->name('messages.inbox');
    Route::get('messages/sent', [MessageController::class, 'sent'])->name('messages.sent');
    Route::get('messages/archived', [MessageController::class, 'archived'])->name('messages.archived');
    Route::post('messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
    Route::post('messages/{message}/mark-read', [MessageController::class, 'markAsRead'])->name('messages.mark-read');
    Route::post('messages/{message}/archive', [MessageController::class, 'archive'])->name('messages.archive');
    
    // Announcement System
    Route::resource('announcements', AnnouncementController::class);
    Route::get('announcements/public', [AnnouncementController::class, 'public'])->name('announcements.public');
    
    // Reports & Analytics
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'dashboard'])->name('dashboard');
        Route::get('academic-performance', [ReportController::class, 'academicPerformance'])->name('academic-performance');
        Route::get('attendance', [ReportController::class, 'attendance'])->name('attendance');
        Route::get('student-performance', [ReportController::class, 'studentPerformance'])->name('student-performance');
        Route::get('teacher-workload', [ReportController::class, 'teacherWorkload'])->name('teacher-workload');
        Route::get('class-performance', [ReportController::class, 'classPerformance'])->name('class-performance');
        Route::post('export', [ReportController::class, 'export'])->name('export');
    });

    // Letter Management (Persuratan)
    Route::prefix('letters')->name('letters.')->group(function () {
        // Dashboard
        Route::get('/', [LetterDashboardController::class, 'index'])->name('dashboard');
        Route::get('dashboard', [LetterDashboardController::class, 'index'])->name('dashboard');
        
        // API Routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('new-letters', [LetterDashboardController::class, 'apiNewLetters'])->name('new-letters');
        });
        // Surat Masuk
        Route::resource('incoming', IncomingLetterController::class)->parameters(['incoming' => 'surat_masuk']);
        Route::get('incoming/{surat_masuk}/download', [IncomingLetterController::class, 'download'])->name('incoming.download');
        Route::post('incoming/{surat_masuk}/status', [IncomingLetterController::class, 'updateStatus'])->name('incoming.status');
        Route::post('incoming/{surat_masuk}/disposition', [IncomingLetterController::class, 'addDisposition'])->name('incoming.disposition');
        Route::post('incoming/bulk-status', [IncomingLetterController::class, 'bulkUpdateStatus'])->name('incoming.bulk-status');
        Route::get('incoming/search-suggestions', [IncomingLetterController::class, 'searchSuggestions'])->name('incoming.search-suggestions');
        Route::get('incoming/export', [IncomingLetterController::class, 'export'])->name('incoming.export');
        Route::get('incoming/print', [IncomingLetterController::class, 'print'])->name('incoming.print');
        Route::get('incoming/{surat_masuk}/activity-logs', [IncomingLetterController::class, 'activityLogs'])->name('incoming.activity-logs');
        
        // Surat Keluar
        Route::resource('outgoing', OutgoingLetterController::class)->parameters(['outgoing' => 'surat_keluar']);
        Route::get('outgoing/{surat_keluar}/download', [OutgoingLetterController::class, 'download'])->name('outgoing.download');
        Route::post('outgoing/{surat_keluar}/status', [OutgoingLetterController::class, 'updateStatus'])->name('outgoing.status');
        Route::post('outgoing/{surat_keluar}/archive', [OutgoingLetterController::class, 'archive'])->name('outgoing.archive');
        Route::get('outgoing/preview-nomor', [OutgoingLetterController::class, 'previewNomorSurat'])->name('outgoing.preview-nomor');
        Route::post('outgoing/process-template', [OutgoingLetterController::class, 'processTemplate'])->name('outgoing.process-template');
        Route::get('outgoing/template-variables', [OutgoingLetterController::class, 'getTemplateVariables'])->name('outgoing.template-variables');
        Route::get('outgoing/export', [OutgoingLetterController::class, 'export'])->name('outgoing.export');
        Route::get('outgoing/print', [OutgoingLetterController::class, 'print'])->name('outgoing.print');
        Route::get('outgoing/{surat_keluar}/activity-logs', [OutgoingLetterController::class, 'activityLogs'])->name('outgoing.activity-logs');
        
        // Template Surat
        Route::resource('templates', LetterTemplateController::class)->parameters(['templates' => 'template_surat']);
        Route::post('templates/{template_surat}/toggle-active', [LetterTemplateController::class, 'toggleActive'])->name('templates.toggle-active');
        Route::get('templates/{template_surat}/preview', [LetterTemplateController::class, 'preview'])->name('templates.preview');
        Route::get('templates/by-category', [LetterTemplateController::class, 'getByCategory'])->name('templates.by-category');
        Route::get('templates/{template_surat}/variables', [LetterTemplateController::class, 'getVariables'])->name('templates.variables');
        
        // Pengaturan Nomor Surat
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::resource('number-settings', LetterNumberSettingController::class)->parameters(['number-settings' => 'pengaturan_nomor_surat']);
            Route::get('number-settings/preview', [LetterNumberSettingController::class, 'preview'])->name('number-settings.preview');
            Route::post('number-settings/{pengaturan_nomor_surat}/reset', [LetterNumberSettingController::class, 'reset'])->name('number-settings.reset');
        });
    });

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::get('recent', [NotificationController::class, 'recent'])->name('recent');
        Route::post('{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::post('{notification}/mark-unread', [NotificationController::class, 'markAsUnread'])->name('mark-unread');
        Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::post('clear-all', [NotificationController::class, 'clearAll'])->name('clear-all');
        Route::post('clear-read', [NotificationController::class, 'clearRead'])->name('clear-read');
    });

    // User Management (RBAC)
    Route::prefix('users')->name('users.')->middleware('can:manage,App\Models\User')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/create', [UserManagementController::class, 'create'])->name('create');
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        Route::patch('/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/{user}/permissions', [UserManagementController::class, 'getPermissions'])->name('permissions');
    });

    // PPDB Management
    Route::prefix('ppdb')->name('ppdb.')->group(function () {
        Route::get('/', [PpdbController::class, 'index'])->name('index');
        Route::get('/dashboard', [PpdbController::class, 'dashboard'])->name('dashboard');
        Route::get('/export', [PpdbController::class, 'export'])->name('export');
        
        // PPDB Configuration (harus sebelum route dengan parameter dinamis)
        Route::get('/configuration', [PpdbController::class, 'configuration'])->name('configuration');
        Route::get('/configuration/create', [PpdbController::class, 'createConfiguration'])->name('configuration.create');
        Route::post('/configuration', [PpdbController::class, 'storeConfiguration'])->name('configuration.store');
        Route::get('/configuration/{configuration}/edit', [PpdbController::class, 'editConfiguration'])->name('configuration.edit');
        Route::put('/configuration/{configuration}', [PpdbController::class, 'updateConfiguration'])->name('configuration.update');
        Route::post('/configuration/{configuration}/toggle', [PpdbController::class, 'toggleConfiguration'])->name('configuration.toggle');
        Route::post('/configuration/{configuration}/run-selection', [PpdbController::class, 'runSelection'])->name('configuration.run-selection');
        
        // PPDB Application CRUD
        Route::get('/create', [PpdbController::class, 'create'])->name('create');
        Route::post('/', [PpdbController::class, 'store'])->name('store');
        // Gunakan constraint untuk membedakan dengan route public (harus numeric ID)
        Route::get('/{application}', [PpdbController::class, 'show'])->name('show')->where('application', '[0-9]+');
        Route::get('/{application}/edit', [PpdbController::class, 'edit'])->name('edit')->where('application', '[0-9]+');
        Route::put('/{application}', [PpdbController::class, 'update'])->name('update')->where('application', '[0-9]+');
        Route::put('/{application}/status', [PpdbController::class, 'updateStatus'])->name('update-status')->where('application', '[0-9]+');
        Route::put('/{application}/verify-documents', [PpdbController::class, 'verifyDocuments'])->name('verify-documents')->where('application', '[0-9]+');
        Route::delete('/{application}', [PpdbController::class, 'destroy'])->name('destroy')->where('application', '[0-9]+');
    });

    // Guest Book Management
    // Route create tersedia untuk admin yang sudah login (tenant.guest-book.create)
    // Form publik juga tersedia untuk akses tanpa login (public.guest-book.create)
    Route::prefix('guest-book')->name('guest-book.')->group(function () {
        Route::get('/', [GuestBookController::class, 'index'])->name('index');
        Route::get('/dashboard', [GuestBookController::class, 'dashboard'])->name('dashboard');
        Route::get('/create', [GuestBookController::class, 'create'])->name('create');
        Route::post('/', [GuestBookController::class, 'store'])->name('store');
        Route::get('/{guestBook}', [GuestBookController::class, 'show'])->name('show');
        Route::get('/{guestBook}/edit', [GuestBookController::class, 'edit'])->name('edit');
        Route::put('/{guestBook}', [GuestBookController::class, 'update'])->name('update');
        Route::post('/{guestBook}/checkout', [GuestBookController::class, 'checkOut'])->name('checkout');
        Route::delete('/{guestBook}', [GuestBookController::class, 'destroy'])->name('destroy');
    });

    // Card Management
    Route::prefix('cards')->name('cards.')->group(function () {
        Route::get('/', [CardController::class, 'index'])->name('index');
        Route::get('/create', [CardController::class, 'create'])->name('create');
        Route::post('/', [CardController::class, 'store'])->name('store');
        Route::post('/batch', [CardController::class, 'batchGenerate'])->name('batch');
        Route::get('/cardables', [CardController::class, 'ajaxGetCardables'])->name('cardables');
        
        // Template Management - Must be before routes with {card} parameter
        Route::prefix('templates')->name('templates.')->group(function () {
            Route::get('/', [CardTemplateController::class, 'index'])->name('index');
            Route::get('/data', [CardTemplateController::class, 'getTemplates'])->name('data');
            Route::get('/{cardTemplate}', [CardTemplateController::class, 'show'])->name('show');
            Route::get('/{cardTemplate}/customize', [CardTemplateController::class, 'editCustomization'])->name('customize');
            Route::put('/{cardTemplate}/customize', [CardTemplateController::class, 'updateCustomization'])->name('update-customization');
            Route::get('/{cardTemplate}/preview', [CardTemplateController::class, 'preview'])->name('preview');
        });
        
        // Card routes with parameter - Must be after specific routes
        Route::get('/{card}', [CardController::class, 'show'])->name('show');
        Route::get('/{card}/download', [CardController::class, 'download'])->name('download');
        Route::post('/{card}/regenerate', [CardController::class, 'regenerate'])->name('regenerate');
        Route::delete('/{card}', [CardController::class, 'destroy'])->name('destroy');
    });

    // Tenant Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [TenantSettingsController::class, 'index'])->name('index');
        Route::put('/update', [TenantSettingsController::class, 'update'])->name('update');
        Route::delete('/delete-logo', [TenantSettingsController::class, 'deleteLogo'])->name('delete-logo');
        Route::delete('/delete-favicon', [TenantSettingsController::class, 'deleteFavicon'])->name('delete-favicon');
    });
    
    // NPSN Change Requests (only for school_admin)
    Route::prefix('npsn-change-requests')->name('npsn-change-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Tenant\NpsnChangeRequestController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Tenant\NpsnChangeRequestController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Tenant\NpsnChangeRequestController::class, 'store'])->name('store');
        Route::get('/{npsnChangeRequest}', [\App\Http\Controllers\Tenant\NpsnChangeRequestController::class, 'show'])->name('show');
    });

    // Public Page Admin Routes - Temporarily disabled
    // Route::prefix('public-page')->name('public-page.')->middleware(['auth', 'tenant'])->group(function () {
    //     // Routes will be added later
    // });
});
