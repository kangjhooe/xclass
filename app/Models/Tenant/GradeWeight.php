<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class GradeWeight extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'assignment_type',
        'assignment_label',
        'weight_percentage',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'weight_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    const ASSIGNMENT_TASK = 'tugas';
    const ASSIGNMENT_UTS = 'uts';
    const ASSIGNMENT_UAS = 'uas';
    const ASSIGNMENT_QUIZ = 'quiz';
    const ASSIGNMENT_PROJECT = 'project';

    /**
     * Get the tenant (instansi) for this grade weight
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Scope for active grade weights
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific assignment type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('assignment_type', $type);
    }

    /**
     * Get assignment type options
     */
    public static function getAssignmentTypes()
    {
        return [
            self::ASSIGNMENT_TASK => 'Tugas',
            self::ASSIGNMENT_UTS => 'UTS',
            self::ASSIGNMENT_UAS => 'UAS',
            self::ASSIGNMENT_QUIZ => 'Kuis',
            self::ASSIGNMENT_PROJECT => 'Proyek',
        ];
    }

    /**
     * Get default grade weights for new tenant
     */
    public static function getDefaultWeights()
    {
        return [
            [
                'assignment_type' => self::ASSIGNMENT_TASK,
                'assignment_label' => 'Tugas',
                'weight_percentage' => 40.00,
            ],
            [
                'assignment_type' => self::ASSIGNMENT_UTS,
                'assignment_label' => 'UTS',
                'weight_percentage' => 30.00,
            ],
            [
                'assignment_type' => self::ASSIGNMENT_UAS,
                'assignment_label' => 'UAS',
                'weight_percentage' => 30.00,
            ],
        ];
    }
}
