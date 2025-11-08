<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Alumni extends Model
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
        'current_occupation',
        'company',
        'position',
        'industry',
        'salary_range',
        'address',
        'phone',
        'email',
        'social_media',
        'achievements',
        'career_highlights',
        'education_after_graduation',
        'status',
        'is_active',
        'last_contact_date',
        'notes',
    ];

    protected $casts = [
        'graduation_date' => 'date',
        'final_grade' => 'decimal:2',
        'gpa' => 'decimal:2',
        'rank' => 'integer',
        'is_active' => 'boolean',
        'last_contact_date' => 'date',
        'social_media' => 'array',
        'achievements' => 'array',
        'career_highlights' => 'array',
        'education_after_graduation' => 'array',
    ];

    const STATUS_EMPLOYED = 'employed';
    const STATUS_UNEMPLOYED = 'unemployed';
    const STATUS_SELF_EMPLOYED = 'self_employed';
    const STATUS_STUDYING = 'studying';
    const STATUS_RETIRED = 'retired';
    const STATUS_UNKNOWN = 'unknown';

    /**
     * Get the tenant that owns the alumni
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
     * Get alumni achievements
     */
    public function achievements()
    {
        return $this->hasMany(AlumniAchievement::class);
    }

    /**
     * Get alumni events
     */
    public function events()
    {
        return $this->belongsToMany(Event::class, 'alumni_events', 'alumni_id', 'event_id')
                    ->withPivot('attended', 'created_at')
                    ->withTimestamps();
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
    public function scopeByGraduationYear($query, $year)
    {
        return $query->where('graduation_year', $year);
    }

    /**
     * Scope for active alumni
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_EMPLOYED => 'Bekerja',
            self::STATUS_UNEMPLOYED => 'Tidak Bekerja',
            self::STATUS_SELF_EMPLOYED => 'Wiraswasta',
            self::STATUS_STUDYING => 'Kuliah',
            self::STATUS_RETIRED => 'Pensiun',
            self::STATUS_UNKNOWN => 'Tidak Diketahui',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_EMPLOYED => 'success',
            self::STATUS_UNEMPLOYED => 'warning',
            self::STATUS_SELF_EMPLOYED => 'info',
            self::STATUS_STUDYING => 'primary',
            self::STATUS_RETIRED => 'secondary',
            self::STATUS_UNKNOWN => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Check if alumni is active
     */
    public function isActive()
    {
        return $this->is_active;
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
     * Get formatted salary range
     */
    public function getFormattedSalaryRangeAttribute()
    {
        if ($this->salary_range) {
            return 'Rp ' . number_format($this->salary_range, 0, ',', '.');
        }
        return 'Tidak disebutkan';
    }

    /**
     * Get total achievements count
     */
    public function getTotalAchievementsAttribute()
    {
        return count($this->achievements ?? []);
    }

    /**
     * Get years since graduation
     */
    public function getYearsSinceGraduationAttribute()
    {
        return $this->graduation_date->diffInYears(now());
    }

    /**
     * Update last contact
     */
    public function updateLastContact()
    {
        $this->update(['last_contact_date' => now()]);
    }

    /**
     * Add achievement
     */
    public function addAchievement($achievement)
    {
        $achievements = $this->achievements ?? [];
        $achievements[] = [
            'title' => $achievement['title'],
            'description' => $achievement['description'] ?? '',
            'date' => $achievement['date'] ?? now()->toDateString(),
            'level' => $achievement['level'] ?? 'local',
        ];
        
        $this->update(['achievements' => $achievements]);
    }

    /**
     * Remove achievement
     */
    public function removeAchievement($index)
    {
        $achievements = $this->achievements ?? [];
        if (isset($achievements[$index])) {
            unset($achievements[$index]);
            $this->update(['achievements' => array_values($achievements)]);
        }
    }
}
