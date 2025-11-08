<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;

class TenantFeaturePivot extends Model
{
    protected $table = 'tenant_feature_pivot';

    protected $fillable = [
        'tenant_id',
        'feature_name',
        'is_active',
        'settings',
        'activated_at',
        'deactivated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns this feature pivot
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if feature is currently active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get feature setting value
     */
    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Scope for active features
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

