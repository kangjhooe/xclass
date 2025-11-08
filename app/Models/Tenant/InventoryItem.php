<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class InventoryItem extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'item_code',
        'name',
        'category',
        'subcategory',
        'brand',
        'model',
        'serial_number',
        'description',
        'unit',
        'quantity',
        'minimum_stock',
        'maximum_stock',
        'unit_price',
        'total_value',
        'location',
        'room',
        'shelf',
        'status',
        'condition',
        'purchase_date',
        'purchase_price',
        'supplier',
        'warranty_expiry',
        'maintenance_schedule',
        'last_maintenance',
        'next_maintenance',
        'responsible_person',
        'notes',
        'images',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'images' => 'array',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_DAMAGED = 'damaged';
    const STATUS_LOST = 'lost';
    const STATUS_DISPOSED = 'disposed';

    const CONDITION_EXCELLENT = 'excellent';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';
    const CONDITION_DAMAGED = 'damaged';

    /**
     * Get the tenant that owns the item
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get item movements
     */
    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    /**
     * Get maintenance records
     */
    public function maintenanceRecords()
    {
        return $this->hasMany(InventoryMaintenance::class);
    }

    /**
     * Get responsible person
     */
    public function responsible()
    {
        return $this->belongsTo(\App\Models\User::class, 'responsible_person');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= minimum_stock');
    }

    /**
     * Scope for items needing maintenance
     */
    public function scopeNeedsMaintenance($query)
    {
        return $query->where('next_maintenance', '<=', now()->toDateString());
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            self::STATUS_MAINTENANCE => 'Perawatan',
            self::STATUS_DAMAGED => 'Rusak',
            self::STATUS_LOST => 'Hilang',
            self::STATUS_DISPOSED => 'Dibuang',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get condition label
     */
    public function getConditionLabelAttribute()
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'Sangat Baik',
            self::CONDITION_GOOD => 'Baik',
            self::CONDITION_FAIR => 'Cukup',
            self::CONDITION_POOR => 'Buruk',
            self::CONDITION_DAMAGED => 'Rusak',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'success',
            self::STATUS_INACTIVE => 'secondary',
            self::STATUS_MAINTENANCE => 'warning',
            self::STATUS_DAMAGED => 'danger',
            self::STATUS_LOST => 'dark',
            self::STATUS_DISPOSED => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Get condition color for display
     */
    public function getConditionColorAttribute()
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'success',
            self::CONDITION_GOOD => 'info',
            self::CONDITION_FAIR => 'warning',
            self::CONDITION_POOR => 'danger',
            self::CONDITION_DAMAGED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if item is low stock
     */
    public function isLowStock()
    {
        return $this->quantity <= $this->minimum_stock;
    }

    /**
     * Check if item needs maintenance
     */
    public function needsMaintenance()
    {
        return $this->next_maintenance && $this->next_maintenance <= now()->toDateString();
    }

    /**
     * Check if item is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Get formatted unit price
     */
    public function getFormattedUnitPriceAttribute()
    {
        return 'Rp ' . number_format($this->unit_price, 0, ',', '.');
    }

    /**
     * Get formatted total value
     */
    public function getFormattedTotalValueAttribute()
    {
        return 'Rp ' . number_format($this->total_value, 0, ',', '.');
    }

    /**
     * Get formatted purchase price
     */
    public function getFormattedPurchasePriceAttribute()
    {
        return 'Rp ' . number_format($this->purchase_price, 0, ',', '.');
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute()
    {
        if ($this->quantity <= 0) {
            return 'Habis';
        } elseif ($this->isLowStock()) {
            return 'Stok Rendah';
        } elseif ($this->quantity >= $this->maximum_stock) {
            return 'Stok Penuh';
        }
        return 'Normal';
    }

    /**
     * Get stock status color
     */
    public function getStockStatusColorAttribute()
    {
        if ($this->quantity <= 0) {
            return 'danger';
        } elseif ($this->isLowStock()) {
            return 'warning';
        } elseif ($this->quantity >= $this->maximum_stock) {
            return 'info';
        }
        return 'success';
    }

    /**
     * Update total value
     */
    public function updateTotalValue()
    {
        $this->total_value = $this->quantity * $this->unit_price;
        $this->save();
    }

    /**
     * Add stock
     */
    public function addStock($quantity, $notes = null)
    {
        $this->quantity += $quantity;
        $this->updateTotalValue();
        $this->save();

        // Create movement record
        InventoryMovement::create([
            'instansi_id' => $this->instansi_id,
            'item_id' => $this->id,
            'type' => InventoryMovement::TYPE_IN,
            'quantity' => $quantity,
            'notes' => $notes,
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Remove stock
     */
    public function removeStock($quantity, $notes = null)
    {
        if ($quantity > $this->quantity) {
            throw new \Exception('Jumlah yang dikurangi melebihi stok yang tersedia');
        }

        $this->quantity -= $quantity;
        $this->updateTotalValue();
        $this->save();

        // Create movement record
        InventoryMovement::create([
            'instansi_id' => $this->instansi_id,
            'item_id' => $this->id,
            'type' => InventoryMovement::TYPE_OUT,
            'quantity' => $quantity,
            'notes' => $notes,
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Get location string
     */
    public function getLocationStringAttribute()
    {
        $parts = array_filter([$this->room, $this->shelf, $this->location]);
        return implode(' - ', $parts);
    }
}
