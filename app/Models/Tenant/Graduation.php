<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Graduation extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'graduation_year',
        'graduation_date',
        'final_grade',
        'gpa',
        'rank',
        'achievements',
        'certificate_number',
        'certificate_file',
        'transcript_file',
        'status',
        'graduation_ceremony_date',
        'graduation_ceremony_venue',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'graduation_date' => 'date',
        'graduation_ceremony_date' => 'date',
        'final_grade' => 'decimal:2',
        'gpa' => 'decimal:2',
        'rank' => 'integer',
        'achievements' => 'array',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_GRADUATED = 'graduated';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the graduation
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
     * Get the user who created the graduation
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
     * Scope for filtering by graduation year
     */
    public function scopeByYear($query, $year)
    {
        return $query->where('graduation_year', $year);
    }

    /**
     * Scope for graduated students
     */
    public function scopeGraduated($query)
    {
        return $query->where('status', self::STATUS_GRADUATED);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_GRADUATED => 'Lulus',
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
            self::STATUS_PENDING => 'warning',
            self::STATUS_APPROVED => 'info',
            self::STATUS_GRADUATED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if student is graduated
     */
    public function isGraduated()
    {
        return $this->status === self::STATUS_GRADUATED;
    }

    /**
     * Check if graduation is approved
     */
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Get grade label
     */
    public function getGradeLabelAttribute()
    {
        if ($this->final_grade >= 90) return 'A';
        if ($this->final_grade >= 80) return 'B';
        if ($this->final_grade >= 70) return 'C';
        if ($this->final_grade >= 60) return 'D';
        return 'E';
    }

    /**
     * Get grade color
     */
    public function getGradeColorAttribute()
    {
        if ($this->final_grade >= 90) return 'success';
        if ($this->final_grade >= 80) return 'info';
        if ($this->final_grade >= 70) return 'warning';
        if ($this->final_grade >= 60) return 'danger';
        return 'dark';
    }

    /**
     * Get formatted rank
     */
    public function getFormattedRankAttribute()
    {
        if ($this->rank) {
            return "Peringkat ke-{$this->rank}";
        }
        return 'Tidak ada peringkat';
    }

    /**
     * Get total achievements count
     */
    public function getTotalAchievementsAttribute()
    {
        return count($this->achievements ?? []);
    }

    /**
     * Approve graduation
     */
    public function approve()
    {
        $this->update(['status' => self::STATUS_APPROVED]);
    }

    /**
     * Mark as graduated
     */
    public function markGraduated()
    {
        $this->update(['status' => self::STATUS_GRADUATED]);
    }

    /**
     * Cancel graduation
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }
}
