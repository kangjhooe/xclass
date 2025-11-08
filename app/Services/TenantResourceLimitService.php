<?php

namespace App\Services;

use App\Models\Core\Tenant;
use App\Models\Core\TenantResourceLimit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TenantResourceLimitService
{
    /**
     * Initialize resource limits for a tenant
     */
    public function initializeLimits(Tenant $tenant, array $limits = []): TenantResourceLimit
    {
        $defaultLimits = [
            'max_storage_mb' => 1024, // 1GB
            'max_users' => 100,
            'max_students' => null, // Unlimited by default
            'api_rate_limit_per_minute' => 60,
            'api_rate_limit_per_hour' => 1000,
            'max_database_size_mb' => 512,
        ];

        $limits = array_merge($defaultLimits, $limits);

        return TenantResourceLimit::updateOrCreate(
            ['tenant_id' => $tenant->id],
            array_merge($limits, [
                'current_storage_mb' => 0,
                'current_users' => 0,
                'current_students' => 0,
                'current_database_size_mb' => 0,
                'last_checked_at' => now(),
            ])
        );
    }

    /**
     * Update current resource usage
     */
    public function updateUsage(Tenant $tenant): void
    {
        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            $limit = $this->initializeLimits($tenant);
        }

        // Update user count
        $limit->current_users = $tenant->users()->count();

        // Update student count
        $limit->current_students = $tenant->students()->count();

        // Update storage usage (simplified - would need actual storage calculation)
        $limit->current_storage_mb = $this->calculateStorageUsage($tenant);

        // Update database size (simplified - would need actual DB size calculation)
        $limit->current_database_size_mb = $this->calculateDatabaseSize($tenant);

        $limit->last_checked_at = now();
        $limit->save();
    }

    /**
     * Calculate storage usage for tenant
     */
    protected function calculateStorageUsage(Tenant $tenant): int
    {
        // This is a simplified calculation
        // In production, you would calculate actual storage used by tenant files
        $storagePath = 'tenants/' . $tenant->npsn;
        
        if (Storage::exists($storagePath)) {
            $files = Storage::allFiles($storagePath);
            $totalSize = 0;
            foreach ($files as $file) {
                $totalSize += Storage::size($file);
            }
            return (int) ($totalSize / 1024 / 1024); // Convert to MB
        }
        
        return 0;
    }

    /**
     * Calculate database size for tenant
     */
    protected function calculateDatabaseSize(Tenant $tenant): float
    {
        // This is a simplified calculation
        // In production, you would calculate actual database size
        // For now, return a placeholder
        return 0;
    }

    /**
     * Check if tenant can add more users
     */
    public function canAddUser(Tenant $tenant): bool
    {
        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            return true; // No limit set
        }

        return !$limit->isUserLimitExceeded();
    }

    /**
     * Check if tenant can add more students
     */
    public function canAddStudent(Tenant $tenant): bool
    {
        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            return true; // No limit set
        }

        return !$limit->isStudentLimitExceeded();
    }

    /**
     * Check if tenant can upload more files
     */
    public function canUploadFile(Tenant $tenant, int $fileSizeMb): bool
    {
        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            return true; // No limit set
        }

        $newStorage = $limit->current_storage_mb + $fileSizeMb;
        return $newStorage < $limit->max_storage_mb;
    }
}

