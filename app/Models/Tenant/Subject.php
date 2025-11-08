<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;

class Subject extends Model
{
    use HasFactory, HasNpsn;

    protected $fillable = [
        'npsn',
        'name',
        'code',
        'description',
        'credits',
        'level',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this subject
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get teachers for this subject
     */
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_subjects');
    }

    /**
     * Get schedules for this subject
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get grades for this subject
     */
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Get exams for this subject through exam_subjects
     */
    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_subjects', 'subject_id', 'exam_id');
    }

    /**
     * Scope for active subjects
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for subjects by level
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}