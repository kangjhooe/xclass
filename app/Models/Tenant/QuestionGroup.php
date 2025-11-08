<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class QuestionGroup extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'tenant_id',
        'subject_id',
        'created_by',
        'title',
        'description',
        'stimulus_type',
        'stimulus_content',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    const STIMULUS_TYPE_TEXT = 'text';
    const STIMULUS_TYPE_IMAGE = 'image';
    const STIMULUS_TYPE_TABLE = 'table';

    /**
     * Get the tenant that owns the question group
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'tenant_id');
    }

    /**
     * Get the subject
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the creator
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get questions in this group
     */
    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('group_order');
    }

    /**
     * Get questions count
     */
    public function getQuestionsCountAttribute()
    {
        return $this->questions()->count();
    }

    /**
     * Get total points for all questions in group
     */
    public function getTotalPointsAttribute()
    {
        return $this->questions()->sum('points');
    }

    /**
     * Get stimulus type label
     */
    public function getStimulusTypeLabelAttribute()
    {
        return match($this->stimulus_type) {
            self::STIMULUS_TYPE_TEXT => 'Teks',
            self::STIMULUS_TYPE_IMAGE => 'Gambar',
            self::STIMULUS_TYPE_TABLE => 'Tabel',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get stimulus type icon
     */
    public function getStimulusTypeIconAttribute()
    {
        return match($this->stimulus_type) {
            self::STIMULUS_TYPE_TEXT => 'fas fa-file-text',
            self::STIMULUS_TYPE_IMAGE => 'fas fa-image',
            self::STIMULUS_TYPE_TABLE => 'fas fa-table',
            default => 'fas fa-question'
        };
    }

    /**
     * Get stimulus type color
     */
    public function getStimulusTypeColorAttribute()
    {
        return match($this->stimulus_type) {
            self::STIMULUS_TYPE_TEXT => 'primary',
            self::STIMULUS_TYPE_IMAGE => 'success',
            self::STIMULUS_TYPE_TABLE => 'info',
            default => 'secondary'
        };
    }

    /**
     * Get formatted stimulus content for display
     */
    public function getFormattedStimulusContentAttribute()
    {
        switch ($this->stimulus_type) {
            case self::STIMULUS_TYPE_TEXT:
                return nl2br(e($this->stimulus_content));
            
            case self::STIMULUS_TYPE_IMAGE:
                return '<img src="' . e($this->stimulus_content) . '" class="img-fluid" alt="Stimulus Image">';
            
            case self::STIMULUS_TYPE_TABLE:
                $tableData = json_decode($this->stimulus_content, true);
                if (!$tableData) {
                    return $this->stimulus_content;
                }
                
                $html = '<div class="table-responsive"><table class="table table-bordered">';
                
                if (isset($tableData['headers'])) {
                    $html .= '<thead><tr>';
                    foreach ($tableData['headers'] as $header) {
                        $html .= '<th>' . e($header) . '</th>';
                    }
                    $html .= '</tr></thead>';
                }
                
                if (isset($tableData['rows'])) {
                    $html .= '<tbody>';
                    foreach ($tableData['rows'] as $row) {
                        $html .= '<tr>';
                        foreach ($row as $cell) {
                            $html .= '<td>' . e($cell) . '</td>';
                        }
                        $html .= '</tr>';
                    }
                    $html .= '</tbody>';
                }
                
                $html .= '</table></div>';
                return $html;
            
            default:
                return $this->stimulus_content;
        }
    }

    /**
     * Get stimulus preview (truncated)
     */
    public function getStimulusPreviewAttribute()
    {
        switch ($this->stimulus_type) {
            case self::STIMULUS_TYPE_TEXT:
                return strlen($this->stimulus_content) > 100 ? 
                    substr($this->stimulus_content, 0, 100) . '...' : 
                    $this->stimulus_content;
            
            case self::STIMULUS_TYPE_IMAGE:
                return '[Gambar: ' . basename($this->stimulus_content) . ']';
            
            case self::STIMULUS_TYPE_TABLE:
                return '[Tabel dengan data]';
            
            default:
                return $this->stimulus_content;
        }
    }

    /**
     * Check if group has questions
     */
    public function hasQuestions()
    {
        return $this->questions()->count() > 0;
    }

    /**
     * Add question to group
     */
    public function addQuestion(Question $question, $order = null)
    {
        if ($order === null) {
            $order = $this->questions()->max('group_order') + 1;
        }

        $question->update([
            'question_group_id' => $this->id,
            'group_order' => $order
        ]);
    }

    /**
     * Remove question from group
     */
    public function removeQuestion(Question $question)
    {
        $question->update([
            'question_group_id' => null,
            'group_order' => 0
        ]);
    }

    /**
     * Reorder questions in group
     */
    public function reorderQuestions(array $questionIds)
    {
        foreach ($questionIds as $index => $questionId) {
            Question::where('id', $questionId)
                ->where('question_group_id', $this->id)
                ->update(['group_order' => $index + 1]);
        }
    }

    /**
     * Copy question group to another tenant
     */
    public function copyToTenant($tenantId, $creatorId)
    {
        $newGroup = $this->replicate();
        $newGroup->tenant_id = $tenantId;
        $newGroup->created_by = $creatorId;
        $newGroup->save();

        // Copy all questions in the group
        foreach ($this->questions as $question) {
            $newQuestion = $question->copyToTenant($tenantId, $creatorId);
            $newQuestion->update([
                'question_group_id' => $newGroup->id,
                'group_order' => $question->group_order
            ]);
        }

        return $newGroup;
    }

    /**
     * Scope for filtering by stimulus type
     */
    public function scopeByStimulusType($query, $type)
    {
        return $query->where('stimulus_type', $type);
    }

    /**
     * Scope for groups with questions
     */
    public function scopeWithQuestions($query)
    {
        return $query->whereHas('questions');
    }

    /**
     * Scope for groups without questions
     */
    public function scopeWithoutQuestions($query)
    {
        return $query->whereDoesntHave('questions');
    }

    /**
     * Get question group statistics
     */
    public function getStatisticsAttribute()
    {
        $questions = $this->questions();
        
        return [
            'total_questions' => $questions->count(),
            'total_points' => $questions->sum('points'),
            'question_types' => $questions->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'difficulty_distribution' => $questions->selectRaw('difficulty, COUNT(*) as count')
                ->groupBy('difficulty')
                ->pluck('count', 'difficulty')
                ->toArray(),
        ];
    }

    /**
     * Validate question group data
     */
    public function validateGroup()
    {
        $errors = [];

        if (empty($this->title)) {
            $errors[] = 'Judul stimulus tidak boleh kosong';
        }

        if (empty($this->stimulus_content)) {
            $errors[] = 'Konten stimulus tidak boleh kosong';
        }

        if ($this->stimulus_type === self::STIMULUS_TYPE_IMAGE) {
            if (!filter_var($this->stimulus_content, FILTER_VALIDATE_URL) && !file_exists($this->stimulus_content)) {
                $errors[] = 'URL gambar tidak valid';
            }
        }

        if ($this->stimulus_type === self::STIMULUS_TYPE_TABLE) {
            $tableData = json_decode($this->stimulus_content, true);
            if (!$tableData || !isset($tableData['headers']) || !isset($tableData['rows'])) {
                $errors[] = 'Format tabel tidak valid';
            }
        }

        return $errors;
    }
}
