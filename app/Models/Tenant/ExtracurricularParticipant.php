<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ExtracurricularParticipant extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'extracurricular_id',
        'student_id',
        'joined_at',
        'left_at',
        'status',
        'role',
        'notes',
        'achievements',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'achievements' => 'array',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_SUSPENDED = 'suspended';

    const ROLE_MEMBER = 'member';
    const ROLE_LEADER = 'leader';
    const ROLE_ASSISTANT_LEADER = 'assistant_leader';
    const ROLE_TREASURER = 'treasurer';
    const ROLE_SECRETARY = 'secretary';

    /**
     * Get the tenant that owns the participant
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
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get attendances
     */
    public function attendances()
    {
        return $this->hasMany(ExtracurricularAttendance::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active participants
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for filtering by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
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
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get role label
     */
    public function getRoleLabelAttribute()
    {
        return match($this->role) {
            self::ROLE_MEMBER => 'Anggota',
            self::ROLE_LEADER => 'Ketua',
            self::ROLE_ASSISTANT_LEADER => 'Wakil Ketua',
            self::ROLE_TREASURER => 'Bendahara',
            self::ROLE_SECRETARY => 'Sekretaris',
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
            default => 'secondary'
        };
    }

    /**
     * Check if participant is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if participant is a leader
     */
    public function isLeader()
    {
        return in_array($this->role, [self::ROLE_LEADER, self::ROLE_ASSISTANT_LEADER]);
    }

    /**
     * Get participation duration in days
     */
    public function getParticipationDurationAttribute()
    {
        $endDate = $this->left_at ?? now();
        return $this->joined_at->diffInDays($endDate);
    }

    /**
     * Get attendance rate
     */
    public function getAttendanceRateAttribute()
    {
        $totalSessions = $this->extracurricular->activities()->count();
        $attendedSessions = $this->attendances()->where('status', ExtracurricularAttendance::STATUS_PRESENT)->count();
        
        if ($totalSessions > 0) {
            return round(($attendedSessions / $totalSessions) * 100, 2);
        }
        return 0;
    }

    /**
     * Get total achievements count
     */
    public function getTotalAchievementsAttribute()
    {
        return count($this->achievements ?? []);
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
            'level' => $achievement['level'] ?? 'school',
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
