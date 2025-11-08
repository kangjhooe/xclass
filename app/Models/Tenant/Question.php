<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Question extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'subject_id',
        'creator_id',
        'question_group_id',
        'group_order',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'explanation',
        'points',
        'difficulty',
        'visibility',
        'origin_tenant_id',
        'shared_at',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'points' => 'integer',
        'group_order' => 'integer',
        'shared_at' => 'datetime',
    ];

    const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_ESSAY = 'essay';
    const TYPE_FILL_BLANK = 'fill_blank';
    const TYPE_MATCHING = 'matching';

    const DIFFICULTY_EASY = 'easy';
    const DIFFICULTY_MEDIUM = 'medium';
    const DIFFICULTY_HARD = 'hard';

    const VISIBILITY_PRIVATE = 'private';
    const VISIBILITY_SHARED = 'shared';

    /**
     * Get the tenant that owns the question
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the subject
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the question group
     */
    public function questionGroup()
    {
        return $this->belongsTo(QuestionGroup::class);
    }

    /**
     * Get the creator
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'creator_id');
    }

    /**
     * Get the origin tenant (for shared questions)
     */
    public function originTenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'origin_tenant_id');
    }

    /**
     * Get exam subjects that use this question
     */
    public function examSubjects()
    {
        return $this->belongsToMany(ExamSubject::class, 'exam_question_pivot', 'question_id', 'exam_subject_id');
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by difficulty
     */
    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    /**
     * Scope for filtering by visibility
     */
    public function scopeByVisibility($query, $visibility)
    {
        return $query->where('visibility', $visibility);
    }

    /**
     * Scope for shared questions
     */
    public function scopeShared($query)
    {
        return $query->where('visibility', self::VISIBILITY_SHARED);
    }

    /**
     * Scope for private questions
     */
    public function scopePrivate($query)
    {
        return $query->where('visibility', self::VISIBILITY_PRIVATE);
    }

    /**
     * Scope for questions accessible by tenant
     */
    public function scopeAccessibleBy($query, $tenantId)
    {
        return $query->where(function ($q) use ($tenantId) {
            $q->where('instansi_id', $tenantId)
              ->orWhere('visibility', self::VISIBILITY_SHARED);
        });
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
     * Get visibility label
     */
    public function getVisibilityLabelAttribute()
    {
        return match($this->visibility) {
            self::VISIBILITY_PRIVATE => 'Private',
            self::VISIBILITY_SHARED => 'Shared',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get visibility color for display
     */
    public function getVisibilityColorAttribute()
    {
        return match($this->visibility) {
            self::VISIBILITY_PRIVATE => 'secondary',
            self::VISIBILITY_SHARED => 'info',
            default => 'secondary'
        };
    }

    /**
     * Check if question is shared
     */
    public function isShared()
    {
        return $this->visibility === self::VISIBILITY_SHARED;
    }

    /**
     * Check if question is private
     */
    public function isPrivate()
    {
        return $this->visibility === self::VISIBILITY_PRIVATE;
    }

    /**
     * Check if question is from another tenant
     */
    public function isFromAnotherTenant()
    {
        return $this->origin_tenant_id && $this->origin_tenant_id !== $this->instansi_id;
    }

    /**
     * Check if question belongs to a group
     */
    public function belongsToGroup()
    {
        return !is_null($this->question_group_id);
    }

    /**
     * Check if question is standalone (not in group)
     */
    public function isStandalone()
    {
        return is_null($this->question_group_id);
    }

    /**
     * Get other questions in the same group
     */
    public function getGroupQuestions()
    {
        if (!$this->belongsToGroup()) {
            return collect();
        }

        return Question::where('question_group_id', $this->question_group_id)
            ->where('id', '!=', $this->id)
            ->orderBy('group_order')
            ->get();
    }

    /**
     * Get all questions in the same group (including this question)
     */
    public function getAllGroupQuestions()
    {
        if (!$this->belongsToGroup()) {
            return collect([$this]);
        }

        return Question::where('question_group_id', $this->question_group_id)
            ->orderBy('group_order')
            ->get();
    }

    /**
     * Share question
     */
    public function share()
    {
        $this->update([
            'visibility' => self::VISIBILITY_SHARED,
            'shared_at' => now(),
        ]);
    }

    /**
     * Unshare question
     */
    public function unshare()
    {
        $this->update([
            'visibility' => self::VISIBILITY_PRIVATE,
            'shared_at' => null,
        ]);
    }

    /**
     * Copy question to another tenant
     */
    public function copyToTenant($tenantId, $creatorId)
    {
        $newQuestion = $this->replicate();
        $newQuestion->instansi_id = $tenantId;
        $newQuestion->creator_id = $creatorId;
        $newQuestion->origin_tenant_id = $this->instansi_id;
        $newQuestion->visibility = self::VISIBILITY_PRIVATE;
        $newQuestion->shared_at = null;
        $newQuestion->question_group_id = null; // Will be set separately if copying group
        $newQuestion->group_order = 0;
        $newQuestion->save();

        return $newQuestion;
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
     * Get formatted options for display
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
