<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\SystemLogController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\TenantFeatureController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\TenantAccessController;
use App\Http\Controllers\Admin\SuperAdminAccessController;
use App\Http\Controllers\Admin\TenantOnboardingController;
use App\Http\Controllers\Admin\TenantResourceLimitController;
use App\Http\Controllers\Admin\TenantActivityLogController;
use App\Http\Controllers\Admin\TenantHealthMonitoringController;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Routes untuk Super Admin - Hanya mengelola tenant dan user global
| Scope: Global system management, tenant management, global user management
|
*/

Route::prefix('admin')->name('admin.')->middleware(['web', 'auth', 'role:super_admin'])->group(function () {
    
    // Logout route untuk admin
    Route::post('logout', [\App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');
    
    // Dashboard - Statistik global saja
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Tenant Management - CRUD tenant, aktivasi/deaktivasi
    Route::resource('tenants', TenantController::class);
    Route::post('tenants/{tenant}/activate', [TenantController::class, 'activate'])->name('tenants.activate');
    Route::post('tenants/{tenant}/deactivate', [TenantController::class, 'deactivate'])->name('tenants.deactivate');
    
    // Tenant Onboarding Wizard
    Route::get('tenants/{tenant}/onboarding', [TenantOnboardingController::class, 'show'])->name('tenants.onboarding');
    Route::post('tenants/{tenant}/onboarding/start', [TenantOnboardingController::class, 'start'])->name('tenants.onboarding.start');
    Route::post('tenants/{tenant}/onboarding/reset', [TenantOnboardingController::class, 'reset'])->name('tenants.onboarding.reset');
    Route::post('tenants/{tenant}/onboarding/step/{stepKey}', [TenantOnboardingController::class, 'completeStep'])->name('tenants.onboarding.complete-step');
    
    // Tenant Resource Limits & Monitoring
    Route::get('tenants/{tenant}/resource-limits', [TenantResourceLimitController::class, 'show'])->name('tenants.resource-limits');
    Route::put('tenants/{tenant}/resource-limits', [TenantResourceLimitController::class, 'update'])->name('tenants.resource-limits.update');
    Route::post('tenants/{tenant}/resource-limits/refresh', [TenantResourceLimitController::class, 'refresh'])->name('tenants.resource-limits.refresh');
    
    // Tenant Activity Logs & Audit Trail
    Route::get('tenants/{tenant}/activity-logs', [TenantActivityLogController::class, 'index'])->name('tenants.activity-logs');
    Route::get('tenants/{tenant}/activity-logs/export', [TenantActivityLogController::class, 'export'])->name('tenants.activity-logs.export');
    
    // Tenant Health Monitoring
    Route::get('tenants/{tenant}/health', [TenantHealthMonitoringController::class, 'show'])->name('tenants.health');
    Route::post('tenants/{tenant}/health/refresh', [TenantHealthMonitoringController::class, 'refresh'])->name('tenants.health.refresh');
    Route::post('tenants/{tenant}/health/clear-alerts', [TenantHealthMonitoringController::class, 'clearAlerts'])->name('tenants.health.clear-alerts');
    Route::get('tenants-health', [TenantHealthMonitoringController::class, 'index'])->name('tenants-health.index');
    Route::post('tenants-health/check-all', [TenantHealthMonitoringController::class, 'checkAll'])->name('tenants-health.check-all');
    
    // Global User Management - Hanya admin_tenant dan super_admin
    Route::resource('users', UserController::class);
    Route::post('users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
    
    // System Monitoring - Log aktivitas dan status sistem
    Route::get('logs', [SystemLogController::class, 'index'])->name('logs');
    Route::get('logs/{log}', [SystemLogController::class, 'show'])->name('logs.show');
    
    // Backup & Recovery
    Route::get('backup', [BackupController::class, 'index'])->name('backup');
    Route::post('backup/create', [BackupController::class, 'create'])->name('backup.create');
    Route::get('backup/download/{backup}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('backup/{backup}', [BackupController::class, 'destroy'])->name('backup.destroy');
    
    // Global Configuration - Pengaturan aplikasi utama
    Route::get('settings', [SystemSettingsController::class, 'index'])->name('settings');
    Route::put('settings', [SystemSettingsController::class, 'update'])->name('settings.update');
    Route::delete('settings/logo', [SystemSettingsController::class, 'deleteLogo'])->name('settings.delete-logo');
    Route::delete('settings/favicon', [SystemSettingsController::class, 'deleteFavicon'])->name('settings.delete-favicon');

    // Tenant Features Management - Mengatur fitur yang aktif di tenant
    Route::get('tenant-features', [TenantFeatureController::class, 'index'])->name('tenant-features.index');
    Route::get('tenant-features/{tenant}', [TenantFeatureController::class, 'show'])->name('tenant-features.show');
    Route::put('tenant-features/{tenant}', [TenantFeatureController::class, 'update'])->name('tenant-features.update');
    Route::post('tenant-features/bulk-update', [TenantFeatureController::class, 'bulkUpdate'])->name('tenant-features.bulk-update');
    
    // Tenant Access Management - Mengatur akses fitur dan modul untuk tenant
    Route::get('tenant-access', [TenantAccessController::class, 'index'])->name('tenant-access.index');
    Route::get('tenant-access/bulk', [TenantAccessController::class, 'bulk'])->name('tenant-access.bulk');
    Route::get('tenant-access/{tenant}', [TenantAccessController::class, 'show'])->name('tenant-access.show');
    Route::post('tenant-access/{tenant}/feature', [TenantAccessController::class, 'updateFeature'])->name('tenant-access.update-feature');
    Route::post('tenant-access/{tenant}/module', [TenantAccessController::class, 'updateModule'])->name('tenant-access.update-module');
    Route::delete('tenant-access/{tenant}/feature/{featureKey}', [TenantAccessController::class, 'removeFeature'])->name('tenant-access.remove-feature');
    Route::delete('tenant-access/{tenant}/module/{moduleKey}', [TenantAccessController::class, 'removeModule'])->name('tenant-access.remove-module');
    Route::post('tenant-access/bulk-update', [TenantAccessController::class, 'bulkUpdate'])->name('tenant-access.bulk-update');
    
    // Statistics & Reports - Statistik dan laporan lengkap
    Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index');
    Route::get('statistics/institutions', [StatisticsController::class, 'institutions'])->name('statistics.institutions');
    Route::get('statistics/students', [StatisticsController::class, 'students'])->name('statistics.students');
    Route::get('statistics/teachers', [StatisticsController::class, 'teachers'])->name('statistics.teachers');
    Route::get('statistics/academic', [StatisticsController::class, 'academic'])->name('statistics.academic');
    Route::get('statistics/export', [StatisticsController::class, 'export'])->name('statistics.export');
    Route::get('statistics/chart-data', [StatisticsController::class, 'chartData'])->name('statistics.chart-data');

    // Super Admin Tenant Access Management
    Route::prefix('super-admin-access')->name('super-admin-access.')->group(function () {
        Route::get('/', [SuperAdminAccessController::class, 'index'])->name('index');
        Route::get('/requests', [SuperAdminAccessController::class, 'myRequests'])->name('requests');
        Route::get('/request/{tenant}', [SuperAdminAccessController::class, 'showRequestForm'])->name('request');
        Route::post('/request/{tenant}', [SuperAdminAccessController::class, 'requestAccess'])->name('request.store');
        Route::post('/access/{tenant}', [SuperAdminAccessController::class, 'accessTenant'])->name('access');
    });

    // System Health Monitoring
    Route::get('system-health', [\App\Http\Controllers\Admin\SystemHealthController::class, 'index'])->name('system-health.index');
    Route::get('system-health/status', [\App\Http\Controllers\Admin\SystemHealthController::class, 'status'])->name('system-health.status');

    // Activity Monitoring
    Route::get('activity-monitor', [\App\Http\Controllers\Admin\ActivityMonitorController::class, 'index'])->name('activity-monitor.index');
    Route::get('activity-monitor/export', [\App\Http\Controllers\Admin\ActivityMonitorController::class, 'export'])->name('activity-monitor.export');

    // Subscription Management
    Route::resource('subscriptions', \App\Http\Controllers\Admin\SubscriptionController::class)->only(['index', 'show']);
    Route::post('subscriptions/{tenant}/update-student-count', [\App\Http\Controllers\Admin\SubscriptionController::class, 'updateStudentCount'])->name('subscriptions.update-student-count');
    Route::post('subscriptions/{subscription}/renewal', [\App\Http\Controllers\Admin\SubscriptionController::class, 'processRenewal'])->name('subscriptions.renewal');
    Route::post('subscriptions/billing/{billingHistory}/mark-paid', [\App\Http\Controllers\Admin\SubscriptionController::class, 'markAsPaid'])->name('subscriptions.mark-paid');
    Route::get('subscriptions/statistics', [\App\Http\Controllers\Admin\SubscriptionController::class, 'statistics'])->name('subscriptions.statistics');
    
    // NPSN Change Requests Management
    Route::prefix('npsn-change-requests')->name('npsn-change-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\NpsnChangeRequestController::class, 'index'])->name('index');
        Route::get('/{npsnChangeRequest}', [\App\Http\Controllers\Admin\NpsnChangeRequestController::class, 'show'])->name('show');
        Route::post('/{npsnChangeRequest}/approve', [\App\Http\Controllers\Admin\NpsnChangeRequestController::class, 'approve'])->name('approve');
        Route::post('/{npsnChangeRequest}/reject', [\App\Http\Controllers\Admin\NpsnChangeRequestController::class, 'reject'])->name('reject');
    });
});