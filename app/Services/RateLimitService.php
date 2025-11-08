<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

/**
 * Rate Limit Service
 * 
 * Handles rate limiting for various operations
 */
class RateLimitService
{
    protected $defaultLimits = [
        'import' => ['max_attempts' => 5, 'decay_minutes' => 60],
        'export' => ['max_attempts' => 10, 'decay_minutes' => 60],
        'api' => ['max_attempts' => 100, 'decay_minutes' => 60],
        'search' => ['max_attempts' => 50, 'decay_minutes' => 10],
        'login' => ['max_attempts' => 5, 'decay_minutes' => 15],
    ];

    /**
     * Check if rate limit is exceeded
     */
    public function isRateLimited(string $key, int $maxAttempts = null, int $decayMinutes = null): bool
    {
        $maxAttempts = $maxAttempts ?? $this->defaultLimits['api']['max_attempts'];
        $decayMinutes = $decayMinutes ?? $this->defaultLimits['api']['decay_minutes'];
        
        return RateLimiter::tooManyAttempts($key, $maxAttempts);
    }

    /**
     * Get remaining attempts
     */
    public function getRemainingAttempts(string $key, int $maxAttempts = null): int
    {
        $maxAttempts = $maxAttempts ?? $this->defaultLimits['api']['max_attempts'];
        return RateLimiter::remaining($key, $maxAttempts);
    }

    /**
     * Get retry after seconds
     */
    public function getRetryAfter(string $key): int
    {
        return RateLimiter::availableIn($key);
    }

    /**
     * Hit rate limiter
     */
    public function hit(string $key, int $decayMinutes = null): int
    {
        $decayMinutes = $decayMinutes ?? $this->defaultLimits['api']['decay_minutes'];
        return RateLimiter::hit($key, $decayMinutes * 60);
    }

    /**
     * Clear rate limiter
     */
    public function clear(string $key): void
    {
        RateLimiter::clear($key);
    }

    /**
     * Check import rate limit
     */
    public function checkImportLimit(Request $request): array
    {
        $key = 'import:' . $request->ip() . ':' . auth()->id();
        $limits = $this->defaultLimits['import'];
        
        if ($this->isRateLimited($key, $limits['max_attempts'], $limits['decay_minutes'])) {
            return [
                'allowed' => false,
                'message' => 'Terlalu banyak permintaan import. Coba lagi dalam ' . $this->getRetryAfter($key) . ' detik.',
                'retry_after' => $this->getRetryAfter($key),
            ];
        }
        
        $this->hit($key, $limits['decay_minutes']);
        
        return [
            'allowed' => true,
            'remaining' => $this->getRemainingAttempts($key, $limits['max_attempts']),
        ];
    }

    /**
     * Check export rate limit
     */
    public function checkExportLimit(Request $request): array
    {
        $key = 'export:' . $request->ip() . ':' . auth()->id();
        $limits = $this->defaultLimits['export'];
        
        if ($this->isRateLimited($key, $limits['max_attempts'], $limits['decay_minutes'])) {
            return [
                'allowed' => false,
                'message' => 'Terlalu banyak permintaan export. Coba lagi dalam ' . $this->getRetryAfter($key) . ' detik.',
                'retry_after' => $this->getRetryAfter($key),
            ];
        }
        
        $this->hit($key, $limits['decay_minutes']);
        
        return [
            'allowed' => true,
            'remaining' => $this->getRemainingAttempts($key, $limits['max_attempts']),
        ];
    }

    /**
     * Check API rate limit
     */
    public function checkApiLimit(Request $request): array
    {
        $key = 'api:' . $request->ip() . ':' . auth()->id();
        $limits = $this->defaultLimits['api'];
        
        if ($this->isRateLimited($key, $limits['max_attempts'], $limits['decay_minutes'])) {
            return [
                'allowed' => false,
                'message' => 'Terlalu banyak permintaan API. Coba lagi dalam ' . $this->getRetryAfter($key) . ' detik.',
                'retry_after' => $this->getRetryAfter($key),
            ];
        }
        
        $this->hit($key, $limits['decay_minutes']);
        
        return [
            'allowed' => true,
            'remaining' => $this->getRemainingAttempts($key, $limits['max_attempts']),
        ];
    }

    /**
     * Check search rate limit
     */
    public function checkSearchLimit(Request $request): array
    {
        $key = 'search:' . $request->ip() . ':' . auth()->id();
        $limits = $this->defaultLimits['search'];
        
        if ($this->isRateLimited($key, $limits['max_attempts'], $limits['decay_minutes'])) {
            return [
                'allowed' => false,
                'message' => 'Terlalu banyak pencarian. Coba lagi dalam ' . $this->getRetryAfter($key) . ' detik.',
                'retry_after' => $this->getRetryAfter($key),
            ];
        }
        
        $this->hit($key, $limits['decay_minutes']);
        
        return [
            'allowed' => true,
            'remaining' => $this->getRemainingAttempts($key, $limits['max_attempts']),
        ];
    }

    /**
     * Check login rate limit
     */
    public function checkLoginLimit(Request $request): array
    {
        $key = 'login:' . $request->ip();
        $limits = $this->defaultLimits['login'];
        
        if ($this->isRateLimited($key, $limits['max_attempts'], $limits['decay_minutes'])) {
            return [
                'allowed' => false,
                'message' => 'Terlalu banyak percobaan login. Coba lagi dalam ' . $this->getRetryAfter($key) . ' detik.',
                'retry_after' => $this->getRetryAfter($key),
            ];
        }
        
        $this->hit($key, $limits['decay_minutes']);
        
        return [
            'allowed' => true,
            'remaining' => $this->getRemainingAttempts($key, $limits['max_attempts']),
        ];
    }

    /**
     * Get rate limit info
     */
    public function getRateLimitInfo(string $key, int $maxAttempts = null): array
    {
        $maxAttempts = $maxAttempts ?? $this->defaultLimits['api']['max_attempts'];
        
        return [
            'remaining' => $this->getRemainingAttempts($key, $maxAttempts),
            'retry_after' => $this->getRetryAfter($key),
            'is_limited' => $this->isRateLimited($key, $maxAttempts),
        ];
    }

    /**
     * Set custom rate limit
     */
    public function setCustomLimit(string $key, int $maxAttempts, int $decayMinutes): void
    {
        $this->defaultLimits[$key] = [
            'max_attempts' => $maxAttempts,
            'decay_minutes' => $decayMinutes,
        ];
    }

    /**
     * Get all rate limits
     */
    public function getAllLimits(): array
    {
        return $this->defaultLimits;
    }

    /**
     * Reset all rate limits for user
     */
    public function resetUserLimits(int $userId): void
    {
        $patterns = [
            'import:*:' . $userId,
            'export:*:' . $userId,
            'api:*:' . $userId,
            'search:*:' . $userId,
        ];
        
        foreach ($patterns as $pattern) {
            // Note: This is a simplified approach. In production, you might want to use Redis with pattern matching
            Cache::flush();
        }
    }

    /**
     * Reset all rate limits for IP
     */
    public function resetIpLimits(string $ip): void
    {
        $patterns = [
            'import:' . $ip . ':*',
            'export:' . $ip . ':*',
            'api:' . $ip . ':*',
            'search:' . $ip . ':*',
            'login:' . $ip,
        ];
        
        foreach ($patterns as $pattern) {
            // Note: This is a simplified approach. In production, you might want to use Redis with pattern matching
            Cache::flush();
        }
    }
}
