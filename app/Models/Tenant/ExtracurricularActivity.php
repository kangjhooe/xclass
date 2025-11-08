<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExtracurricularActivity extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'extracurricular_id',
        'title',
        'description',
        'activity_date',
        'start_time',
        'end_time',
        'venue',
        'type',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    const TYPE_REGULAR = 'regular';
    const TYPE_COMPETITION = 'competition';
    const TYPE_TRAINING = 'training';
    const TYPE_EVENT = 'event';
    const TYPE_MEETING = 'meeting';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the activity
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the extracurricular
     */
    public function extracurricular()
    {
        return $this->belongsTo(Extracurricular::class);
    }

    /**
     * Get attendances
     */
    public function attendances()
    {
        return $this->hasMany(ExtracurricularAttendance::class);
    }

    /**
     * Get the user who created the activity
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
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for upcoming activities
     */
    public function scopeUpcoming($query)
    {
        return $query->where('activity_date', '>=', now()->toDateString())
                    ->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            self::TYPE_REGULAR => 'Rutin',
            self::TYPE_COMPETITION => 'Kompetisi',
            self::TYPE_TRAINING => 'Pelatihan',
            self::TYPE_EVENT => 'Acara',
            self::TYPE_MEETING => 'Rapat',
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
            self::STATUS_ONGOING => 'Sedang Berlangsung',
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
            self::STATUS_ONGOING => 'warning',
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
        return match($this->type) {
            self::TYPE_REGULAR => 'primary',
            self::TYPE_COMPETITION => 'success',
            self::TYPE_TRAINING => 'info',
            self::TYPE_EVENT => 'warning',
            self::TYPE_MEETING => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Check if activity is upcoming
     */
    public function isUpcoming()
    {
        return $this->activity_date >= now()->toDateString() && 
               $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if activity is ongoing
     */
    public function isOngoing()
    {
        return $this->status === self::STATUS_ONGOING;
    }

    /**
     * Check if activity is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get formatted time range
     */
    public function getFormattedTimeRangeAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
        }
        return 'Waktu belum ditentukan';
    }

    /**
     * Get duration in minutes
     */
    public function getDurationAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInMinutes($this->end_time);
        }
        return 0;
    }

    /**
     * Get attendance statistics
     */
    public function getAttendanceStatsAttribute()
    {
        $totalParticipants = $this->extracurricular->current_participants;
        $presentCount = $this->attendances()->where('status', ExtracurricularAttendance::STATUS_PRESENT)->count();
        $absentCount = $this->attendances()->where('status', ExtracurricularAttendance::STATUS_ABSENT)->count();
        
        return [
            'total_participants' => $totalParticipants,
            'present_count' => $presentCount,
            'absent_count' => $absentCount,
            'attendance_rate' => $totalParticipants > 0 ? round(($presentCount / $totalParticipants) * 100, 2) : 0,
        ];
    }

    /**
     * Start activity
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_ONGOING]);
    }

    /**
     * Complete activity
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Cancel activity
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }
}
