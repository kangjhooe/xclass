<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExtracurricularAchievement extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'extracurricular_id',
        'participant_id',
        'student_id',
        'title',
        'description',
        'achievement_date',
        'level',
        'category',
        'position',
        'certificate_file',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'achievement_date' => 'date',
    ];

    const LEVEL_SCHOOL = 'school';
    const LEVEL_DISTRICT = 'district';
    const LEVEL_REGIONAL = 'regional';
    const LEVEL_PROVINCIAL = 'provincial';
    const LEVEL_NATIONAL = 'national';
    const LEVEL_INTERNATIONAL = 'international';

    const CATEGORY_ACADEMIC = 'academic';
    const CATEGORY_SPORTS = 'sports';
    const CATEGORY_ARTS = 'arts';
    const CATEGORY_SOCIAL = 'social';
    const CATEGORY_LEADERSHIP = 'leadership';
    const CATEGORY_OTHER = 'other';

    /**
     * Get the tenant that owns the achievement
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the extracurricular
     */
    public function extracurricular()
    {
        return $this->belongsTo(Extracurricular::class);
    }

    /**
     * Get the participant
     */
    public function participant()
    {
        return $this->belongsTo(ExtracurricularParticipant::class);
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who created the achievement
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by level
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by extracurricular
     */
    public function scopeByExtracurricular($query, $extracurricularId)
    {
        return $query->where('extracurricular_id', $extracurricularId);
    }

    /**
     * Get level label
     */
    public function getLevelLabelAttribute()
    {
        return match($this->level) {
            self::LEVEL_SCHOOL => 'Sekolah',
            self::LEVEL_DISTRICT => 'Kecamatan',
            self::LEVEL_REGIONAL => 'Kabupaten/Kota',
            self::LEVEL_PROVINCIAL => 'Provinsi',
            self::LEVEL_NATIONAL => 'Nasional',
            self::LEVEL_INTERNATIONAL => 'Internasional',
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
            self::CATEGORY_SPORTS => 'Olahraga',
            self::CATEGORY_ARTS => 'Seni',
            self::CATEGORY_SOCIAL => 'Sosial',
            self::CATEGORY_LEADERSHIP => 'Kepemimpinan',
            self::CATEGORY_OTHER => 'Lainnya',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get level color for display
     */
    public function getLevelColorAttribute()
    {
        return match($this->level) {
            self::LEVEL_SCHOOL => 'secondary',
            self::LEVEL_DISTRICT => 'info',
            self::LEVEL_REGIONAL => 'primary',
            self::LEVEL_PROVINCIAL => 'warning',
            self::LEVEL_NATIONAL => 'success',
            self::LEVEL_INTERNATIONAL => 'danger',
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
            self::CATEGORY_SPORTS => 'success',
            self::CATEGORY_ARTS => 'pink',
            self::CATEGORY_SOCIAL => 'primary',
            self::CATEGORY_LEADERSHIP => 'warning',
            self::CATEGORY_OTHER => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Get formatted position
     */
    public function getFormattedPositionAttribute()
    {
        if ($this->position) {
            return "Posisi ke-{$this->position}";
        }
        return 'Tidak ada posisi';
    }

    /**
     * Get achievement level weight for ranking
     */
    public function getLevelWeightAttribute()
    {
        return match($this->level) {
            self::LEVEL_SCHOOL => 1,
            self::LEVEL_DISTRICT => 2,
            self::LEVEL_REGIONAL => 3,
            self::LEVEL_PROVINCIAL => 4,
            self::LEVEL_NATIONAL => 5,
            self::LEVEL_INTERNATIONAL => 6,
            default => 0
        };
    }
}
