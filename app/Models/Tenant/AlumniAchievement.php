<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class AlumniAchievement extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'alumni_id',
        'title',
        'description',
        'achievement_date',
        'category',
        'level',
        'organization',
        'certificate_file',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'achievement_date' => 'date',
    ];

    const CATEGORY_ACADEMIC = 'academic';
    const CATEGORY_CAREER = 'career';
    const CATEGORY_SOCIAL = 'social';
    const CATEGORY_SPORTS = 'sports';
    const CATEGORY_ARTS = 'arts';
    const CATEGORY_LEADERSHIP = 'leadership';
    const CATEGORY_OTHER = 'other';

    const LEVEL_LOCAL = 'local';
    const LEVEL_REGIONAL = 'regional';
    const LEVEL_NATIONAL = 'national';
    const LEVEL_INTERNATIONAL = 'international';

    /**
     * Get the tenant that owns the achievement
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the alumni
     */
    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }

    /**
     * Get the user who created the achievement
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by level
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            self::CATEGORY_ACADEMIC => 'Akademik',
            self::CATEGORY_CAREER => 'Karir',
            self::CATEGORY_SOCIAL => 'Sosial',
            self::CATEGORY_SPORTS => 'Olahraga',
            self::CATEGORY_ARTS => 'Seni',
            self::CATEGORY_LEADERSHIP => 'Kepemimpinan',
            self::CATEGORY_OTHER => 'Lainnya',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get level label
     */
    public function getLevelLabelAttribute()
    {
        return match($this->level) {
            self::LEVEL_LOCAL => 'Lokal',
            self::LEVEL_REGIONAL => 'Regional',
            self::LEVEL_NATIONAL => 'Nasional',
            self::LEVEL_INTERNATIONAL => 'Internasional',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get category color for display
     */
    public function getCategoryColorAttribute()
    {
        return match($this->category) {
            self::CATEGORY_ACADEMIC => 'info',
            self::CATEGORY_CAREER => 'success',
            self::CATEGORY_SOCIAL => 'primary',
            self::CATEGORY_SPORTS => 'warning',
            self::CATEGORY_ARTS => 'pink',
            self::CATEGORY_LEADERSHIP => 'dark',
            self::CATEGORY_OTHER => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Get level color for display
     */
    public function getLevelColorAttribute()
    {
        return match($this->level) {
            self::LEVEL_LOCAL => 'secondary',
            self::LEVEL_REGIONAL => 'info',
            self::LEVEL_NATIONAL => 'success',
            self::LEVEL_INTERNATIONAL => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Get achievement level weight for ranking
     */
    public function getLevelWeightAttribute()
    {
        return match($this->level) {
            self::LEVEL_LOCAL => 1,
            self::LEVEL_REGIONAL => 2,
            self::LEVEL_NATIONAL => 3,
            self::LEVEL_INTERNATIONAL => 4,
            default => 0
        };
    }
}
