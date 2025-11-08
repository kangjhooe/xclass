<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class TransportationSchedule extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'transportation_id',
        'route_id',
        'day_of_week',
        'pickup_time',
        'dropoff_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
        'dropoff_time' => 'datetime',
    ];

    const DAY_MONDAY = 'monday';
    const DAY_TUESDAY = 'tuesday';
    const DAY_WEDNESDAY = 'wednesday';
    const DAY_THURSDAY = 'thursday';
    const DAY_FRIDAY = 'friday';
    const DAY_SATURDAY = 'saturday';
    const DAY_SUNDAY = 'sunday';

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the schedule
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
     * Get the route
     */
    public function route()
    {
        return $this->belongsTo(TransportationRoute::class);
    }

    /**
     * Scope for filtering by day
     */
    public function scopeByDay($query, $day)
    {
        return $query->where('day_of_week', $day);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active schedules
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get day label
     */
    public function getDayLabelAttribute()
    {
        return match($this->day_of_week) {
            self::DAY_MONDAY => 'Senin',
            self::DAY_TUESDAY => 'Selasa',
            self::DAY_WEDNESDAY => 'Rabu',
            self::DAY_THURSDAY => 'Kamis',
            self::DAY_FRIDAY => 'Jumat',
            self::DAY_SATURDAY => 'Sabtu',
            self::DAY_SUNDAY => 'Minggu',
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
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get formatted pickup time
     */
    public function getFormattedPickupTimeAttribute()
    {
        return $this->pickup_time ? $this->pickup_time->format('H:i') : '-';
    }

    /**
     * Get formatted dropoff time
     */
    public function getFormattedDropoffTimeAttribute()
    {
        return $this->dropoff_time ? $this->dropoff_time->format('H:i') : '-';
    }
}
