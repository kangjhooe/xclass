<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'name',
        'amount',
        'type'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    const TYPE_ALLOWANCE = 'allowance';
    const TYPE_DEDUCTION = 'deduction';

    /**
     * Get the payroll for this item
     */
    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }

    /**
     * Scope for allowance items
     */
    public function scopeAllowances($query)
    {
        return $query->where('type', self::TYPE_ALLOWANCE);
    }

    /**
     * Scope for deduction items
     */
    public function scopeDeductions($query)
    {
        return $query->where('type', self::TYPE_DEDUCTION);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            self::TYPE_ALLOWANCE => 'Tunjangan',
            self::TYPE_DEDUCTION => 'Potongan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get type badge class
     */
    public function getTypeBadgeClassAttribute()
    {
        return match($this->type) {
            self::TYPE_ALLOWANCE => 'bg-success',
            self::TYPE_DEDUCTION => 'bg-danger',
            default => 'bg-secondary'
        };
    }
}
