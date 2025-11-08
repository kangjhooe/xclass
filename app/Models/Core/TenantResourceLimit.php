<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantResourceLimit extends Model
{
    protected $fillable = [
        'tenant_id',
        'max_storage_mb',
        'current_storage_mb',
        'max_users',
        'current_users',
        'max_students',
        'current_students',
        'api_rate_limit_per_minute',
        'api_rate_limit_per_hour',
        'max_database_size_mb',
        'current_database_size_mb',
        'last_checked_at',
    ];

    protected $casts = [
        'last_checked_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns this resource limit
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if storage limit is exceeded
     */
    public function isStorageExceeded(): bool
    {
        return $this->current_storage_mb >= $this->max_storage_mb;
    }

    /**
     * Check if user limit is exceeded
     */
    public function isUserLimitExceeded(): bool
    {
        return $this->current_users >= $this->max_users;
    }

    /**
     * Check if student limit is exceeded
     */
    public function isStudentLimitExceeded(): bool
    {
        if ($this->max_students === null) {
            return false; // Unlimited
        }
        return $this->current_students >= $this->max_students;
    }

    /**
     * Check if database size limit is exceeded
     */
    public function isDatabaseSizeExceeded(): bool
    {
        return $this->current_database_size_mb >= $this->max_database_size_mb;
    }

    /**
     * Get storage usage percentage
     */
    public function getStorageUsagePercentage(): float
    {
        if ($this->max_storage_mb == 0) {
            return 0;
        }
        return ($this->current_storage_mb / $this->max_storage_mb) * 100;
    }

    /**
     * Get user usage percentage
     */
    public function getUserUsagePercentage(): float
    {
        if ($this->max_users == 0) {
            return 0;
        }
        return ($this->current_users / $this->max_users) * 100;
    }

    /**
     * Get student usage percentage
     */
    public function getStudentUsagePercentage(): ?float
    {
        if ($this->max_students === null) {
            return null; // Unlimited
        }
        if ($this->max_students == 0) {
            return 0;
        }
        return ($this->current_students / $this->max_students) * 100;
    }
}

