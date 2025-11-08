<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;

class Attendance extends Model
{
    use HasFactory, HasNpsn;

    protected $fillable = [
        'npsn',
        'student_id',
        'schedule_id',
        'teacher_id',
        'date',
        'status',
        'notes',
        'instansi_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';

    /**
     * Get the tenant (instansi) for this attendance
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the student for this attendance
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the schedule for this attendance
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the teacher for this attendance
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Scope for attendances by date
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope for attendances by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope for attendances by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_PRESENT => 'Hadir',
            self::STATUS_ABSENT => 'Tidak Hadir',
            self::STATUS_LATE => 'Terlambat',
            self::STATUS_EXCUSED => 'Izin',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            self::STATUS_PRESENT => 'success',
            self::STATUS_ABSENT => 'danger',
            self::STATUS_LATE => 'warning',
            self::STATUS_EXCUSED => 'info',
        ];

        return $colors[$this->status] ?? 'secondary';
    }
}