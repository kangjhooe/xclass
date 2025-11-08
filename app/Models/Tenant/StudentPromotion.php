<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class StudentPromotion extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'student_id',
        'from_class_id',
        'to_class_id',
        'from_academic_year_id',
        'to_academic_year_id',
        'semester',
        'status',
        'type',
        'reason',
        'notes',
        'final_average',
        'approved_by',
        'approved_at',
        'completed_at',
        'created_by',
        'instansi_id',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'final_average' => 'decimal:2',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const TYPE_PROMOTION = 'promotion'; // Naik kelas
    const TYPE_REPEAT = 'repeat'; // Tidak naik kelas / tinggal kelas
    const TYPE_TRANSFER = 'transfer'; // Pindah kelas (bukan naik/tidak naik)

    /**
     * Get the tenant (instansi) for this promotion
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
     * Get the from class
     */
    public function fromClass()
    {
        return $this->belongsTo(ClassRoom::class, 'from_class_id');
    }

    /**
     * Get the to class
     */
    public function toClass()
    {
        return $this->belongsTo(ClassRoom::class, 'to_class_id');
    }

    /**
     * Get the from academic year
     */
    public function fromAcademicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'from_academic_year_id');
    }

    /**
     * Get the to academic year
     */
    public function toAcademicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'to_academic_year_id');
    }

    /**
     * Get the user who approved this promotion
     */
    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    /**
     * Get the user who created this promotion
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for pending promotions
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for approved promotions
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for completed promotions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for promotions by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for promotions by academic year
     */
    public function scopeByAcademicYear($query, $academicYearId)
    {
        return $query->where('from_academic_year_id', $academicYearId);
    }
}
