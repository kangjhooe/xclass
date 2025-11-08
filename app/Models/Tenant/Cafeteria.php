<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Cafeteria extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'name',
        'description',
        'category',
        'price',
        'cost',
        'stock',
        'minimum_stock',
        'status',
        'image',
        'ingredients',
        'allergens',
        'nutrition_info',
        'preparation_time',
        'is_available',
        'available_days',
        'available_times',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'preparation_time' => 'integer',
        'is_available' => 'boolean',
        'available_days' => 'array',
        'available_times' => 'array',
        'ingredients' => 'array',
        'allergens' => 'array',
        'nutrition_info' => 'array',
    ];

    const CATEGORY_FOOD = 'food';
    const CATEGORY_BEVERAGE = 'beverage';
    const CATEGORY_SNACK = 'snack';
    const CATEGORY_DESSERT = 'dessert';

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_OUT_OF_STOCK = 'out_of_stock';

    /**
     * Get the tenant that owns the cafeteria item
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get cafeteria orders
     */
    public function orders()
    {
        return $this->hasMany(CafeteriaOrder::class);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for available items
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                    ->where('status', self::STATUS_ACTIVE)
                    ->where('stock', '>', 0);
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= minimum_stock');
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            self::CATEGORY_FOOD => 'Makanan',
            self::CATEGORY_BEVERAGE => 'Minuman',
            self::CATEGORY_SNACK => 'Camilan',
            self::CATEGORY_DESSERT => 'Dessert',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            self::STATUS_OUT_OF_STOCK => 'Habis',
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
            self::STATUS_OUT_OF_STOCK => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if item is available
     */
    public function isAvailable()
    {
        return $this->is_available && 
               $this->status === self::STATUS_ACTIVE && 
               $this->stock > 0;
    }

    /**
     * Check if item is low stock
     */
    public function isLowStock()
    {
        return $this->stock <= $this->minimum_stock;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted cost
     */
    public function getFormattedCostAttribute()
    {
        return 'Rp ' . number_format($this->cost, 0, ',', '.');
    }

    /**
     * Get profit margin
     */
    public function getProfitMarginAttribute()
    {
        if ($this->cost > 0) {
            return round((($this->price - $this->cost) / $this->cost) * 100, 2);
        }
        return 0;
    }

    /**
     * Get formatted preparation time
     */
    public function getFormattedPreparationTimeAttribute()
    {
        if ($this->preparation_time) {
            return $this->preparation_time . ' menit';
        }
        return 'Tidak ditentukan';
    }

    /**
     * Reduce stock
     */
    public function reduceStock($quantity)
    {
        if ($quantity > $this->stock) {
            throw new \Exception('Stok tidak mencukupi');
        }

        $this->decrement('stock', $quantity);

        if ($this->stock <= 0) {
            $this->update(['status' => self::STATUS_OUT_OF_STOCK]);
        }
    }

    /**
     * Add stock
     */
    public function addStock($quantity)
    {
        $this->increment('stock', $quantity);

        if ($this->status === self::STATUS_OUT_OF_STOCK && $this->stock > 0) {
            $this->update(['status' => self::STATUS_ACTIVE]);
        }
    }
}
