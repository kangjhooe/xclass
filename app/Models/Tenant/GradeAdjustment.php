<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class GradeAdjustment extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'exam_id',
        'user_id',
        'role',
        'adjustment_type',
        'before_value',
        'after_value',
        'applied_to',
        'note',
        'adjustment_data',
    ];

    protected $casts = [
        'before_value' => 'decimal:2',
        'after_value' => 'decimal:2',
        'adjustment_data' => 'array',
    ];

    const ROLE_ADMIN = 'admin';
    const ROLE_TEACHER = 'teacher';

    const TYPE_PERCENT = 'percent';
    const TYPE_MINIMUM = 'minimum';
    const TYPE_MANUAL = 'manual';

    /**
     * Get the exam
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the user who made the adjustment
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the student whose grade was adjusted
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'applied_to');
    }

    /**
     * Get role label
     */
    public function getRoleLabelAttribute()
    {
        return match($this->role) {
            self::ROLE_ADMIN => 'Admin',
            self::ROLE_TEACHER => 'Guru',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get adjustment type label
     */
    public function getAdjustmentTypeLabelAttribute()
    {
        return match($this->adjustment_type) {
            self::TYPE_PERCENT => 'Persentase',
            self::TYPE_MINIMUM => 'Nilai Minimum',
            self::TYPE_MANUAL => 'Manual',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get adjustment type color
     */
    public function getAdjustmentTypeColorAttribute()
    {
        return match($this->adjustment_type) {
            self::TYPE_PERCENT => 'info',
            self::TYPE_MINIMUM => 'warning',
            self::TYPE_MANUAL => 'primary',
            default => 'secondary'
        };
    }

    /**
     * Get the difference between before and after values
     */
    public function getDifferenceAttribute()
    {
        return $this->after_value - $this->before_value;
    }

    /**
     * Get the percentage change
     */
    public function getPercentageChangeAttribute()
    {
        if ($this->before_value == 0) {
            return 0;
        }
        
        return round((($this->after_value - $this->before_value) / $this->before_value) * 100, 2);
    }

    /**
     * Check if adjustment increased the grade
     */
    public function isIncrease()
    {
        return $this->after_value > $this->before_value;
    }

    /**
     * Check if adjustment decreased the grade
     */
    public function isDecrease()
    {
        return $this->after_value < $this->before_value;
    }

    /**
     * Check if adjustment kept the grade the same
     */
    public function isNoChange()
    {
        return $this->after_value == $this->before_value;
    }

    /**
     * Scope for filtering by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for filtering by adjustment type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('adjustment_type', $type);
    }

    /**
     * Scope for filtering by exam
     */
    public function scopeByExam($query, $examId)
    {
        return $query->where('exam_id', $examId);
    }

    /**
     * Scope for filtering by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('applied_to', $studentId);
    }

    /**
     * Scope for recent adjustments
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get formatted adjustment description
     */
    public function getFormattedDescriptionAttribute()
    {
        $difference = $this->difference;
        $sign = $difference > 0 ? '+' : '';
        
        return match($this->adjustment_type) {
            self::TYPE_PERCENT => "Nilai diubah {$sign}{$difference} poin ({$this->percentage_change}%)",
            self::TYPE_MINIMUM => "Nilai minimum diterapkan: {$this->before_value} → {$this->after_value}",
            self::TYPE_MANUAL => "Nilai diubah manual: {$this->before_value} → {$this->after_value}",
            default => "Nilai diubah: {$this->before_value} → {$this->after_value}"
        };
    }
}
