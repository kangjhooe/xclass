<?php

namespace App\Helpers;

use Illuminate\Http\Request;

class ErrorPageHelper
{
    /**
     * Get the appropriate error view for the given status code.
     *
     * @param int $statusCode
     * @param Request|null $request
     * @return string
     */
    public static function getErrorView(int $statusCode, ?Request $request = null): string
    {
        $errorPages = config('error-pages.pages', []);
        
        // Check for special cases
        if ($statusCode === 404 && $request && ($request->has('search') || $request->has('q'))) {
            return 'errors.404-search';
        }
        
        if ($statusCode === 503 && app()->isDownForMaintenance()) {
            return config('error-pages.maintenance.view', 'errors.503-maintenance');
        }
        
        return $errorPages[$statusCode] ?? 'errors.error';
    }
    
    /**
     * Get error information for display.
     *
     * @param int $statusCode
     * @return array
     */
    public static function getErrorInfo(int $statusCode): array
    {
        $errorMessages = [
            400 => ['title' => 'Bad Request', 'message' => 'Permintaan tidak valid.'],
            401 => ['title' => 'Unauthorized', 'message' => 'Anda perlu masuk terlebih dahulu.'],
            403 => ['title' => 'Forbidden', 'message' => 'Anda tidak memiliki izin untuk mengakses halaman ini.'],
            404 => ['title' => 'Not Found', 'message' => 'Halaman yang Anda cari tidak ditemukan.'],
            405 => ['title' => 'Method Not Allowed', 'message' => 'Metode HTTP tidak diizinkan.'],
            408 => ['title' => 'Request Timeout', 'message' => 'Permintaan telah kedaluwarsa.'],
            419 => ['title' => 'Page Expired', 'message' => 'Halaman telah kedaluwarsa.'],
            429 => ['title' => 'Too Many Requests', 'message' => 'Terlalu banyak permintaan.'],
            500 => ['title' => 'Internal Server Error', 'message' => 'Terjadi kesalahan pada server.'],
            502 => ['title' => 'Bad Gateway', 'message' => 'Server menerima respons yang tidak valid.'],
            503 => ['title' => 'Service Unavailable', 'message' => 'Layanan tidak tersedia.'],
        ];
        
        return $errorMessages[$statusCode] ?? [
            'title' => 'Error',
            'message' => 'Terjadi kesalahan yang tidak terduga.'
        ];
    }
    
    /**
     * Get contact information for error pages.
     *
     * @return array
     */
    public static function getContactInfo(): array
    {
        return [
            'email' => config('error-pages.settings.contact_email', 'admin@class.com'),
            'phone' => config('error-pages.settings.support_phone', '+62-xxx-xxx-xxxx'),
            'show_stack_trace' => config('error-pages.settings.show_stack_trace', false),
        ];
    }
    
    /**
     * Check if the request is from an API.
     *
     * @param Request $request
     * @return bool
     */
    public static function isApiRequest(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }
    
    /**
     * Get appropriate response for API requests.
     *
     * @param int $statusCode
     * @param string $message
     * @return array
     */
    public static function getApiErrorResponse(int $statusCode, string $message): array
    {
        return [
            'error' => true,
            'status_code' => $statusCode,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];
    }
}
