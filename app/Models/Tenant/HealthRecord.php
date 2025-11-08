<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class HealthRecord extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'record_type',
        'record_date',
        'height',
        'weight',
        'blood_pressure',
        'temperature',
        'pulse',
        'vision_left',
        'vision_right',
        'hearing_left',
        'hearing_right',
        'dental_condition',
        'general_condition',
        'complaints',
        'diagnosis',
        'treatment',
        'medication',
        'follow_up_required',
        'follow_up_date',
        'notes',
        'examiner',
        'created_by',
    ];

    protected $casts = [
        'record_date' => 'date',
        'follow_up_date' => 'date',
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
        'temperature' => 'decimal:1',
        'follow_up_required' => 'boolean',
    ];

    const TYPE_ROUTINE = 'routine';
    const TYPE_EMERGENCY = 'emergency';
    const TYPE_VACCINATION = 'vaccination';
    const TYPE_DENTAL = 'dental';
    const TYPE_VISION = 'vision';
    const TYPE_HEARING = 'hearing';
    const TYPE_SPORTS = 'sports';

    /**
     * Get the tenant that owns the record
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
     * Get the user who created the record
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
        return $query->where('record_type', $type);
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
        return match($this->record_type) {
            self::TYPE_ROUTINE => 'Rutin',
            self::TYPE_EMERGENCY => 'Darurat',
            self::TYPE_VACCINATION => 'Vaksinasi',
            self::TYPE_DENTAL => 'Gigi',
            self::TYPE_VISION => 'Penglihatan',
            self::TYPE_HEARING => 'Pendengaran',
            self::TYPE_SPORTS => 'Olahraga',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get BMI calculation
     */
    public function getBmiAttribute()
    {
        if ($this->height && $this->weight) {
            $heightInMeters = $this->height / 100;
            return round($this->weight / ($heightInMeters * $heightInMeters), 2);
        }
        return null;
    }

    /**
     * Get BMI category
     */
    public function getBmiCategoryAttribute()
    {
        $bmi = $this->bmi;
        if (!$bmi) return null;

        if ($bmi < 18.5) return 'Underweight';
        if ($bmi < 25) return 'Normal';
        if ($bmi < 30) return 'Overweight';
        return 'Obese';
    }

    /**
     * Get formatted height
     */
    public function getFormattedHeightAttribute()
    {
        return $this->height ? $this->height . ' cm' : '-';
    }

    /**
     * Get formatted weight
     */
    public function getFormattedWeightAttribute()
    {
        return $this->weight ? $this->weight . ' kg' : '-';
    }

    /**
     * Get formatted temperature
     */
    public function getFormattedTemperatureAttribute()
    {
        return $this->temperature ? $this->temperature . '°C' : '-';
    }

    /**
     * Check if follow-up is required
     */
    public function requiresFollowUp()
    {
        return $this->follow_up_required && $this->follow_up_date;
    }
}
