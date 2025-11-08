<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class TransportationAttendance extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'transportation_id',
        'student_id',
        'attendance_date',
        'pickup_time',
        'dropoff_time',
        'status',
        'notes',
        'marked_by',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'pickup_time' => 'datetime',
        'dropoff_time' => 'datetime',
    ];

    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';

    /**
     * Get the tenant that owns the attendance
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
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who marked the attendance
     */
    public function marker()
    {
        return $this->belongsTo(\App\Models\User::class, 'marked_by');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for present attendances
     */
    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    /**
     * Scope for absent attendances
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PRESENT => 'Hadir',
            self::STATUS_ABSENT => 'Tidak Hadir',
            self::STATUS_LATE => 'Terlambat',
            self::STATUS_EXCUSED => 'Izin',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PRESENT => 'success',
            self::STATUS_ABSENT => 'danger',
            self::STATUS_LATE => 'warning',
            self::STATUS_EXCUSED => 'info',
            default => 'secondary'
        };
    }

    /**
     * Check if attendance is present
     */
    public function isPresent()
    {
        return $this->status === self::STATUS_PRESENT;
    }

    /**
     * Check if attendance is absent
     */
    public function isAbsent()
    {
        return $this->status === self::STATUS_ABSENT;
    }

    /**
     * Check if attendance is late
     */
    public function isLate()
    {
        return $this->status === self::STATUS_LATE;
    }

    /**
     * Check if attendance is excused
     */
    public function isExcused()
    {
        return $this->status === self::STATUS_EXCUSED;
    }
}
