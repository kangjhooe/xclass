<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SystemHealthController extends Controller
{
    /**
     * Display system health dashboard
     */
    public function index()
    {
        $health = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
            'memory' => $this->checkMemory(),
            'disk' => $this->checkDisk(),
            'services' => $this->checkServices(),
        ];

        $statistics = [
            'uptime' => $this->getUptime(),
            'total_requests' => $this->getTotalRequests(),
            'error_rate' => $this->getErrorRate(),
            'response_time' => $this->getAverageResponseTime(),
        ];

        return view('admin.system-health.index', compact('health', 'statistics'));
    }

    /**
     * Get health status as JSON (for AJAX)
     */
    public function status()
    {
        return response()->json([
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
            'memory' => $this->checkMemory(),
            'disk' => $this->checkDisk(),
            'services' => $this->checkServices(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Check database connection
     */
    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $responseTime = round((microtime(true) - $start) * 1000, 2);

            $status = 'healthy';
            $message = 'Database connection OK';
            
            // Check database size
            $dbSize = $this->getDatabaseSize();
            $connectionCount = $this->getConnectionCount();

            return [
                'status' => $status,
                'message' => $message,
                'response_time' => $responseTime . 'ms',
                'database_size' => $dbSize,
                'connections' => $connectionCount,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'response_time' => null,
                'database_size' => null,
                'connections' => null,
            ];
        }
    }

    /**
     * Check cache system
     */
    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'test', 60);
            $value = Cache::get($key);
            Cache::forget($key);

            if ($value === 'test') {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache system working correctly',
                ];
            }

            return [
                'status' => 'warning',
                'message' => 'Cache system may have issues',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Cache system error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check storage
     */
    private function checkStorage(): array
    {
        $path = storage_path();
        $freeSpace = disk_free_space($path);
        $totalSpace = disk_total_space($path);
        $usedSpace = $totalSpace - $freeSpace;
        $usedPercentage = round(($usedSpace / $totalSpace) * 100, 2);

        $status = 'healthy';
        if ($usedPercentage > 90) {
            $status = 'critical';
        } elseif ($usedPercentage > 75) {
            $status = 'warning';
        }

        return [
            'status' => $status,
            'message' => "Storage used: {$usedPercentage}%",
            'free_space' => $this->formatBytes($freeSpace),
            'total_space' => $this->formatBytes($totalSpace),
            'used_space' => $this->formatBytes($usedSpace),
            'used_percentage' => $usedPercentage,
        ];
    }

    /**
     * Check queue system
     */
    private function checkQueue(): array
    {
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            $pendingJobs = DB::table('jobs')->count();

            $status = 'healthy';
            if ($failedJobs > 100) {
                $status = 'warning';
            } elseif ($failedJobs > 500) {
                $status = 'critical';
            }

            return [
                'status' => $status,
                'message' => "Queue system operational",
                'pending_jobs' => $pendingJobs,
                'failed_jobs' => $failedJobs,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Queue check failed: ' . $e->getMessage(),
                'pending_jobs' => 0,
                'failed_jobs' => 0,
            ];
        }
    }

    /**
     * Check memory usage
     */
    private function checkMemory(): array
    {
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = $this->convertToBytes(ini_get('memory_limit'));
        $memoryPercentage = round(($memoryUsage / $memoryLimit) * 100, 2);

        $status = 'healthy';
        if ($memoryPercentage > 90) {
            $status = 'critical';
        } elseif ($memoryPercentage > 75) {
            $status = 'warning';
        }

        return [
            'status' => $status,
            'message' => "Memory used: {$memoryPercentage}%",
            'used' => $this->formatBytes($memoryUsage),
            'limit' => $this->formatBytes($memoryLimit),
            'percentage' => $memoryPercentage,
        ];
    }

    /**
     * Check disk space
     */
    private function checkDisk(): array
    {
        $path = base_path();
        $freeSpace = disk_free_space($path);
        $totalSpace = disk_total_space($path);
        $usedSpace = $totalSpace - $freeSpace;
        $usedPercentage = round(($usedSpace / $totalSpace) * 100, 2);

        $status = 'healthy';
        if ($usedPercentage > 90) {
            $status = 'critical';
        } elseif ($usedPercentage > 75) {
            $status = 'warning';
        }

        return [
            'status' => $status,
            'message' => "Disk used: {$usedPercentage}%",
            'free_space' => $this->formatBytes($freeSpace),
            'total_space' => $this->formatBytes($totalSpace),
            'used_space' => $this->formatBytes($usedSpace),
            'used_percentage' => $usedPercentage,
        ];
    }

    /**
     * Check external services
     */
    private function checkServices(): array
    {
        $services = [];

        // Check mail service
        try {
            $config = config('mail');
            $services['mail'] = [
                'status' => 'healthy',
                'message' => 'Mail service configured',
                'driver' => $config['default'] ?? 'unknown',
            ];
        } catch (\Exception $e) {
            $services['mail'] = [
                'status' => 'error',
                'message' => 'Mail service error',
            ];
        }

        return $services;
    }

    /**
     * Get system uptime
     */
    private function getUptime(): string
    {
        // For Linux/Unix systems
        if (PHP_OS_FAMILY !== 'Windows') {
            $uptime = shell_exec('uptime -p');
            return $uptime ? trim($uptime) : 'Unknown';
        }

        // For Windows, return server start time approximation
        return 'Server running since ' . Carbon::parse(filemtime(base_path()))->diffForHumans();
    }

    /**
     * Get total requests (approximate from logs)
     */
    private function getTotalRequests(): int
    {
        // This is a placeholder - implement actual request counting
        return Cache::remember('total_requests', 3600, function () {
            return 0; // Placeholder
        });
    }

    /**
     * Get error rate
     */
    private function getErrorRate(): float
    {
        try {
            $totalLogs = SystemLog::where('created_at', '>=', now()->subDays(7))->count();
            $errorLogs = SystemLog::where('created_at', '>=', now()->subDays(7))
                ->whereIn('level', ['error', 'critical'])
                ->count();

            if ($totalLogs === 0) {
                return 0;
            }

            return round(($errorLogs / $totalLogs) * 100, 2);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get average response time
     */
    private function getAverageResponseTime(): string
    {
        // Placeholder - implement actual response time tracking
        return '~150ms';
    }

    /**
     * Get database size
     */
    private function getDatabaseSize(): string
    {
        try {
            $database = config('database.connections.mysql.database');
            $size = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema = ?", [$database]);
            
            if (!empty($size) && isset($size[0]->size_mb)) {
                return $size[0]->size_mb . ' MB';
            }
        } catch (\Exception $e) {
            // Ignore
        }

        return 'Unknown';
    }

    /**
     * Get database connection count
     */
    private function getConnectionCount(): int
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            if (!empty($result) && isset($result[0]->Value)) {
                return (int) $result[0]->Value;
            }
        } catch (\Exception $e) {
            // Ignore
        }

        return 0;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Convert PHP ini size to bytes
     */
    private function convertToBytes($value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;

        switch ($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }

        return $value;
    }
}

