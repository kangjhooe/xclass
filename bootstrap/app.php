<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // Route lainnya sudah dimuat di routes/web.php dengan urutan yang benar
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'tenant' => \App\Http\Middleware\TenantMiddleware::class,
            'tenant.model.binding' => \App\Http\Middleware\TenantModelBindingMiddleware::class,
            'tenant.access' => \App\Http\Middleware\TenantAccessMiddleware::class,
            'tenant.domain' => \App\Http\Middleware\TenantDomainMiddleware::class,
            'can.adjust.grades' => \App\Http\Middleware\CanAdjustGrades::class,
            'grade.adjustment.access' => \App\Http\Middleware\CanAdjustGrades::class,
            'data.pokok.permission' => \App\Http\Middleware\CheckDataPokokPermission::class,
            'rate.limit.import.export' => \App\Http\Middleware\RateLimitImportExport::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
            'https' => \App\Http\Middleware\HttpsRedirect::class,
            'module.access' => \App\Http\Middleware\CheckModuleAccess::class,
        ]);

        // CRITICAL: Set priority untuk TenantMiddleware agar berjalan SEBELUM SubstituteBindings
        // Di Laravel 12, SubstituteBindings memiliki priority default yang lebih rendah
        // Kita perlu memastikan TenantMiddleware berjalan lebih awal untuk route yang memerlukan tenant
        $middleware->priority([
            \App\Http\Middleware\TenantMiddleware::class,
        ]);
        
        // Terapkan middleware keamanan global untuk web
        $middleware->web(append: [
            \App\Http\Middleware\HttpsRedirect::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
