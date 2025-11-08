<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseAssignment extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'instansi_id',
        'title',
        'description',
        'instructions',
        'max_score',
        'weight',
        'due_date',
        'allow_late_submission',
        'max_attempts',
        'allowed_file_types',
        'max_file_size_mb',
        'send_to_gradebook',
        'is_published',
        'publish_date',
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
        'weight' => 'decimal:2',
        'due_date' => 'datetime',
        'allow_late_submission' => 'boolean',
        'send_to_gradebook' => 'boolean',
        'is_published' => 'boolean',
        'publish_date' => 'datetime',
        'allowed_file_types' => 'array',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function submissions()
    {
        return $this->hasMany(CourseAssignmentSubmission::class, 'assignment_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeDue($query)
    {
        return $query->where('due_date', '<=', now());
    }

    // Helper methods
    public function isOverdue()
    {
        if (!$this->due_date) return false;
        return now() > $this->due_date;
    }

    public function getStudentSubmission($studentId)
    {
        return $this->submissions()->where('student_id', $studentId)->latest()->first();
    }

    public function hasStudentSubmitted($studentId)
    {
        return $this->submissions()->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'graded', 'returned'])
            ->exists();
    }
}

