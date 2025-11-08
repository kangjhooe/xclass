<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rate Limiting Middleware for Import/Export Operations
 * 
 * Prevents abuse of import/export endpoints
 */
class RateLimitImportExport
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limit = '10', string $decay = '60'): Response
    {
        $key = 'import_export:' . auth()->id() . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, (int) $limit)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam ' . ceil($seconds / 60) . ' menit.',
                'retry_after' => $seconds,
            ], 429)
                ->header('Retry-After', $seconds)
                ->header('X-RateLimit-Limit', $limit)
                ->header('X-RateLimit-Remaining', 0);
        }

        RateLimiter::hit($key, (int) $decay);

        $response = $next($request);

        $remaining = RateLimiter::remaining($key, (int) $limit);

        return $response->header('X-RateLimit-Limit', $limit)
            ->header('X-RateLimit-Remaining', $remaining);

    }
}
