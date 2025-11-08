<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Multi-Tenant Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk sistem multi-tenant CLASS
    | Menggunakan NPSN sebagai tenant identifier
    |
    */

    'driver' => 'domain', // domain, subdomain, path

    'domain' => [
        'main' => env('APP_DOMAIN', 'class.app'),
        'admin' => env('ADMIN_DOMAIN', 'class.app'), // Super admin akses melalui class.app
    ],

    'tenant_identifier' => 'npsn', // NPSN sebagai identifier

    'database' => [
        'connection' => 'mysql',
        'prefix' => 'tenant_',
    ],

    'cache' => [
        'prefix' => 'tenant_',
        'ttl' => 3600, // 1 hour
    ],

    'middleware' => [
        'tenant' => \App\Http\Middleware\TenantMiddleware::class,
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ],

    'models' => [
        'tenant' => \App\Models\Core\Tenant::class,
        'user' => \App\Models\User::class,
    ],

    'routes' => [
        'admin' => [
            'prefix' => 'admin',
            'middleware' => ['web', 'auth', 'role:super_admin'],
        ],
        'tenant' => [
            'prefix' => '{tenant}',
            'middleware' => ['web', 'auth', 'tenant'],
        ],
    ],
];
