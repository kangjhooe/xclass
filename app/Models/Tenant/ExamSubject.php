<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExamSubject extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'exam_id',
        'subject_id',
        'teacher_id',
        'total_questions',
        'total_score',
        'duration',
        'question_ids',
        'settings',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'total_score' => 'integer',
        'duration' => 'integer',
        'question_ids' => 'array',
        'settings' => 'array',
    ];

    /**
     * Get the tenant that owns the exam subject
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
     * Get questions for this exam subject
     */
    public function questions()
    {
        if (!$this->question_ids) {
            return collect();
        }

        return Question::whereIn('id', $this->question_ids)
            ->accessibleBy($this->instansi_id)
            ->with(['questionGroup'])
            ->get();
    }

    /**
     * Get randomized questions for this exam subject
     */
    public function getRandomizedQuestions($randomizeQuestions = true, $randomizeAnswers = true)
    {
        $questions = $this->questions();
        
        if ($questions->isEmpty()) {
            return collect();
        }

        $randomizationService = app(\App\Services\QuestionRandomizationService::class);
        return $randomizationService->randomizeQuestions($questions, $randomizeQuestions, $randomizeAnswers);
    }

    /**
     * Get question count
     */
    public function getQuestionCountAttribute()
    {
        return is_array($this->question_ids) ? count($this->question_ids) : 0;
    }

    /**
     * Add question to exam subject
     */
    public function addQuestion($questionId)
    {
        $questionIds = $this->question_ids ?? [];
        
        if (!in_array($questionId, $questionIds)) {
            $questionIds[] = $questionId;
            $this->update([
                'question_ids' => $questionIds,
                'total_questions' => count($questionIds)
            ]);
        }
    }

    /**
     * Remove question from exam subject
     */
    public function removeQuestion($questionId)
    {
        $questionIds = $this->question_ids ?? [];
        
        if (($key = array_search($questionId, $questionIds)) !== false) {
            unset($questionIds[$key]);
            $questionIds = array_values($questionIds); // Re-index array
            
            $this->update([
                'question_ids' => $questionIds,
                'total_questions' => count($questionIds)
            ]);
        }
    }

    /**
     * Set questions for exam subject
     */
    public function setQuestions(array $questionIds)
    {
        $this->update([
            'question_ids' => $questionIds,
            'total_questions' => count($questionIds)
        ]);
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
     * Get question distribution by type
     */
    public function getQuestionDistributionAttribute()
    {
        $questions = $this->questions();
        $distribution = [];

        foreach ($questions as $question) {
            $type = $question->type;
            if (!isset($distribution[$type])) {
                $distribution[$type] = 0;
            }
            $distribution[$type]++;
        }

        return $distribution;
    }

    /**
     * Get question distribution by difficulty
     */
    public function getDifficultyDistributionAttribute()
    {
        $questions = $this->questions();
        $distribution = [];

        foreach ($questions as $question) {
            $difficulty = $question->difficulty;
            if (!isset($distribution[$difficulty])) {
                $distribution[$difficulty] = 0;
            }
            $distribution[$difficulty]++;
        }

        return $distribution;
    }

    /**
     * Calculate total score from questions
     */
    public function calculateTotalScore()
    {
        $questions = $this->questions();
        $totalScore = $questions->sum('points');
        
        $this->update(['total_score' => $totalScore]);
        
        return $totalScore;
    }

    /**
     * Validate exam subject configuration
     */
    public function validateConfiguration()
    {
        $errors = [];

        if ($this->total_questions <= 0) {
            $errors[] = 'Total soal harus lebih dari 0';
        }

        if ($this->total_score <= 0) {
            $errors[] = 'Total skor harus lebih dari 0';
        }

        if ($this->duration <= 0) {
            $errors[] = 'Durasi harus lebih dari 0';
        }

        $questions = $this->questions();
        if ($questions->count() !== $this->total_questions) {
            $errors[] = 'Jumlah soal tidak sesuai dengan konfigurasi';
        }

        $calculatedScore = $questions->sum('points');
        if ($calculatedScore !== $this->total_score) {
            $errors[] = 'Total skor tidak sesuai dengan poin soal';
        }

        return $errors;
    }

    /**
     * Get exam attempts for this subject
     */
    public function attempts()
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id', 'exam_id')
            ->where('subject_id', $this->subject_id);
    }

    /**
     * Get statistics for this exam subject
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
                ->where('score', '>=', $this->total_score * 0.7)->count(), // Assuming 70% passing rate
        ];
    }
}
