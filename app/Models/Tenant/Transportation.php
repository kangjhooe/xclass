<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Transportation extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'vehicle_type',
        'vehicle_number',
        'driver_name',
        'driver_phone',
        'driver_license',
        'capacity',
        'route_name',
        'pickup_points',
        'dropoff_points',
        'schedule',
        'status',
        'notes',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'pickup_points' => 'array',
        'dropoff_points' => 'array',
        'schedule' => 'array',
    ];

    const VEHICLE_TYPE_BUS = 'bus';
    const VEHICLE_TYPE_MINIBUS = 'minibus';
    const VEHICLE_TYPE_VAN = 'van';
    const VEHICLE_TYPE_CAR = 'car';

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_MAINTENANCE = 'maintenance';

    /**
     * Get the tenant that owns the transportation
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get transportation routes
     */
    public function routes()
    {
        return $this->hasMany(TransportationRoute::class);
    }

    /**
     * Get transportation schedules
     */
    public function schedules()
    {
        return $this->hasMany(TransportationSchedule::class);
    }

    /**
     * Get transportation attendance
     */
    public function attendances()
    {
        return $this->hasMany(TransportationAttendance::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active transportation
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get vehicle type label
     */
    public function getVehicleTypeLabelAttribute()
    {
        return match($this->vehicle_type) {
            self::VEHICLE_TYPE_BUS => 'Bus',
            self::VEHICLE_TYPE_MINIBUS => 'Minibus',
            self::VEHICLE_TYPE_VAN => 'Van',
            self::VEHICLE_TYPE_CAR => 'Mobil',
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
            self::STATUS_MAINTENANCE => 'Perawatan',
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
            default => 'secondary'
        };
    }

    /**
     * Check if transportation is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Get formatted capacity
     */
    public function getFormattedCapacityAttribute()
    {
        return $this->capacity ? $this->capacity . ' penumpang' : '-';
    }

    /**
     * Get formatted schedule
     */
    public function getFormattedScheduleAttribute()
    {
        if (!$this->schedule) {
            return 'Jadwal belum ditentukan';
        }

        $scheduleText = [];
        foreach ($this->schedule as $day => $time) {
            $scheduleText[] = ucfirst($day) . ': ' . $time;
        }

        return implode(', ', $scheduleText);
    }
}
