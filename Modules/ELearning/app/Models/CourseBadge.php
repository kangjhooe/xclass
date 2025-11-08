<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseBadge extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'student_id',
        'instansi_id',
        'badge_name',
        'badge_type',
        'badge_icon',
        'description',
        'earned_at',
        'metadata',
    ];

    protected $casts = [
        'earned_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('badge_type', $type);
    }
}

