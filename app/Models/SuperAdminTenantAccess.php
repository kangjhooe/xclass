<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuperAdminTenantAccess extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'status',
        'request_reason',
        'response_message',
        'approved_by',
        'approved_at',
        'expires_at',
        'permissions',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
        'permissions' => 'array',
    ];

    /**
     * Get the super admin user
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
     * Get the admin who approved this access
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected requests
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for active (approved and not expired) accesses
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'approved')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Check if access is active
     */
    public function isActive(): bool
    {
        return $this->status === 'approved' 
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Check if access is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Get status label in Indonesian
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu Persetujuan',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'revoked' => 'Dicabut',
            default => 'Tidak Diketahui',
        };
    }

    /**
     * Get status badge color
     */
    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            'revoked' => 'secondary',
            default => 'secondary',
        };
    }
}