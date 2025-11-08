<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExamAnswer extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'exam_id',
        'question_id',
        'attempt_id',
        'student_id',
        'answer',
        'is_correct',
        'points',
        'time_spent',
        'answered_at',
        'is_auto_saved',
        'metadata',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points' => 'integer',
        'time_spent' => 'integer',
        'answered_at' => 'datetime',
        'is_auto_saved' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the tenant that owns the answer
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
     * Get the question
     */
    public function question()
    {
        return $this->belongsTo(ExamQuestion::class);
    }

    /**
     * Get the attempt
     */
    public function attempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope for correct answers
     */
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    /**
     * Scope for incorrect answers
     */
    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }

    /**
     * Scope for filtering by question
     */
    public function scopeByQuestion($query, $questionId)
    {
        return $query->where('question_id', $questionId);
    }

    /**
     * Scope for filtering by attempt
     */
    public function scopeByAttempt($query, $attemptId)
    {
        return $query->where('attempt_id', $attemptId);
    }

    /**
     * Get formatted time spent
     */
    public function getFormattedTimeSpentAttribute()
    {
        $minutes = floor($this->time_spent / 60);
        $seconds = $this->time_spent % 60;
        
        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }
        return "{$seconds}s";
    }

    /**
     * Check if answer is correct
     */
    public function checkAnswer()
    {
        $isCorrect = $this->question->isCorrectAnswer($this->answer);
        $points = $isCorrect ? $this->question->points : 0;
        
        $this->update([
            'is_correct' => $isCorrect,
            'points' => $points,
        ]);
        
        return $isCorrect;
    }

    /**
     * Auto-save answer
     */
    public function autoSave($answer, $timeSpent = 0)
    {
        $this->update([
            'answer' => $answer,
            'time_spent' => $timeSpent,
            'is_auto_saved' => true,
            'answered_at' => now(),
        ]);
    }

    /**
     * Save answer manually
     */
    public function saveAnswer($answer, $timeSpent = 0)
    {
        $this->update([
            'answer' => $answer,
            'time_spent' => $timeSpent,
            'is_auto_saved' => false,
            'answered_at' => now(),
        ]);
        
        // Auto-check answer for objective questions
        if (in_array($this->question->question_type, [
            ExamQuestion::TYPE_MULTIPLE_CHOICE,
            ExamQuestion::TYPE_TRUE_FALSE,
            ExamQuestion::TYPE_FILL_BLANK,
            ExamQuestion::TYPE_MATCHING
        ])) {
            $this->checkAnswer();
        }
    }

    /**
     * Get answer status
     */
    public function getAnswerStatus()
    {
        if (empty($this->answer)) {
            return 'unanswered';
        }
        
        if ($this->is_auto_saved) {
            return 'auto_saved';
        }
        
        return 'answered';
    }

    /**
     * Get answer status label
     */
    public function getAnswerStatusLabel()
    {
        return match($this->getAnswerStatus()) {
            'unanswered' => 'Belum Dijawab',
            'auto_saved' => 'Tersimpan Otomatis',
            'answered' => 'Sudah Dijawab',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get answer status color
     */
    public function getAnswerStatusColor()
    {
        return match($this->getAnswerStatus()) {
            'unanswered' => 'secondary',
            'auto_saved' => 'warning',
            'answered' => 'success',
            default => 'secondary'
        };
    }

    /**
     * Check if answer is empty
     */
    public function isEmpty()
    {
        return empty($this->answer) || $this->answer === null;
    }

    /**
     * Get formatted answer for display
     */
    public function getFormattedAnswer()
    {
        if ($this->isEmpty()) {
            return 'Belum dijawab';
        }
        
        switch ($this->question->question_type) {
            case ExamQuestion::TYPE_MULTIPLE_CHOICE:
            case ExamQuestion::TYPE_TRUE_FALSE:
                $options = $this->question->options;
                return $options[$this->answer] ?? $this->answer;
            
            case ExamQuestion::TYPE_FILL_BLANK:
                return is_array($this->answer) ? implode(', ', $this->answer) : $this->answer;
            
            case ExamQuestion::TYPE_ESSAY:
                return $this->answer;
            
            case ExamQuestion::TYPE_MATCHING:
                if (is_array($this->answer)) {
                    return implode(', ', $this->answer);
                }
                return $this->answer;
            
            default:
                return $this->answer;
        }
    }

    /**
     * Get correct answer for display
     */
    public function getFormattedCorrectAnswer()
    {
        $question = $this->question;
        
        switch ($question->question_type) {
            case ExamQuestion::TYPE_MULTIPLE_CHOICE:
            case ExamQuestion::TYPE_TRUE_FALSE:
                $options = $question->options;
                return $options[$question->correct_answer] ?? $question->correct_answer;
            
            case ExamQuestion::TYPE_FILL_BLANK:
                return is_array($question->correct_answer) ? 
                    implode(', ', $question->correct_answer) : 
                    $question->correct_answer;
            
            case ExamQuestion::TYPE_ESSAY:
                return 'Memerlukan penilaian manual';
            
            case ExamQuestion::TYPE_MATCHING:
                if (is_array($question->correct_answer)) {
                    return implode(', ', $question->correct_answer);
                }
                return $question->correct_answer;
            
            default:
                return $question->correct_answer;
        }
    }

    /**
     * Get answer comparison for review
     */
    public function getAnswerComparison()
    {
        return [
            'student_answer' => $this->getFormattedAnswer(),
            'correct_answer' => $this->getFormattedCorrectAnswer(),
            'is_correct' => $this->is_correct,
            'points_earned' => $this->points,
            'max_points' => $this->question->points,
            'time_spent' => $this->formatted_time_spent,
            'answered_at' => $this->answered_at?->format('d-m-Y H:i:s'),
            'status' => $this->getAnswerStatusLabel()
        ];
    }

    /**
     * Update answer with validation
     */
    public function updateAnswer($answer, $timeSpent = 0, $autoSave = false)
    {
        // Validate answer based on question type
        $isValid = $this->validateAnswer($answer);
        
        if (!$isValid) {
            return false;
        }
        
        $this->update([
            'answer' => $answer,
            'time_spent' => $timeSpent,
            'is_auto_saved' => $autoSave,
            'answered_at' => now(),
        ]);
        
        // Auto-check for objective questions
        if (!$autoSave && in_array($this->question->question_type, [
            ExamQuestion::TYPE_MULTIPLE_CHOICE,
            ExamQuestion::TYPE_TRUE_FALSE,
            ExamQuestion::TYPE_FILL_BLANK,
            ExamQuestion::TYPE_MATCHING
        ])) {
            $this->checkAnswer();
        }
        
        return true;
    }

    /**
     * Validate answer based on question type
     */
    private function validateAnswer($answer)
    {
        $question = $this->question;
        
        switch ($question->question_type) {
            case ExamQuestion::TYPE_MULTIPLE_CHOICE:
            case ExamQuestion::TYPE_TRUE_FALSE:
                return array_key_exists($answer, $question->options ?? []);
            
            case ExamQuestion::TYPE_FILL_BLANK:
                return !empty($answer);
            
            case ExamQuestion::TYPE_ESSAY:
                return !empty($answer);
            
            case ExamQuestion::TYPE_MATCHING:
                return is_array($answer) && !empty($answer);
            
            default:
                return true;
        }
    }
}
