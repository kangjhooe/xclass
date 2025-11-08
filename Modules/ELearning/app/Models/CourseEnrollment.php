<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseEnrollment extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'student_id',
        'instansi_id',
        'status',
        'enrolled_at',
        'completed_at',
        'progress_percentage',
        'final_score',
        'notes',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress_percentage' => 'decimal:2',
        'final_score' => 'decimal:2',
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

    public function progress()
    {
        return $this->hasMany(CourseProgress::class, 'enrollment_id');
    }

    public function certificates()
    {
        return $this->hasMany(CourseCertificate::class, 'enrollment_id');
    }

    public function notes()
    {
        return $this->hasMany(CourseNote::class, 'enrollment_id');
    }

    public function bookmarks()
    {
        return $this->hasMany(CourseBookmark::class, 'enrollment_id');
    }

    // Scopes
    public function scopeEnrolled($query)
    {
        return $query->where('status', 'enrolled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Helper methods
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function updateProgress()
    {
        // Calculate progress based on completed materials, videos, assignments, quizzes
        $totalItems = $this->course->materials()->count() + 
                     $this->course->videos()->count() + 
                     $this->course->assignments()->count() + 
                     $this->course->quizzes()->count();
        
        if ($totalItems == 0) {
            $this->progress_percentage = 0;
            $this->save();
            return;
        }

        $completedItems = $this->progress()->where('completed_at', '!=', null)->count();
        $progress = ($completedItems / $totalItems) * 100;
        
        $this->progress_percentage = round($progress, 2);
        $this->save();
    }
}

