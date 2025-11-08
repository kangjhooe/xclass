<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseBookmark extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'student_id',
        'bookmarkable_type',
        'bookmarkable_id',
        'note',
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

    public function bookmarkable()
    {
        return $this->morphTo();
    }
}

