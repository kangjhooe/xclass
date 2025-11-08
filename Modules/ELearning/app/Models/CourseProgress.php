<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'course_id',
        'student_id',
        'progressable_type',
        'progressable_id',
        'progress_percentage',
        'time_spent_seconds',
        'started_at',
        'completed_at',
        'last_position',
        'metadata',
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function enrollment()
    {
        return $this->belongsTo(CourseEnrollment::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    public function progressable()
    {
        return $this->morphTo();
    }

    // Helper methods
    public function markAsCompleted()
    {
        $this->update([
            'progress_percentage' => 100,
            'completed_at' => now(),
        ]);
        
        // Update enrollment progress
        $this->enrollment->updateProgress();
    }

    public function updateProgress($percentage)
    {
        $this->update([
            'progress_percentage' => $percentage,
            'started_at' => $this->started_at ?? now(),
        ]);
        
        if ($percentage >= 100) {
            $this->markAsCompleted();
        } else {
            $this->enrollment->updateProgress();
        }
    }
}

