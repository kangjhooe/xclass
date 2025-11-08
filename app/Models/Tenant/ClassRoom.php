<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class ClassRoom extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'name',
        'level',
        'room_number',
        'capacity',
        'homeroom_teacher_id',
        'room_id',
        'academic_year',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this class
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the homeroom teacher for this class
     */
    public function homeroomTeacher()
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }

    /**
     * Get the room for this class
     */
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    /**
     * Get students in this class
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    /**
     * Get teachers for this class
     */
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_classes');
    }

    /**
     * Get schedules for this class
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get attendances for this class
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get exams for this class through exam_schedules
     */
    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_schedules', 'class_id', 'exam_id');
    }

    /**
     * Scope for active classes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for classes by level
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Retrieve the model for route model binding
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        if (!$tenant) {
            abort(404);
        }
        
        // Use static query builder and explicitly filter by tenant
        $field = $field ?: 'id';
        return static::where($field, $value)
            ->where('instansi_id', $tenant->id)
            ->firstOrFail();
    }
}