<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CounselingSession extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'counselor_id',
        'session_date',
        'session_type',
        'category',
        'title',
        'description',
        'issues',
        'goals',
        'interventions',
        'outcomes',
        'follow_up_required',
        'follow_up_date',
        'status',
        'confidentiality_level',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'session_date' => 'datetime',
        'follow_up_date' => 'date',
        'issues' => 'array',
        'goals' => 'array',
        'interventions' => 'array',
        'outcomes' => 'array',
        'follow_up_required' => 'boolean',
    ];

    const TYPE_INDIVIDUAL = 'individual';
    const TYPE_GROUP = 'group';
    const TYPE_FAMILY = 'family';
    const TYPE_CRISIS = 'crisis';

    const CATEGORY_ACADEMIC = 'academic';
    const CATEGORY_BEHAVIORAL = 'behavioral';
    const CATEGORY_EMOTIONAL = 'emotional';
    const CATEGORY_SOCIAL = 'social';
    const CATEGORY_CAREER = 'career';
    const CATEGORY_PERSONAL = 'personal';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW = 'no_show';

    const CONFIDENTIALITY_LOW = 'low';
    const CONFIDENTIALITY_MEDIUM = 'medium';
    const CONFIDENTIALITY_HIGH = 'high';

    /**
     * Get the tenant that owns the session
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the counselor
     */
    public function counselor()
    {
        return $this->belongsTo(Teacher::class, 'counselor_id');
    }

    /**
     * Get the user who created the session
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('session_type', $type);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by counselor
     */
    public function scopeByCounselor($query, $counselorId)
    {
        return $query->where('counselor_id', $counselorId);
    }

    /**
     * Scope for filtering by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->session_type) {
            self::TYPE_INDIVIDUAL => 'Individu',
            self::TYPE_GROUP => 'Kelompok',
            self::TYPE_FAMILY => 'Keluarga',
            self::TYPE_CRISIS => 'Krisis',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            self::CATEGORY_ACADEMIC => 'Akademik',
            self::CATEGORY_BEHAVIORAL => 'Perilaku',
            self::CATEGORY_EMOTIONAL => 'Emosional',
            self::CATEGORY_SOCIAL => 'Sosial',
            self::CATEGORY_CAREER => 'Karir',
            self::CATEGORY_PERSONAL => 'Personal',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'Terjadwal',
            self::STATUS_IN_PROGRESS => 'Sedang Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            self::STATUS_NO_SHOW => 'Tidak Hadir',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get confidentiality level label
     */
    public function getConfidentialityLabelAttribute()
    {
        return match($this->confidentiality_level) {
            self::CONFIDENTIALITY_LOW => 'Rendah',
            self::CONFIDENTIALITY_MEDIUM => 'Sedang',
            self::CONFIDENTIALITY_HIGH => 'Tinggi',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'info',
            self::STATUS_IN_PROGRESS => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            self::STATUS_NO_SHOW => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get category color for display
     */
    public function getCategoryColorAttribute()
    {
        return match($this->category) {
            self::CATEGORY_ACADEMIC => 'info',
            self::CATEGORY_BEHAVIORAL => 'warning',
            self::CATEGORY_EMOTIONAL => 'pink',
            self::CATEGORY_SOCIAL => 'primary',
            self::CATEGORY_CAREER => 'success',
            self::CATEGORY_PERSONAL => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Check if session is scheduled
     */
    public function isScheduled()
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if session is in progress
     */
    public function isInProgress()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if session is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if follow-up is required
     */
    public function requiresFollowUp()
    {
        return $this->follow_up_required && $this->follow_up_date;
    }

    /**
     * Start session
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_IN_PROGRESS]);
    }

    /**
     * Complete session
     */
    public function complete($outcomes = null)
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'outcomes' => $outcomes,
        ]);
    }

    /**
     * Cancel session
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }

    /**
     * Mark as no show
     */
    public function markNoShow()
    {
        $this->update(['status' => self::STATUS_NO_SHOW]);
    }
}
