<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseAssignmentSubmission extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'assignment_id',
        'student_id',
        'instansi_id',
        'submission_text',
        'attached_files',
        'submitted_at',
        'score',
        'feedback',
        'status',
        'is_late',
        'attempt_number',
        'graded_by',
        'graded_at',
        'synced_to_gradebook',
    ];

    protected $casts = [
        'attached_files' => 'array',
        'submitted_at' => 'datetime',
        'score' => 'decimal:2',
        'is_late' => 'boolean',
        'graded_at' => 'datetime',
        'synced_to_gradebook' => 'boolean',
    ];

    // Relationships
    public function assignment()
    {
        return $this->belongsTo(CourseAssignment::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    public function grader()
    {
        return $this->belongsTo(\App\Models\User::class, 'graded_by');
    }

    // Helper methods
    public function markAsSubmitted()
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'is_late' => $this->assignment->isOverdue(),
        ]);
    }

    public function grade($score, $feedback, $graderId)
    {
        $this->update([
            'score' => $score,
            'feedback' => $feedback,
            'status' => 'graded',
            'graded_by' => $graderId,
            'graded_at' => now(),
        ]);

        // Sync to gradebook if enabled
        if ($this->assignment->send_to_gradebook && !$this->synced_to_gradebook) {
            app(\Modules\ELearning\Services\GradeIntegrationService::class)->syncAssignmentGrade($this);
        }
    }
}

