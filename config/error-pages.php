<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Error Pages Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for custom error pages.
    | You can customize the error pages for different HTTP status codes.
    |
    */

    'pages' => [
        401 => 'errors.401',
        403 => 'errors.403',
        404 => 'errors.404',
        419 => 'errors.419',
        429 => 'errors.429',
        500 => 'errors.500',
        502 => 'errors.502',
        503 => 'errors.503',
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode
    |--------------------------------------------------------------------------
    |
    | Configuration for maintenance mode error page.
    |
    */
    'maintenance' => [
        'view' => 'errors.503-maintenance',
        'message' => 'Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Error Page Settings
    |--------------------------------------------------------------------------
    |
    | General settings for error pages.
    |
    */
    'settings' => [
        'show_stack_trace' => env('APP_DEBUG', false),
        'contact_email' => env('MAIL_FROM_ADDRESS', 'admin@class.com'),
        'support_phone' => env('SUPPORT_PHONE', '+62-xxx-xxx-xxxx'),
    ],
];
