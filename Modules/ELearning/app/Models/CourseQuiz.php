<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseQuiz extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'instansi_id',
        'title',
        'description',
        'instructions',
        'time_limit_minutes',
        'total_questions',
        'max_score',
        'passing_score',
        'max_attempts',
        'show_answers_after_submit',
        'show_correct_answers',
        'randomize_questions',
        'randomize_answers',
        'send_to_gradebook',
        'is_published',
        'available_from',
        'available_until',
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
        'passing_score' => 'decimal:2',
        'show_answers_after_submit' => 'boolean',
        'show_correct_answers' => 'boolean',
        'randomize_questions' => 'boolean',
        'randomize_answers' => 'boolean',
        'send_to_gradebook' => 'boolean',
        'is_published' => 'boolean',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function questions()
    {
        return $this->hasMany(CourseQuizQuestion::class, 'quiz_id')->orderBy('order');
    }

    public function attempts()
    {
        return $this->hasMany(CourseQuizAttempt::class, 'quiz_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where(function($q) use ($now) {
            $q->whereNull('available_from')->orWhere('available_from', '<=', $now);
        })->where(function($q) use ($now) {
            $q->whereNull('available_until')->orWhere('available_until', '>=', $now);
        });
    }

    // Helper methods
    public function isAvailable()
    {
        $now = now();
        if ($this->available_from && $now < $this->available_from) return false;
        if ($this->available_until && $now > $this->available_until) return false;
        return true;
    }

    public function getStudentAttempts($studentId)
    {
        return $this->attempts()->where('student_id', $studentId)->orderBy('created_at', 'desc');
    }

    public function canStudentTake($studentId)
    {
        $attempts = $this->getStudentAttempts($studentId)->count();
        return $attempts < $this->max_attempts;
    }

    public function generateRandomQuestionOrder()
    {
        $questionIds = $this->questions()->pluck('id')->toArray();
        if ($this->randomize_questions) {
            shuffle($questionIds);
        }
        return $questionIds;
    }
}

