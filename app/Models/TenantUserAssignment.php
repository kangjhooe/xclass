<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Traits\HasAuditLog;

/**
 * TenantUserAssignment Model
 * 
 * Handles cross-tenant user assignments
 */
class TenantUserAssignment extends Model
{
    use HasFactory, HasAuditLog;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'role',
        'is_primary',
        'permissions',
        'assigned_at',
        'unassigned_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'permissions' => 'array',
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
        'is_active' => 'boolean',
        'is_primary' => 'boolean',
    ];

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class);
    }

    /**
     * Scope for active assignments
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for primary assignments
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope for specific role
     */
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for specific tenant
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope for specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get role label in Indonesian
     */
    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'teacher' => 'Guru',
            'staff' => 'Staf',
            'admin' => 'Admin',
            default => ucfirst($this->role)
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        if (!$this->is_active) {
            return 'Tidak Aktif';
        }

        if ($this->unassigned_at) {
            return 'Berakhir';
        }

        return 'Aktif';
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        if (!$this->is_active) {
            return 'danger';
        }

        if ($this->unassigned_at) {
            return 'warning';
        }

        return 'success';
    }

    /**
     * Check if assignment is active
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->unassigned_at;
    }

    /**
     * Check if assignment is primary
     */
    public function isPrimary(): bool
    {
        return $this->is_primary;
    }

    /**
     * Get tenant ID for audit log
     */
    protected function getTenantId(): int
    {
        return $this->tenant_id;
    }
}