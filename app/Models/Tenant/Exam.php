<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Exam extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'title',
        'description',
        'exam_type',
        'semester',
        'academic_year',
        'start_time',
        'end_time',
        'status',
        'instructions',
        'settings',
        'created_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'settings' => 'array',
    ];

    const TYPE_QUIZ = 'quiz';
    const TYPE_MIDTERM = 'midterm';
    const TYPE_FINAL = 'final';
    const TYPE_ASSIGNMENT = 'assignment';

    const STATUS_DRAFT = 'draft';
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the exam
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get subjects for this exam through exam_subjects
     */
    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'exam_subjects', 'exam_id', 'subject_id');
    }

    /**
     * Get class rooms for this exam through exam_schedules
     */
    public function classRooms()
    {
        return $this->belongsToMany(ClassRoom::class, 'exam_schedules', 'exam_id', 'class_id');
    }

    /**
     * Get the first subject for this exam (accessor for backward compatibility)
     */
    public function getSubjectAttribute()
    {
        return $this->subjects->first();
    }

    /**
     * Get the first class room for this exam (accessor for backward compatibility)
     */
    public function getClassRoomAttribute()
    {
        return $this->classRooms->first();
    }

    /**
     * Get exam schedules
     */
    public function schedules()
    {
        return $this->hasMany(ExamSchedule::class);
    }

    /**
     * Get exam subjects
     */
    public function examSubjects()
    {
        return $this->hasMany(ExamSubject::class);
    }

    /**
     * Get grade adjustments
     */
    public function gradeAdjustments()
    {
        return $this->hasMany(GradeAdjustment::class);
    }

    /**
     * Get exam attempts
     */
    public function attempts()
    {
        return $this->hasMany(ExamAttempt::class);
    }

    /**
     * Get all questions from exam subjects
     */
    public function getAllQuestions()
    {
        $questionIds = [];
        foreach ($this->examSubjects as $examSubject) {
            if ($examSubject->question_ids) {
                $questionIds = array_merge($questionIds, $examSubject->question_ids);
            }
        }
        
        return Question::whereIn('id', $questionIds)->get();
    }

    /**
     * Get total questions count
     */
    public function getTotalQuestionsAttribute()
    {
        return $this->examSubjects->sum('total_questions');
    }

    /**
     * Get total score
     */
    public function getTotalScoreAttribute()
    {
        return $this->examSubjects->sum('total_score');
    }

    /**
     * Get total duration
     */
    public function getTotalDurationAttribute()
    {
        return $this->examSubjects->sum('duration');
    }

    /**
     * Get the user who created the exam
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('exam_type', $type);
    }

    /**
     * Scope for active exams
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_ONGOING]);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->exam_type) {
            self::TYPE_QUIZ => 'Kuis',
            self::TYPE_MIDTERM => 'UTS',
            self::TYPE_FINAL => 'UAS',
            self::TYPE_ASSIGNMENT => 'Tugas',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Draft',
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
            self::STATUS_DRAFT => 'secondary',
            self::STATUS_SCHEDULED => 'info',
            self::STATUS_ONGOING => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if exam is active
     */
    public function isActive()
    {
        return in_array($this->status, [self::STATUS_SCHEDULED, self::STATUS_ONGOING]);
    }

    /**
     * Check if exam is ongoing
     */
    public function isOngoing()
    {
        return $this->status === self::STATUS_ONGOING;
    }

    /**
     * Check if exam is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
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
     * Get exam statistics
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

    /**
     * Start exam
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_ONGOING]);
    }

    /**
     * Complete exam
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Cancel exam
     */
    public function cancel()
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Check if exam is currently available for students
     */
    public function isAvailable()
    {
        $now = now();
        return $this->status === self::STATUS_SCHEDULED && 
               $now->between($this->start_time, $this->end_time);
    }

    /**
     * Check if exam has ended
     */
    public function hasEnded()
    {
        return now()->isAfter($this->end_time);
    }

    /**
     * Check if exam is scheduled for future
     */
    public function isScheduled()
    {
        return now()->isBefore($this->start_time);
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
     * Get exam statistics with detailed analysis
     */
    public function getDetailedStatistics()
    {
        $attempts = $this->attempts()->where('status', ExamAttempt::STATUS_COMPLETED);
        $totalAttempts = $attempts->count();
        
        if ($totalAttempts === 0) {
            return [
                'total_attempts' => 0,
                'completed_attempts' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'score_distribution' => [],
                'difficulty_analysis' => [],
                'time_analysis' => []
            ];
        }

        $scores = $attempts->pluck('score')->toArray();
        $times = $attempts->pluck('time_spent')->toArray();
        
        return [
            'total_attempts' => $totalAttempts,
            'completed_attempts' => $totalAttempts,
            'average_score' => round(array_sum($scores) / count($scores), 2),
            'highest_score' => max($scores),
            'lowest_score' => min($scores),
            'pass_rate' => round(($attempts->where('score', '>=', $this->passing_score)->count() / $totalAttempts) * 100, 2),
            'score_distribution' => $this->getScoreDistribution($scores),
            'difficulty_analysis' => $this->getDifficultyAnalysis(),
            'time_analysis' => $this->getTimeAnalysis($times)
        ];
    }

    /**
     * Get score distribution
     */
    private function getScoreDistribution($scores)
    {
        $ranges = [
            '0-20' => 0,
            '21-40' => 0,
            '41-60' => 0,
            '61-80' => 0,
            '81-100' => 0
        ];

        foreach ($scores as $score) {
            $percentage = ($score / $this->total_score) * 100;
            if ($percentage <= 20) $ranges['0-20']++;
            elseif ($percentage <= 40) $ranges['21-40']++;
            elseif ($percentage <= 60) $ranges['41-60']++;
            elseif ($percentage <= 80) $ranges['61-80']++;
            else $ranges['81-100']++;
        }

        return $ranges;
    }

    /**
     * Get difficulty analysis
     */
    private function getDifficultyAnalysis()
    {
        $questions = $this->questions()->with('answers')->get();
        $analysis = [];

        foreach ($questions as $question) {
            $totalAnswers = $question->answers()->count();
            $correctAnswers = $question->answers()->where('is_correct', true)->count();
            $difficulty = $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 2) : 0;
            
            $analysis[] = [
                'question_id' => $question->id,
                'difficulty_level' => $question->difficulty,
                'success_rate' => $difficulty,
                'total_attempts' => $totalAnswers
            ];
        }

        return $analysis;
    }

    /**
     * Get time analysis
     */
    private function getTimeAnalysis($times)
    {
        if (empty($times)) {
            return [
                'average_time' => 0,
                'fastest_time' => 0,
                'slowest_time' => 0,
                'time_distribution' => []
            ];
        }

        $averageTime = round(array_sum($times) / count($times), 2);
        $fastestTime = min($times);
        $slowestTime = max($times);

        // Convert to minutes for distribution
        $timeRanges = [
            '0-30 min' => 0,
            '30-60 min' => 0,
            '60-90 min' => 0,
            '90+ min' => 0
        ];

        foreach ($times as $time) {
            $minutes = $time / 60;
            if ($minutes <= 30) $timeRanges['0-30 min']++;
            elseif ($minutes <= 60) $timeRanges['30-60 min']++;
            elseif ($minutes <= 90) $timeRanges['60-90 min']++;
            else $timeRanges['90+ min']++;
        }

        return [
            'average_time' => $averageTime,
            'fastest_time' => $fastestTime,
            'slowest_time' => $slowestTime,
            'time_distribution' => $timeRanges
        ];
    }

    /**
     * Generate random question order for student
     */
    public function generateRandomQuestionOrder()
    {
        $questions = $this->getAllQuestions();
        
        // Use QuestionRandomizationService to maintain group integrity
        $randomizationService = app(\App\Services\QuestionRandomizationService::class);
        $randomizedQuestions = $randomizationService->randomizeQuestions(
            $questions, 
            $this->randomize_questions ?? false, 
            $this->randomize_answers ?? false
        );
        
        return $randomizedQuestions->pluck('id')->toArray();
    }

    /**
     * Generate random answer order for question
     */
    public function generateRandomAnswerOrder($question)
    {
        if (!$this->randomize_answers || $question->question_type !== ExamQuestion::TYPE_MULTIPLE_CHOICE) {
            return $question->options;
        }

        $options = $question->options;
        $keys = array_keys($options);
        shuffle($keys);
        
        $randomized = [];
        foreach ($keys as $key) {
            $randomized[$key] = $options[$key];
        }
        
        return $randomized;
    }
}
