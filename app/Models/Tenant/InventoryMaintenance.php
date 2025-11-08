<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class InventoryMaintenance extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'item_id',
        'maintenance_type',
        'maintenance_date',
        'description',
        'cost',
        'technician',
        'technician_contact',
        'status',
        'completion_date',
        'notes',
        'next_maintenance_date',
        'created_by',
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'completion_date' => 'date',
        'next_maintenance_date' => 'date',
        'cost' => 'decimal:2',
    ];

    const TYPE_PREVENTIVE = 'preventive';
    const TYPE_CORRECTIVE = 'corrective';
    const TYPE_EMERGENCY = 'emergency';
    const TYPE_UPGRADE = 'upgrade';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the maintenance
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the item being maintained
     */
    public function item()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who created the maintenance
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('maintenance_type', $type);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for overdue maintenance
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('maintenance_date', '<', now()->toDateString());
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->maintenance_type) {
            self::TYPE_PREVENTIVE => 'Pencegahan',
            self::TYPE_CORRECTIVE => 'Perbaikan',
            self::TYPE_EMERGENCY => 'Darurat',
            self::TYPE_UPGRADE => 'Upgrade',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'Terjadwal',
            self::STATUS_IN_PROGRESS => 'Sedang Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'info',
            self::STATUS_IN_PROGRESS => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Get type color for display
     */
    public function getTypeColorAttribute()
    {
        return match($this->maintenance_type) {
            self::TYPE_PREVENTIVE => 'primary',
            self::TYPE_CORRECTIVE => 'warning',
            self::TYPE_EMERGENCY => 'danger',
            self::TYPE_UPGRADE => 'info',
            default => 'secondary'
        };
    }

    /**
     * Check if maintenance is overdue
     */
    public function isOverdue()
    {
        return $this->status === self::STATUS_SCHEDULED && 
               $this->maintenance_date < now()->toDateString();
    }

    /**
     * Check if maintenance is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get formatted cost
     */
    public function getFormattedCostAttribute()
    {
        return 'Rp ' . number_format($this->cost, 0, ',', '.');
    }

    /**
     * Mark maintenance as in progress
     */
    public function markInProgress()
    {
        $this->update(['status' => self::STATUS_IN_PROGRESS]);
    }

    /**
     * Mark maintenance as completed
     */
    public function markCompleted($completionDate = null, $notes = null)
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completion_date' => $completionDate ?? now()->toDateString(),
            'notes' => $notes,
        ]);

        // Update item's next maintenance date if provided
        if ($this->next_maintenance_date) {
            $this->item->update(['next_maintenance' => $this->next_maintenance_date]);
        }
    }

    /**
     * Cancel maintenance
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }
}
