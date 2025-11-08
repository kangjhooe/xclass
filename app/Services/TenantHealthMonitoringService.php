<?php

namespace App\Services;

use App\Models\Core\Tenant;
use App\Models\Core\TenantHealthMonitoring;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantHealthMonitoringService
{
    /**
     * Initialize health monitoring for a tenant
     */
    public function initializeMonitoring(Tenant $tenant): TenantHealthMonitoring
    {
        return TenantHealthMonitoring::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'status' => 'unknown',
                'error_count_24h' => 0,
                'request_count_24h' => 0,
                'error_rate' => 0,
                'uptime_percentage_24h' => 100,
                'has_active_alerts' => false,
                'active_alerts' => [],
                'last_checked_at' => now(),
            ]
        );
    }

    /**
     * Update health metrics for a tenant
     */
    public function updateHealthMetrics(Tenant $tenant): void
    {
        $monitoring = $tenant->healthMonitoring;
        
        if (!$monitoring) {
            $monitoring = $this->initializeMonitoring($tenant);
        }

        // Calculate error rate from activity logs (last 24 hours)
        $errorCount = $tenant->activityLogs()
            ->where('action', 'error')
            ->where('logged_at', '>=', now()->subDay())
            ->count();

        $requestCount = $tenant->activityLogs()
            ->where('logged_at', '>=', now()->subDay())
            ->count();

        $errorRate = $requestCount > 0 ? ($errorCount / $requestCount) * 100 : 0;

        // Get last successful request
        $lastSuccessfulRequest = $tenant->activityLogs()
            ->where('action', '!=', 'error')
            ->latest('logged_at')
            ->first();

        // Get last error
        $lastError = $tenant->activityLogs()
            ->where('action', 'error')
            ->latest('logged_at')
            ->first();

        // Calculate uptime (simplified)
        $uptimePercentage = $this->calculateUptime($tenant);

        // Update metrics
        $monitoring->update([
            'error_count_24h' => $errorCount,
            'request_count_24h' => $requestCount,
            'error_rate' => round($errorRate, 2),
            'last_successful_request_at' => $lastSuccessfulRequest?->logged_at,
            'last_error_at' => $lastError?->logged_at,
            'uptime_percentage_24h' => $uptimePercentage,
            'last_checked_at' => now(),
        ]);

        // Update health status
        $monitoring->updateHealthStatus();
    }

    /**
     * Calculate uptime percentage (simplified)
     */
    protected function calculateUptime(Tenant $tenant): int
    {
        // This is a simplified calculation
        // In production, you would track actual uptime/downtime
        $totalRequests = $tenant->activityLogs()
            ->where('logged_at', '>=', now()->subDay())
            ->count();

        $errorRequests = $tenant->activityLogs()
            ->where('action', 'error')
            ->where('logged_at', '>=', now()->subDay())
            ->count();

        if ($totalRequests === 0) {
            return 100; // No requests = assume healthy
        }

        $uptimePercentage = (($totalRequests - $errorRequests) / $totalRequests) * 100;
        return (int) round($uptimePercentage);
    }

    /**
     * Record a successful request
     */
    public function recordSuccess(Tenant $tenant): void
    {
        $monitoring = $tenant->healthMonitoring;
        
        if (!$monitoring) {
            $monitoring = $this->initializeMonitoring($tenant);
        }

        $monitoring->update([
            'last_successful_request_at' => now(),
            'last_checked_at' => now(),
        ]);
    }

    /**
     * Record an error
     */
    public function recordError(Tenant $tenant, string $errorType, string $message): void
    {
        $monitoring = $tenant->healthMonitoring;
        
        if (!$monitoring) {
            $monitoring = $this->initializeMonitoring($tenant);
        }

        $monitoring->addAlert($errorType, $message, 'error');
        $monitoring->update([
            'last_error_at' => now(),
            'last_checked_at' => now(),
        ]);

        // Update health status
        $monitoring->updateHealthStatus();
    }

    /**
     * Get health status for all tenants
     */
    public function getAllTenantsHealth()
    {
        return TenantHealthMonitoring::with('tenant')
            ->orderBy('status')
            ->get()
            ->groupBy('status');
    }

    /**
     * Check and update health for all tenants
     */
    public function checkAllTenants(): void
    {
        $tenants = Tenant::where('is_active', true)->get();
        
        foreach ($tenants as $tenant) {
            try {
                $this->updateHealthMetrics($tenant);
            } catch (\Exception $e) {
                Log::error("Failed to update health metrics for tenant {$tenant->id}: " . $e->getMessage());
            }
        }
    }
}

