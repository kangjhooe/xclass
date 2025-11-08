<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Services\TenantService;
use App\Core\Services\LoggingService;
use App\Core\Services\CacheService;
use Illuminate\Support\Facades\DB;

class OptimizeTenantMiddleware
{
    protected $tenantService;
    protected $loggingService;
    protected $cacheService;

    public function __construct(
        TenantService $tenantService,
        LoggingService $loggingService,
        CacheService $cacheService
    ) {
        $this->tenantService = $tenantService;
        $this->loggingService = $loggingService;
        $this->cacheService = $cacheService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);

        // Skip optimization for admin routes
        if ($request->is('admin*') || $request->is('login') || $request->is('register') || $request->is('/')) {
            return $next($request);
        }

        try {
            // Optimize database queries
            $this->optimizeDatabaseQueries();

            // Preload tenant data
            $this->preloadTenantData();

            // Set up caching
            $this->setupCaching();

            // Log performance metrics
            $this->logPerformanceMetrics($request, $startTime, $startMemory);

        } catch (\Exception $e) {
            $this->loggingService->logError('Tenant optimization failed', [
                'error' => $e->getMessage(),
                'request' => $request->url(),
            ], $e);
        }

        $response = $next($request);

        // Log response metrics
        $this->logResponseMetrics($request, $response, $startTime, $startMemory);

        return $response;
    }

    /**
     * Optimize database queries
     */
    protected function optimizeDatabaseQueries(): void
    {
        // Enable query logging for performance monitoring
        if (config('app.debug')) {
            DB::enableQueryLog();
        }

        // Set database connection optimizations
        DB::connection()->getPdo()->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
        DB::connection()->getPdo()->setAttribute(\PDO::ATTR_STRINGIFY_FETCHES, false);
    }

    /**
     * Preload tenant data
     */
    protected function preloadTenantData(): void
    {
        $tenant = $this->tenantService->getTenant();
        
        if (!$tenant) {
            return;
        }

        // Cache tenant statistics
        $this->cacheService->cacheTenantStats();

        // Preload common data
        $this->preloadCommonData($tenant);
    }

    /**
     * Preload common data
     */
    protected function preloadCommonData($tenant): void
    {
        // Cache user data for current user
        if (auth()->check()) {
            $this->cacheService->cacheUserData(auth()->id());
        }

        // Cache class data if needed
        if (request()->route('class')) {
            $this->cacheService->cacheClassData(request()->route('class'));
        }

        // Cache subject data if needed
        if (request()->route('subject')) {
            $this->cacheService->cacheSubjectData(request()->route('subject'));
        }
    }

    /**
     * Set up caching
     */
    protected function setupCaching(): void
    {
        // Set cache headers for static content
        if (request()->is('css/*') || request()->is('js/*') || request()->is('images/*')) {
            // This would typically set cache headers
            // For now, we'll just log the action
            $this->loggingService->logActivity('cache_setup', [
                'type' => 'static_content',
                'url' => request()->url(),
            ]);
        }
    }

    /**
     * Log performance metrics
     */
    protected function logPerformanceMetrics(Request $request, float $startTime, int $startMemory): void
    {
        $executionTime = microtime(true) - $startTime;
        $memoryUsage = memory_get_usage(true) - $startMemory;

        $this->loggingService->logPerformance('request_processing', $executionTime, [
            'url' => $request->url(),
            'method' => $request->method(),
            'memory_usage' => $memoryUsage,
            'peak_memory' => memory_get_peak_usage(true),
        ]);
    }

    /**
     * Log response metrics
     */
    protected function logResponseMetrics(Request $request, Response $response, float $startTime, int $startMemory): void
    {
        $totalTime = microtime(true) - $startTime;
        $totalMemory = memory_get_usage(true) - $startMemory;

        $this->loggingService->logPerformance('response_generated', $totalTime, [
            'url' => $request->url(),
            'method' => $request->method(),
            'status_code' => $response->getStatusCode(),
            'memory_usage' => $totalMemory,
            'peak_memory' => memory_get_peak_usage(true),
            'response_size' => strlen($response->getContent()),
        ]);
    }

    /**
     * Get query performance metrics
     */
    protected function getQueryMetrics(): array
    {
        if (!config('app.debug')) {
            return [];
        }

        $queries = DB::getQueryLog();
        
        return [
            'total_queries' => count($queries),
            'total_time' => array_sum(array_column($queries, 'time')),
            'slowest_query' => $this->getSlowestQuery($queries),
            'duplicate_queries' => $this->getDuplicateQueries($queries),
        ];
    }

    /**
     * Get slowest query
     */
    protected function getSlowestQuery(array $queries): ?array
    {
        if (empty($queries)) {
            return null;
        }

        $slowest = array_reduce($queries, function($carry, $query) {
            return $carry === null || $query['time'] > $carry['time'] ? $query : $carry;
        });

        return $slowest;
    }

    /**
     * Get duplicate queries
     */
    protected function getDuplicateQueries(array $queries): array
    {
        $queryCounts = [];
        
        foreach ($queries as $query) {
            $sql = $query['query'];
            $queryCounts[$sql] = ($queryCounts[$sql] ?? 0) + 1;
        }

        return array_filter($queryCounts, function($count) {
            return $count > 1;
        });
    }
}
