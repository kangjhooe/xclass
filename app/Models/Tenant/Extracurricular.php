<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Extracurricular extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'name',
        'description',
        'category',
        'supervisor_id',
        'assistant_supervisor_id',
        'schedule',
        'venue',
        'max_participants',
        'current_participants',
        'status',
        'start_date',
        'end_date',
        'requirements',
        'equipment_needed',
        'cost',
        'notes',
    ];

    protected $casts = [
        'max_participants' => 'integer',
        'current_participants' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'cost' => 'decimal:2',
        'schedule' => 'array',
        'requirements' => 'array',
        'equipment_needed' => 'array',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_COMPLETED = 'completed';

    const CATEGORY_SPORTS = 'sports';
    const CATEGORY_ARTS = 'arts';
    const CATEGORY_ACADEMIC = 'academic';
    const CATEGORY_SOCIAL = 'social';
    const CATEGORY_RELIGIOUS = 'religious';
    const CATEGORY_TECHNOLOGY = 'technology';

    /**
     * Get the tenant that owns the extracurricular
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the supervisor
     */
    public function supervisor()
    {
        return $this->belongsTo(Teacher::class, 'supervisor_id');
    }

    /**
     * Get the assistant supervisor
     */
    public function assistantSupervisor()
    {
        return $this->belongsTo(Teacher::class, 'assistant_supervisor_id');
    }

    /**
     * Get participants
     */
    public function participants()
    {
        return $this->hasMany(ExtracurricularParticipant::class);
    }

    /**
     * Get activities
     */
    public function activities()
    {
        return $this->hasMany(ExtracurricularActivity::class);
    }

    /**
     * Get achievements
     */
    public function achievements()
    {
        return $this->hasMany(ExtracurricularAchievement::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for active extracurriculars
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            self::STATUS_SUSPENDED => 'Ditangguhkan',
            self::STATUS_COMPLETED => 'Selesai',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            self::CATEGORY_SPORTS => 'Olahraga',
            self::CATEGORY_ARTS => 'Seni',
            self::CATEGORY_ACADEMIC => 'Akademik',
            self::CATEGORY_SOCIAL => 'Sosial',
            self::CATEGORY_RELIGIOUS => 'Keagamaan',
            self::CATEGORY_TECHNOLOGY => 'Teknologi',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'success',
            self::STATUS_INACTIVE => 'secondary',
            self::STATUS_SUSPENDED => 'warning',
            self::STATUS_COMPLETED => 'info',
            default => 'secondary'
        };
    }

    /**
     * Get category color for display
     */
    public function getCategoryColorAttribute()
    {
        return match($this->category) {
            self::CATEGORY_SPORTS => 'primary',
            self::CATEGORY_ARTS => 'pink',
            self::CATEGORY_ACADEMIC => 'info',
            self::CATEGORY_SOCIAL => 'success',
            self::CATEGORY_RELIGIOUS => 'warning',
            self::CATEGORY_TECHNOLOGY => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Check if extracurricular is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if extracurricular has available slots
     */
    public function hasAvailableSlots()
    {
        return $this->current_participants < $this->max_participants;
    }

    /**
     * Get formatted cost
     */
    public function getFormattedCostAttribute()
    {
        return 'Rp ' . number_format($this->cost, 0, ',', '.');
    }

    /**
     * Get participation rate
     */
    public function getParticipationRateAttribute()
    {
        if ($this->max_participants > 0) {
            return round(($this->current_participants / $this->max_participants) * 100, 2);
        }
        return 0;
    }

    /**
     * Add participant
     */
    public function addParticipant($studentId, $joinedAt = null)
    {
        if (!$this->hasAvailableSlots()) {
            throw new \Exception('Kuota peserta sudah penuh');
        }

        ExtracurricularParticipant::create([
            'instansi_id' => $this->instansi_id,
            'extracurricular_id' => $this->id,
            'student_id' => $studentId,
            'joined_at' => $joinedAt ?? now(),
            'status' => ExtracurricularParticipant::STATUS_ACTIVE,
        ]);

        $this->increment('current_participants');
    }

    /**
     * Remove participant
     */
    public function removeParticipant($studentId, $reason = null)
    {
        $participant = $this->participants()
            ->where('student_id', $studentId)
            ->where('status', ExtracurricularParticipant::STATUS_ACTIVE)
            ->first();

        if ($participant) {
            $participant->update([
                'status' => ExtracurricularParticipant::STATUS_INACTIVE,
                'left_at' => now(),
                'notes' => $reason,
            ]);

            $this->decrement('current_participants');
        }
    }

    /**
     * Get schedule string
     */
    public function getScheduleStringAttribute()
    {
        if (!$this->schedule) {
            return 'Belum dijadwalkan';
        }

        $scheduleText = [];
        foreach ($this->schedule as $day => $time) {
            $scheduleText[] = ucfirst($day) . ': ' . $time;
        }

        return implode(', ', $scheduleText);
    }
}
