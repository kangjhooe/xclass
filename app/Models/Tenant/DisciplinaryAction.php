<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class DisciplinaryAction extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'violation_type',
        'violation_category',
        'description',
        'violation_date',
        'location',
        'witnesses',
        'reported_by',
        'severity_level',
        'sanction_type',
        'sanction_description',
        'sanction_duration',
        'sanction_start_date',
        'sanction_end_date',
        'status',
        'parent_notified',
        'parent_notification_date',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'violation_date' => 'date',
        'sanction_start_date' => 'date',
        'sanction_end_date' => 'date',
        'parent_notification_date' => 'date',
        'approved_at' => 'datetime',
        'witnesses' => 'array',
        'parent_notified' => 'boolean',
    ];

    const VIOLATION_TYPE_MINOR = 'minor';
    const VIOLATION_TYPE_MODERATE = 'moderate';
    const VIOLATION_TYPE_MAJOR = 'major';
    const VIOLATION_TYPE_SEVERE = 'severe';

    const VIOLATION_CATEGORY_ACADEMIC = 'academic';
    const VIOLATION_CATEGORY_BEHAVIOR = 'behavior';
    const VIOLATION_CATEGORY_ATTENDANCE = 'attendance';
    const VIOLATION_CATEGORY_DRESS_CODE = 'dress_code';
    const VIOLATION_CATEGORY_SAFETY = 'safety';
    const VIOLATION_CATEGORY_OTHER = 'other';

    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_CRITICAL = 'critical';

    const SANCTION_TYPE_WARNING = 'warning';
    const SANCTION_TYPE_REPRIMAND = 'reprimand';
    const SANCTION_TYPE_DETENTION = 'detention';
    const SANCTION_TYPE_SUSPENSION = 'suspension';
    const SANCTION_TYPE_EXPULSION = 'expulsion';
    const SANCTION_TYPE_COMMUNITY_SERVICE = 'community_service';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the action
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
     * Get the user who reported the violation
     */
    public function reporter()
    {
        return $this->belongsTo(\App\Models\User::class, 'reported_by');
    }

    /**
     * Get the user who created the action
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who approved the action
     */
    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    /**
     * Scope for filtering by violation type
     */
    public function scopeByViolationType($query, $type)
    {
        return $query->where('violation_type', $type);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('violation_category', $category);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity_level', $severity);
    }

    /**
     * Scope for active sanctions
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get violation type label
     */
    public function getViolationTypeLabelAttribute()
    {
        return match($this->violation_type) {
            self::VIOLATION_TYPE_MINOR => 'Ringan',
            self::VIOLATION_TYPE_MODERATE => 'Sedang',
            self::VIOLATION_TYPE_MAJOR => 'Berat',
            self::VIOLATION_TYPE_SEVERE => 'Sangat Berat',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get violation category label
     */
    public function getViolationCategoryLabelAttribute()
    {
        return match($this->violation_category) {
            self::VIOLATION_CATEGORY_ACADEMIC => 'Akademik',
            self::VIOLATION_CATEGORY_BEHAVIOR => 'Perilaku',
            self::VIOLATION_CATEGORY_ATTENDANCE => 'Kehadiran',
            self::VIOLATION_CATEGORY_DRESS_CODE => 'Seragam',
            self::VIOLATION_CATEGORY_SAFETY => 'Keamanan',
            self::VIOLATION_CATEGORY_OTHER => 'Lainnya',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get severity level label
     */
    public function getSeverityLabelAttribute()
    {
        return match($this->severity_level) {
            self::SEVERITY_LOW => 'Rendah',
            self::SEVERITY_MEDIUM => 'Sedang',
            self::SEVERITY_HIGH => 'Tinggi',
            self::SEVERITY_CRITICAL => 'Kritis',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get sanction type label
     */
    public function getSanctionTypeLabelAttribute()
    {
        return match($this->sanction_type) {
            self::SANCTION_TYPE_WARNING => 'Peringatan',
            self::SANCTION_TYPE_REPRIMAND => 'Teguran',
            self::SANCTION_TYPE_DETENTION => 'Hukuman',
            self::SANCTION_TYPE_SUSPENSION => 'Skorsing',
            self::SANCTION_TYPE_EXPULSION => 'Dikeluarkan',
            self::SANCTION_TYPE_COMMUNITY_SERVICE => 'Layanan Masyarakat',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get violation type color for display
     */
    public function getViolationTypeColorAttribute()
    {
        return match($this->violation_type) {
            self::VIOLATION_TYPE_MINOR => 'success',
            self::VIOLATION_TYPE_MODERATE => 'warning',
            self::VIOLATION_TYPE_MAJOR => 'danger',
            self::VIOLATION_TYPE_SEVERE => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get severity color for display
     */
    public function getSeverityColorAttribute()
    {
        return match($this->severity_level) {
            self::SEVERITY_LOW => 'success',
            self::SEVERITY_MEDIUM => 'warning',
            self::SEVERITY_HIGH => 'danger',
            self::SEVERITY_CRITICAL => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_APPROVED => 'info',
            self::STATUS_ACTIVE => 'primary',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if action is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if action is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if action is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if sanction is currently active
     */
    public function isSanctionActive()
    {
        if (!$this->sanction_start_date || !$this->sanction_end_date) {
            return false;
        }

        $today = now()->toDateString();
        return $today >= $this->sanction_start_date && $today <= $this->sanction_end_date;
    }

    /**
     * Get sanction duration in days
     */
    public function getSanctionDurationAttribute()
    {
        if ($this->sanction_start_date && $this->sanction_end_date) {
            return $this->sanction_start_date->diffInDays($this->sanction_end_date);
        }
        return 0;
    }

    /**
     * Get remaining sanction days
     */
    public function getRemainingSanctionDaysAttribute()
    {
        if (!$this->isSanctionActive()) {
            return 0;
        }

        $today = now()->toDateString();
        return $this->sanction_end_date->diffInDays($today);
    }

    /**
     * Approve action
     */
    public function approve($approvedBy)
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    /**
     * Activate sanction
     */
    public function activate()
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    /**
     * Complete sanction
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Cancel action
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }
}
