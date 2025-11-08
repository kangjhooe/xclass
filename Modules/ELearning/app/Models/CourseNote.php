<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'student_id',
        'noteable_type',
        'noteable_id',
        'content',
        'highlight_text',
        'position',
    ];

    // Relationships
    public function enrollment()
    {
        return $this->belongsTo(CourseEnrollment::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    public function noteable()
    {
        return $this->morphTo();
    }
}

