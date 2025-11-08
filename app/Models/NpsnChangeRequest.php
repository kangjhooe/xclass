<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NpsnChangeRequest extends Model
{
    protected $fillable = [
        'tenant_id',
        'current_npsn',
        'requested_npsn',
        'reason',
        'status',
        'requested_by',
        'approved_by',
        'response_message',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class);
    }

    /**
     * Get the user who requested the change
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the super admin who approved/rejected
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
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Retrieve the model for route model binding
     * For tenant routes, ensure tenant scope
     * For admin routes, no scope needed
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?: $this->getRouteKeyName();
        
        // Check if we're in a tenant context (tenant route)
        try {
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            // If tenant is available, scope by tenant
            if ($tenant) {
                return $this->where($field, $value)
                    ->where('tenant_id', $tenant->id)
                    ->firstOrFail();
            }
        } catch (\Exception $e) {
            // If tenant service is not available, continue without tenant scope
            // This is for admin routes
        }
        
        // For admin routes or if tenant is not available, no tenant scope
        return $this->where($field, $value)->firstOrFail();
    }
}
