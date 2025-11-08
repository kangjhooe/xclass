<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 * 
 * Adds security headers to responses
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Content Security Policy
        $response->headers->set('Content-Security-Policy', 
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; " .
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; " .
            "img-src 'self' data: https:; " .
            "font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; " .
            "connect-src 'self' https:; " .
            "frame-ancestors 'none';"
        );

        // X-Frame-Options
        $response->headers->set('X-Frame-Options', 'DENY');

        // X-Content-Type-Options
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // X-XSS-Protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy
        $response->headers->set('Permissions-Policy', 
            'geolocation=(), ' .
            'microphone=(), ' .
            'camera=(), ' .
            'payment=(), ' .
            'usb=(), ' .
            'magnetometer=(), ' .
            'gyroscope=(), ' .
            'speaker=(), ' .
            'vibrate=(), ' .
            'fullscreen=(self), ' .
            'sync-xhr=()'
        );

        // Strict-Transport-Security (HTTPS only)
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Cache Control for sensitive pages
        if ($this->isSensitivePage($request)) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }

        // Remove server information
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }

    /**
     * Check if the current page is sensitive
     */
    protected function isSensitivePage(Request $request): bool
    {
        $sensitivePaths = [
            'login',
            'register',
            'password',
            'admin',
            'users',
            'settings',
            'profile',
        ];

        $path = $request->path();
        
        foreach ($sensitivePaths as $sensitivePath) {
            if (str_contains($path, $sensitivePath)) {
                return true;
            }
        }

        return false;
    }
}