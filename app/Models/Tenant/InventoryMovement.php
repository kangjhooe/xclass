<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class InventoryMovement extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'item_id',
        'type',
        'quantity',
        'notes',
        'reference_number',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    const TYPE_IN = 'in';
    const TYPE_OUT = 'out';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_TRANSFER = 'transfer';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_DISPOSAL = 'disposal';

    /**
     * Get the tenant that owns the movement
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the item that was moved
     */
    public function item()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who created the movement
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
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            self::TYPE_IN => 'Masuk',
            self::TYPE_OUT => 'Keluar',
            self::TYPE_ADJUSTMENT => 'Penyesuaian',
            self::TYPE_TRANSFER => 'Transfer',
            self::TYPE_MAINTENANCE => 'Perawatan',
            self::TYPE_DISPOSAL => 'Pembuangan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get type color for display
     */
    public function getTypeColorAttribute()
    {
        return match($this->type) {
            self::TYPE_IN => 'success',
            self::TYPE_OUT => 'danger',
            self::TYPE_ADJUSTMENT => 'warning',
            self::TYPE_TRANSFER => 'info',
            self::TYPE_MAINTENANCE => 'primary',
            self::TYPE_DISPOSAL => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get formatted quantity with sign
     */
    public function getFormattedQuantityAttribute()
    {
        $sign = in_array($this->type, [self::TYPE_IN, self::TYPE_ADJUSTMENT]) ? '+' : '-';
        return $sign . number_format($this->quantity);
    }
}
