<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantHealthMonitoring extends Model
{
    protected $fillable = [
        'tenant_id',
        'status',
        'response_time_ms',
        'error_count_24h',
        'request_count_24h',
        'error_rate',
        'cpu_usage_percent',
        'memory_usage_percent',
        'disk_usage_percent',
        'database_size_mb',
        'last_successful_request_at',
        'last_error_at',
        'uptime_percentage_24h',
        'has_active_alerts',
        'active_alerts',
        'last_checked_at',
        'notes',
    ];

    protected $casts = [
        'active_alerts' => 'array',
        'last_successful_request_at' => 'datetime',
        'last_error_at' => 'datetime',
        'last_checked_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns this health monitoring
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if tenant is healthy
     */
    public function isHealthy(): bool
    {
        return $this->status === 'healthy';
    }

    /**
     * Check if tenant has warnings
     */
    public function hasWarnings(): bool
    {
        return $this->status === 'warning';
    }

    /**
     * Check if tenant is critical
     */
    public function isCritical(): bool
    {
        return $this->status === 'critical';
    }

    /**
     * Add an alert
     */
    public function addAlert(string $type, string $message, string $severity = 'warning'): void
    {
        $alerts = $this->active_alerts ?? [];
        $alerts[] = [
            'type' => $type,
            'message' => $message,
            'severity' => $severity,
            'created_at' => now()->toDateTimeString(),
        ];
        
        $this->update([
            'active_alerts' => $alerts,
            'has_active_alerts' => true,
        ]);
    }

    /**
     * Clear all alerts
     */
    public function clearAlerts(): void
    {
        $this->update([
            'active_alerts' => [],
            'has_active_alerts' => false,
        ]);
    }

    /**
     * Update health status based on metrics
     */
    public function updateHealthStatus(): void
    {
        $status = 'healthy';
        
        // Check error rate
        if ($this->error_rate > 10) {
            $status = 'critical';
        } elseif ($this->error_rate > 5) {
            $status = 'warning';
        }
        
        // Check response time
        if ($this->response_time_ms > 5000) {
            $status = $status === 'critical' ? 'critical' : 'warning';
        } elseif ($this->response_time_ms > 2000) {
            $status = $status === 'critical' ? 'critical' : 'warning';
        }
        
        // Check resource usage
        if ($this->cpu_usage_percent > 90 || $this->memory_usage_percent > 90 || $this->disk_usage_percent > 90) {
            $status = 'critical';
        } elseif ($this->cpu_usage_percent > 75 || $this->memory_usage_percent > 75 || $this->disk_usage_percent > 75) {
            $status = $status === 'critical' ? 'critical' : 'warning';
        }
        
        // Check uptime
        if ($this->uptime_percentage_24h < 95) {
            $status = 'critical';
        } elseif ($this->uptime_percentage_24h < 99) {
            $status = $status === 'critical' ? 'critical' : 'warning';
        }
        
        $this->update(['status' => $status]);
    }
}

