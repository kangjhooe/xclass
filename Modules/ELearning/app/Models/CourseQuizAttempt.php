<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseQuizAttempt extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'quiz_id',
        'student_id',
        'instansi_id',
        'started_at',
        'submitted_at',
        'time_spent_seconds',
        'answers',
        'score',
        'percentage',
        'status',
        'is_passed',
        'synced_to_gradebook',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'answers' => 'array',
        'score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'is_passed' => 'boolean',
        'synced_to_gradebook' => 'boolean',
    ];

    // Relationships
    public function quiz()
    {
        return $this->belongsTo(CourseQuiz::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    // Helper methods
    public function submit()
    {
        $this->calculateScore();
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        if ($this->quiz->send_to_gradebook && !$this->synced_to_gradebook) {
            app(\Modules\ELearning\Services\GradeIntegrationService::class)->syncQuizGrade($this);
        }
    }

    public function calculateScore()
    {
        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($this->quiz->questions as $question) {
            $totalPoints += $question->points;
            $studentAnswer = $this->answers[$question->id] ?? null;
            
            if ($studentAnswer !== null) {
                $isCorrect = $question->checkAnswer($studentAnswer);
                if ($isCorrect === true) {
                    $earnedPoints += $question->points;
                }
            }
        }

        $score = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * $this->quiz->max_score : 0;
        $percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
        $isPassed = $this->quiz->passing_score ? $percentage >= $this->quiz->passing_score : true;

        $this->update([
            'score' => round($score, 2),
            'percentage' => round($percentage, 2),
            'is_passed' => $isPassed,
            'status' => 'graded',
        ]);
    }

    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }

    public function isTimedOut()
    {
        if (!$this->quiz->time_limit_minutes) return false;
        
        $timeSpent = $this->started_at->diffInMinutes(now());
        return $timeSpent >= $this->quiz->time_limit_minutes;
    }
}

