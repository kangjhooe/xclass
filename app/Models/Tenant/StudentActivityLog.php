<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasInstansi;

class StudentActivityLog extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'activity_type',
        'module',
        'action',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
        'session_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the student that owns the activity log
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the instansi that owns the activity log
     */
    public function instansi()
    {
        return $this->belongsTo(Instansi::class);
    }

    /**
     * Scope for filtering by activity type
     */
    public function scopeActivityType($query, $type)
    {
        return $query->where('activity_type', $type);
    }

    /**
     * Scope for filtering by module
     */
    public function scopeModule($query, $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for recent activities
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get formatted activity description
     */
    public function getFormattedDescriptionAttribute()
    {
        $descriptions = [
            'login' => 'Masuk ke sistem',
            'logout' => 'Keluar dari sistem',
            'exam_start' => 'Memulai ujian',
            'exam_submit' => 'Mengirim jawaban ujian',
            'answer_save' => 'Menyimpan jawaban',
            'exam_review' => 'Melihat hasil ujian',
            'profile_update' => 'Memperbarui profil',
            'password_change' => 'Mengubah kata sandi',
        ];

        return $descriptions[$this->activity_type] ?? $this->description;
    }

    /**
     * Get activity icon
     */
    public function getActivityIconAttribute()
    {
        $icons = [
            'login' => 'fas fa-sign-in-alt',
            'logout' => 'fas fa-sign-out-alt',
            'exam_start' => 'fas fa-play',
            'exam_submit' => 'fas fa-paper-plane',
            'answer_save' => 'fas fa-save',
            'exam_review' => 'fas fa-eye',
            'profile_update' => 'fas fa-user-edit',
            'password_change' => 'fas fa-key',
        ];

        return $icons[$this->activity_type] ?? 'fas fa-circle';
    }

    /**
     * Get activity color class
     */
    public function getActivityColorAttribute()
    {
        $colors = [
            'login' => 'success',
            'logout' => 'secondary',
            'exam_start' => 'primary',
            'exam_submit' => 'success',
            'answer_save' => 'info',
            'exam_review' => 'warning',
            'profile_update' => 'info',
            'password_change' => 'warning',
        ];

        return $colors[$this->activity_type] ?? 'secondary';
    }

    /**
     * Get time ago format
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get detailed activity info
     */
    public function getDetailedInfoAttribute()
    {
        $info = [
            'activity' => $this->formatted_description,
            'module' => ucfirst($this->module),
            'time' => $this->time_ago,
            'ip' => $this->ip_address,
        ];

        if ($this->metadata) {
            $info['details'] = $this->metadata;
        }

        return $info;
    }

    /**
     * Static method to log activity
     */
    public static function logActivity(
        $studentId,
        $activityType,
        $module,
        $action = null,
        $description = null,
        $metadata = null
    ) {
        return self::create([
            'instansi_id' => tenant('id'),
            'student_id' => $studentId,
            'activity_type' => $activityType,
            'module' => $module,
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
        ]);
    }

    /**
     * Get activity statistics for a student
     */
    public static function getStudentStatistics($studentId, $days = 30)
    {
        $query = self::where('student_id', $studentId)
            ->where('created_at', '>=', now()->subDays($days));

        return [
            'total_activities' => $query->count(),
            'login_count' => $query->where('activity_type', 'login')->count(),
            'exam_activities' => $query->where('module', 'exam')->count(),
            'last_activity' => $query->latest()->first(),
            'activity_by_type' => $query->selectRaw('activity_type, COUNT(*) as count')
                ->groupBy('activity_type')
                ->pluck('count', 'activity_type'),
            'activity_by_module' => $query->selectRaw('module, COUNT(*) as count')
                ->groupBy('module')
                ->pluck('count', 'module'),
        ];
    }

    /**
     * Get activity statistics for an instansi
     */
    public static function getInstansiStatistics($instansiId, $days = 30)
    {
        $query = self::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subDays($days));

        return [
            'total_activities' => $query->count(),
            'active_students' => $query->distinct('student_id')->count('student_id'),
            'activity_by_type' => $query->selectRaw('activity_type, COUNT(*) as count')
                ->groupBy('activity_type')
                ->pluck('count', 'activity_type'),
            'activity_by_module' => $query->selectRaw('module, COUNT(*) as count')
                ->groupBy('module')
                ->pluck('count', 'module'),
            'daily_activities' => $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
        ];
    }
}