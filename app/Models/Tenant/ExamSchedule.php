<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExamSchedule extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'exam_id',
        'class_id',
        'subject_id',
        'teacher_id',
        'start_time',
        'end_time',
        'duration',
        'total_questions',
        'total_score',
        'passing_score',
        'status',
        'instructions',
        'settings',
        'allow_review',
        'show_correct_answers',
        'randomize_questions',
        'randomize_answers',
        'max_attempts',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration' => 'integer',
        'total_questions' => 'integer',
        'total_score' => 'integer',
        'passing_score' => 'integer',
        'settings' => 'array',
        'allow_review' => 'boolean',
        'show_correct_answers' => 'boolean',
        'randomize_questions' => 'boolean',
        'randomize_answers' => 'boolean',
        'max_attempts' => 'integer',
    ];

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the exam schedule
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the exam
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the class
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * Get the subject
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get exam attempts for this schedule
     */
    public function attempts()
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id', 'exam_id')
            ->where('class_id', $this->class_id)
            ->where('subject_id', $this->subject_id);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'Terjadwal',
            self::STATUS_ONGOING => 'Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'info',
            self::STATUS_ONGOING => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if schedule is active
     */
    public function isActive()
    {
        return in_array($this->status, [self::STATUS_SCHEDULED, self::STATUS_ONGOING]);
    }

    /**
     * Check if schedule is ongoing
     */
    public function isOngoing()
    {
        return $this->status === self::STATUS_ONGOING;
    }

    /**
     * Check if schedule is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if schedule is cancelled
     */
    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if schedule is currently available for students
     */
    public function isAvailable()
    {
        $now = now();
        return $this->status === self::STATUS_SCHEDULED && 
               $now->between($this->start_time, $this->end_time);
    }

    /**
     * Check if schedule has ended
     */
    public function hasEnded()
    {
        return now()->isAfter($this->end_time);
    }

    /**
     * Check if schedule is scheduled for future
     */
    public function isScheduled()
    {
        return now()->isBefore($this->start_time);
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute()
    {
        $hours = floor($this->duration / 60);
        $minutes = $this->duration % 60;
        
        if ($hours > 0) {
            return "{$hours} jam {$minutes} menit";
        }
        return "{$minutes} menit";
    }

    /**
     * Get students who can take this exam
     */
    public function getEligibleStudents()
    {
        if (!$this->classRoom) {
            return collect();
        }
        
        return $this->classRoom->students()->where('is_active', true)->get();
    }

    /**
     * Get count of eligible students
     */
    public function getEligibleStudentsCount()
    {
        if (!$this->classRoom) {
            return 0;
        }
        
        return $this->classRoom->students()->where('is_active', true)->count();
    }

    /**
     * Get count of exam attempts
     */
    public function getAttemptsCount()
    {
        return $this->attempts()->count();
    }

    /**
     * Check if student can take this exam
     */
    public function canStudentTake($studentId)
    {
        if (!$this->classRoom) {
            return false;
        }
        
        $student = $this->classRoom->students()->find($studentId);
        if (!$student || !$student->is_active) {
            return false;
        }

        // Check if student has reached max attempts
        $attemptCount = $this->attempts()->where('student_id', $studentId)->count();
        return $attemptCount < $this->max_attempts;
    }

    /**
     * Start the exam schedule
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_ONGOING]);
    }

    /**
     * Complete the exam schedule
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Cancel the exam schedule
     */
    public function cancel()
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Get exam statistics for this schedule
     */
    public function getStatisticsAttribute()
    {
        $attempts = $this->attempts();
        
        return [
            'total_attempts' => $attempts->count(),
            'completed_attempts' => $attempts->where('status', ExamAttempt::STATUS_COMPLETED)->count(),
            'average_score' => $attempts->where('status', ExamAttempt::STATUS_COMPLETED)->avg('score') ?? 0,
            'highest_score' => $attempts->where('status', ExamAttempt::STATUS_COMPLETED)->max('score') ?? 0,
            'lowest_score' => $attempts->where('status', ExamAttempt::STATUS_COMPLETED)->min('score') ?? 0,
            'pass_rate' => $attempts->where('status', ExamAttempt::STATUS_COMPLETED)
                ->where('score', '>=', $this->passing_score)->count(),
        ];
    }
}
