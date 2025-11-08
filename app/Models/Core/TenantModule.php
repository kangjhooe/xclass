<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'module_key',
        'module_name',
        'is_enabled',
        'permissions',
        'settings',
        'expires_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'permissions' => 'array',
        'settings' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns this module access
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if module is currently active
     */
    public function isActive(): bool
    {
        if (!$this->is_enabled) {
            return false;
        }

        // Check if module has expired
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if tenant has specific permission for this module
     */
    public function hasPermission(string $permission): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions) || in_array('*', $permissions);
    }

    /**
     * Get module setting value
     */
    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set module setting value
     */
    public function setSetting(string $key, $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
    }

    /**
     * Add permission to module
     */
    public function addPermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
        }
    }

    /**
     * Remove permission from module
     */
    public function removePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_filter($permissions, fn($p) => $p !== $permission);
        $this->permissions = array_values($permissions);
    }

    /**
     * Scope for active modules
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
     * Scope for expired modules
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
