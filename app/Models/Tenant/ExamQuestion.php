<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExamQuestion extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'exam_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'explanation',
        'points',
        'difficulty',
        'order',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_ESSAY = 'essay';
    const TYPE_FILL_BLANK = 'fill_blank';
    const TYPE_MATCHING = 'matching';

    const DIFFICULTY_EASY = 'easy';
    const DIFFICULTY_MEDIUM = 'medium';
    const DIFFICULTY_HARD = 'hard';

    /**
     * Get the tenant that owns the question
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
     * Get question answers
     */
    public function answers()
    {
        return $this->hasMany(ExamAnswer::class);
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('question_type', $type);
    }

    /**
     * Scope for filtering by difficulty
     */
    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    /**
     * Scope for active questions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->question_type) {
            self::TYPE_MULTIPLE_CHOICE => 'Pilihan Ganda',
            self::TYPE_TRUE_FALSE => 'Benar/Salah',
            self::TYPE_ESSAY => 'Esai',
            self::TYPE_FILL_BLANK => 'Isian',
            self::TYPE_MATCHING => 'Menjodohkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get difficulty label
     */
    public function getDifficultyLabelAttribute()
    {
        return match($this->difficulty) {
            self::DIFFICULTY_EASY => 'Mudah',
            self::DIFFICULTY_MEDIUM => 'Sedang',
            self::DIFFICULTY_HARD => 'Sulit',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get difficulty color for display
     */
    public function getDifficultyColorAttribute()
    {
        return match($this->difficulty) {
            self::DIFFICULTY_EASY => 'success',
            self::DIFFICULTY_MEDIUM => 'warning',
            self::DIFFICULTY_HARD => 'danger',
            default => 'secondary'
        };
    }



    /**
     * Get statistics for this question
     */
    public function getStatisticsAttribute()
    {
        $answers = $this->answers();
        
        return [
            'total_attempts' => $answers->count(),
            'correct_attempts' => $answers->where('is_correct', true)->count(),
            'accuracy_rate' => $answers->count() > 0 ? 
                ($answers->where('is_correct', true)->count() / $answers->count()) * 100 : 0,
            'average_time' => $answers->avg('time_spent') ?? 0,
        ];
    }

    /**
     * Check if answer is correct for different question types
     */
    public function isCorrectAnswer($answer)
    {
        switch ($this->question_type) {
            case self::TYPE_MULTIPLE_CHOICE:
            case self::TYPE_TRUE_FALSE:
                return $this->correct_answer === $answer;
            
            case self::TYPE_FILL_BLANK:
                $correctAnswers = is_array($this->correct_answer) ? $this->correct_answer : [$this->correct_answer];
                $studentAnswers = is_array($answer) ? $answer : [$answer];
                
                // Case insensitive comparison
                $correctAnswers = array_map('strtolower', array_map('trim', $correctAnswers));
                $studentAnswers = array_map('strtolower', array_map('trim', $studentAnswers));
                
                return count(array_intersect($correctAnswers, $studentAnswers)) > 0;
            
            case self::TYPE_ESSAY:
                // For essay questions, manual grading is required
                return null;
            
            case self::TYPE_MATCHING:
                // For matching questions, compare arrays
                if (is_array($answer) && is_array($this->correct_answer)) {
                    return $answer === $this->correct_answer;
                }
                return false;
            
            default:
                return false;
        }
    }

    /**
     * Get formatted options for display with randomization
     */
    public function getFormattedOptionsAttribute()
    {
        if (!$this->options) {
            return [];
        }

        $formatted = [];
        foreach ($this->options as $key => $option) {
            $formatted[] = [
                'key' => $key,
                'value' => $option,
                'is_correct' => $this->isCorrectAnswer($key)
            ];
        }

        return $formatted;
    }

    /**
     * Get randomized options for student
     */
    public function getRandomizedOptions($randomize = false)
    {
        if (!$this->options || !$randomize) {
            return $this->options;
        }

        $options = $this->options;
        $keys = array_keys($options);
        shuffle($keys);
        
        $randomized = [];
        foreach ($keys as $key) {
            $randomized[$key] = $options[$key];
        }
        
        return $randomized;
    }

    /**
     * Get question preview text (truncated)
     */
    public function getPreviewAttribute()
    {
        return strlen($this->question_text) > 100 ? 
            substr($this->question_text, 0, 100) . '...' : 
            $this->question_text;
    }

    /**
     * Get question type icon
     */
    public function getTypeIconAttribute()
    {
        return match($this->question_type) {
            self::TYPE_MULTIPLE_CHOICE => 'fas fa-list-ul',
            self::TYPE_TRUE_FALSE => 'fas fa-check-circle',
            self::TYPE_ESSAY => 'fas fa-edit',
            self::TYPE_FILL_BLANK => 'fas fa-keyboard',
            self::TYPE_MATCHING => 'fas fa-link',
            default => 'fas fa-question'
        };
    }

    /**
     * Get difficulty level in Indonesian
     */
    public function getDifficultyLevelAttribute()
    {
        return match($this->difficulty) {
            self::DIFFICULTY_EASY => 'Mudah',
            self::DIFFICULTY_MEDIUM => 'Sedang',
            self::DIFFICULTY_HARD => 'Sulit',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get question statistics for analysis
     */
    public function getDetailedStatistics()
    {
        $answers = $this->answers();
        $totalAttempts = $answers->count();
        $correctAttempts = $answers->where('is_correct', true)->count();
        
        if ($totalAttempts === 0) {
            return [
                'total_attempts' => 0,
                'correct_attempts' => 0,
                'accuracy_rate' => 0,
                'average_time' => 0,
                'difficulty_level' => $this->difficulty,
                'success_rate' => 0,
                'time_distribution' => []
            ];
        }

        $accuracyRate = round(($correctAttempts / $totalAttempts) * 100, 2);
        $averageTime = round($answers->avg('time_spent'), 2);
        
        // Time distribution
        $times = $answers->pluck('time_spent')->toArray();
        $timeRanges = [
            '0-30s' => 0,
            '30-60s' => 0,
            '1-2min' => 0,
            '2min+' => 0
        ];

        foreach ($times as $time) {
            if ($time <= 30) $timeRanges['0-30s']++;
            elseif ($time <= 60) $timeRanges['30-60s']++;
            elseif ($time <= 120) $timeRanges['1-2min']++;
            else $timeRanges['2min+']++;
        }

        return [
            'total_attempts' => $totalAttempts,
            'correct_attempts' => $correctAttempts,
            'accuracy_rate' => $accuracyRate,
            'average_time' => $averageTime,
            'difficulty_level' => $this->difficulty,
            'success_rate' => $accuracyRate,
            'time_distribution' => $timeRanges
        ];
    }

    /**
     * Validate question data
     */
    public function validateQuestion()
    {
        $errors = [];

        if (empty($this->question_text)) {
            $errors[] = 'Pertanyaan tidak boleh kosong';
        }

        if ($this->points <= 0) {
            $errors[] = 'Nilai poin harus lebih dari 0';
        }

        if (in_array($this->question_type, [self::TYPE_MULTIPLE_CHOICE, self::TYPE_TRUE_FALSE])) {
            if (empty($this->options)) {
                $errors[] = 'Opsi jawaban tidak boleh kosong untuk tipe soal ini';
            }
            if (empty($this->correct_answer)) {
                $errors[] = 'Jawaban benar tidak boleh kosong';
            }
        }

        if ($this->question_type === self::TYPE_FILL_BLANK) {
            if (empty($this->correct_answer)) {
                $errors[] = 'Jawaban benar tidak boleh kosong untuk soal isian';
            }
        }

        return $errors;
    }
}