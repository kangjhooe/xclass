<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'feature_key',
        'feature_name',
        'is_enabled',
        'settings',
        'expires_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'settings' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns this feature access
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
        if (!$this->is_enabled) {
            return false;
        }

        // Check if feature has expired
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Get feature setting value
     */
    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set feature setting value
     */
    public function setSetting(string $key, $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
    }

    /**
     * Scope for active features
     */
    public function scopeActive($query)
    {
        return $query->where('is_enabled', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope for expired features
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
