<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Traits\HasAuditLog;

/**
 * MutasiSiswa Model
 * 
 * Handles student transfer between tenants
 */
class MutasiSiswa extends Model
{
    use HasFactory, HasAuditLog;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'mutasi_siswa';

    protected $fillable = [
        'student_id',
        'from_tenant_id',
        'to_tenant_id',
        'status',
        'reason',
        'rejection_reason',
        'processed_by',
        'processed_at',
        'student_data',
        'notes',
    ];

    protected $casts = [
        'student_data' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the student being transferred
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    /**
     * Get the source tenant
     */
    public function fromTenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'from_tenant_id');
    }

    /**
     * Get the destination tenant
     */
    public function toTenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'to_tenant_id');
    }

    /**
     * Get the user who processed the transfer
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope for pending transfers
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved transfers
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected transfers
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for completed transfers
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for transfers from specific tenant
     */
    public function scopeFromTenant($query, $tenantId)
    {
        return $query->where('from_tenant_id', $tenantId);
    }

    /**
     * Scope for transfers to specific tenant
     */
    public function scopeToTenant($query, $tenantId)
    {
        return $query->where('to_tenant_id', $tenantId);
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
            'completed' => 'Selesai',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            'completed' => 'info',
            default => 'secondary'
        };
    }

    /**
     * Check if transfer can be approved
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transfer can be rejected
     */
    public function canBeRejected(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transfer can be completed
     */
    public function canBeCompleted(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Get tenant ID for audit log
     */
    protected function getTenantId(): int
    {
        return $this->from_tenant_id;
    }
}