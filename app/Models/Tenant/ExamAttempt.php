<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExamAttempt extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'exam_id',
        'student_id',
        'started_at',
        'submitted_at',
        'status',
        'score',
        'total_questions',
        'correct_answers',
        'time_spent',
        'ip_address',
        'user_agent',
        'question_order',
        'answer_order',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'score' => 'integer',
        'total_questions' => 'integer',
        'correct_answers' => 'integer',
        'time_spent' => 'integer',
        'question_order' => 'array',
        'answer_order' => 'array',
    ];

    const STATUS_STARTED = 'started';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_ABANDONED = 'abandoned';
    const STATUS_TIMEOUT = 'timeout';

    /**
     * Get the tenant that owns the attempt
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
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get exam answers
     */
    public function answers()
    {
        return $this->hasMany(ExamAnswer::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for completed attempts
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for filtering by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_STARTED => 'Dimulai',
            self::STATUS_IN_PROGRESS => 'Sedang Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_ABANDONED => 'Ditinggalkan',
            self::STATUS_TIMEOUT => 'Timeout',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_STARTED => 'info',
            self::STATUS_IN_PROGRESS => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_ABANDONED => 'danger',
            self::STATUS_TIMEOUT => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Check if attempt is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if attempt is in progress
     */
    public function isInProgress()
    {
        return in_array($this->status, [self::STATUS_STARTED, self::STATUS_IN_PROGRESS]);
    }

    /**
     * Get percentage score
     */
    public function getPercentageScoreAttribute()
    {
        if ($this->exam->total_score > 0) {
            return round(($this->score / $this->exam->total_score) * 100, 2);
        }
        return 0;
    }

    /**
     * Check if student passed
     */
    public function isPassed()
    {
        return $this->percentage_score >= $this->exam->passing_score;
    }

    /**
     * Get grade based on percentage
     */
    public function getGradeAttribute()
    {
        $percentage = $this->percentage_score;
        
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'E';
    }

    /**
     * Get formatted time spent
     */
    public function getFormattedTimeSpentAttribute()
    {
        $hours = floor($this->time_spent / 3600);
        $minutes = floor(($this->time_spent % 3600) / 60);
        $seconds = $this->time_spent % 60;
        
        if ($hours > 0) {
            return "{$hours}j {$minutes}m {$seconds}s";
        } elseif ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }
        return "{$seconds}s";
    }

    /**
     * Start attempt
     */
    public function start()
    {
        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);
    }

    /**
     * Complete attempt
     */
    public function complete()
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Abandon attempt
     */
    public function abandon()
    {
        $this->update(['status' => self::STATUS_ABANDONED]);
    }

    /**
     * Calculate score
     */
    public function calculateScore()
    {
        $correctAnswers = $this->answers()->where('is_correct', true)->count();
        $totalQuestions = $this->exam->questions()->count();
        
        $score = $totalQuestions > 0 ? 
            round(($correctAnswers / $totalQuestions) * $this->exam->total_score) : 0;
        
        $this->update([
            'score' => $score,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
        ]);
        
        return $score;
    }

    /**
     * Check if attempt is timed out
     */
    public function isTimedOut()
    {
        if (!$this->started_at) {
            return false;
        }
        
        $elapsedTime = now()->diffInMinutes($this->started_at);
        return $elapsedTime >= $this->exam->duration;
    }

    /**
     * Get remaining time in seconds
     */
    public function getRemainingTime()
    {
        if (!$this->started_at) {
            return $this->exam->duration * 60; // Convert to seconds
        }
        
        $elapsedTime = now()->diffInSeconds($this->started_at);
        $totalTime = $this->exam->duration * 60;
        $remaining = $totalTime - $elapsedTime;
        
        return max(0, $remaining);
    }

    /**
     * Get remaining time formatted
     */
    public function getFormattedRemainingTime()
    {
        $remaining = $this->getRemainingTime();
        $hours = floor($remaining / 3600);
        $minutes = floor(($remaining % 3600) / 60);
        $seconds = $remaining % 60;
        
        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }
        
        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    /**
     * Check if attempt can be submitted
     */
    public function canSubmit()
    {
        return $this->isInProgress() && !$this->isTimedOut();
    }

    /**
     * Auto-submit when time is up
     */
    public function autoSubmit()
    {
        if ($this->isTimedOut() && $this->isInProgress()) {
            $this->update([
                'status' => self::STATUS_TIMEOUT,
                'submitted_at' => now(),
                'time_spent' => $this->exam->duration * 60
            ]);
            
            // Calculate final score
            $this->calculateScore();
            
            return true;
        }
        
        return false;
    }

    /**
     * Get attempt progress percentage
     */
    public function getProgressPercentage()
    {
        if ($this->total_questions === 0) {
            return 0;
        }
        
        $answeredQuestions = $this->answers()->count();
        return round(($answeredQuestions / $this->total_questions) * 100, 2);
    }

    /**
     * Get attempt summary
     */
    public function getSummary()
    {
        $answers = $this->answers();
        $correctAnswers = $answers->where('is_correct', true)->count();
        $totalAnswers = $answers->count();
        
        return [
            'total_questions' => $this->total_questions,
            'answered_questions' => $totalAnswers,
            'unanswered_questions' => $this->total_questions - $totalAnswers,
            'correct_answers' => $correctAnswers,
            'incorrect_answers' => $totalAnswers - $correctAnswers,
            'score' => $this->score,
            'percentage' => $this->percentage_score,
            'grade' => $this->grade,
            'time_spent' => $this->formatted_time_spent,
            'progress_percentage' => $this->getProgressPercentage(),
            'is_passed' => $this->isPassed(),
            'status' => $this->status_label
        ];
    }

    /**
     * Get detailed attempt analysis
     */
    public function getDetailedAnalysis()
    {
        $answers = $this->answers()->with('question')->get();
        $analysis = [];
        
        foreach ($answers as $answer) {
            $question = $answer->question;
            $analysis[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'difficulty' => $question->difficulty,
                'student_answer' => $answer->answer,
                'correct_answer' => $question->correct_answer,
                'is_correct' => $answer->is_correct,
                'points_earned' => $answer->points,
                'time_spent' => $answer->time_spent,
                'answered_at' => $answer->answered_at
            ];
        }
        
        return $analysis;
    }

    /**
     * Get attempt statistics by question type
     */
    public function getStatisticsByType()
    {
        $answers = $this->answers()->with('question')->get();
        $statistics = [];
        
        $types = ['multiple_choice', 'true_false', 'essay', 'fill_blank', 'matching'];
        
        foreach ($types as $type) {
            $typeAnswers = $answers->where('question.question_type', $type);
            $total = $typeAnswers->count();
            $correct = $typeAnswers->where('is_correct', true)->count();
            
            $statistics[$type] = [
                'total' => $total,
                'correct' => $correct,
                'incorrect' => $total - $correct,
                'accuracy' => $total > 0 ? round(($correct / $total) * 100, 2) : 0,
                'average_time' => $total > 0 ? round($typeAnswers->avg('time_spent'), 2) : 0
            ];
        }
        
        return $statistics;
    }

    /**
     * Resume attempt (if allowed)
     */
    public function resume()
    {
        if ($this->status === self::STATUS_STARTED && !$this->isTimedOut()) {
            $this->update(['status' => self::STATUS_IN_PROGRESS]);
            return true;
        }
        
        return false;
    }

    /**
     * Force complete attempt
     */
    public function forceComplete()
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'submitted_at' => now(),
        ]);
        
        $this->calculateScore();
    }

    /**
     * Get attempt duration in minutes
     */
    public function getDurationInMinutes()
    {
        if (!$this->started_at) {
            return 0;
        }
        
        $endTime = $this->submitted_at ?? now();
        return round($endTime->diffInMinutes($this->started_at), 2);
    }
}
