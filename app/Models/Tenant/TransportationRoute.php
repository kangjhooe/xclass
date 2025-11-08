<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class TransportationRoute extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'transportation_id',
        'route_name',
        'start_point',
        'end_point',
        'waypoints',
        'distance',
        'estimated_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'waypoints' => 'array',
        'distance' => 'decimal:2',
        'estimated_time' => 'integer',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';

    /**
     * Get the tenant that owns the route
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the transportation
     */
    public function transportation()
    {
        return $this->belongsTo(Transportation::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active routes
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get formatted distance
     */
    public function getFormattedDistanceAttribute()
    {
        return $this->distance ? $this->distance . ' km' : '-';
    }

    /**
     * Get formatted estimated time
     */
    public function getFormattedEstimatedTimeAttribute()
    {
        if (!$this->estimated_time) return '-';
        
        $hours = floor($this->estimated_time / 60);
        $minutes = $this->estimated_time % 60;
        
        if ($hours > 0) {
            return "{$hours} jam {$minutes} menit";
        }
        return "{$minutes} menit";
    }
}
