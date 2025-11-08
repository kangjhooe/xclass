<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;

class Schedule extends Model
{
    use HasFactory, HasNpsn;

    protected $fillable = [
        'npsn',
        'day',
        'start_time',
        'end_time',
        'teacher_id',
        'subject_id',
        'class_id',
        'room',
        'academic_year',
        'semester',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this schedule
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the teacher for this schedule
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the subject for this schedule
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the class for this schedule
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * Get attendances for this schedule
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Scope for active schedules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for schedules by day
     */
    public function scopeByDay($query, $day)
    {
        return $query->where('day', $day);
    }

    /**
     * Scope for schedules by teacher
     */
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Scope for schedules by class
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }
}