<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseQuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'question',
        'type',
        'options',
        'correct_answer',
        'explanation',
        'points',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'points' => 'decimal:2',
    ];

    // Relationships
    public function quiz()
    {
        return $this->belongsTo(CourseQuiz::class);
    }

    // Helper methods
    public function checkAnswer($studentAnswer)
    {
        if ($this->type === 'multiple_choice' || $this->type === 'true_false') {
            return $this->correct_answer === $studentAnswer;
        }
        // For essay and short_answer, need manual grading
        return null;
    }

    public function getShuffledOptions()
    {
        $options = $this->options;
        if ($this->quiz->randomize_answers && $options) {
            shuffle($options);
        }
        return $options;
    }
}

