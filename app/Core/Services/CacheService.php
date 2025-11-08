<?php

namespace App\Core\Services;

use App\Models\Core\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    protected $tenant;
    protected $prefix;

    public function __construct(TenantService $tenantService)
    {
        $this->tenant = $tenantService->getTenant();
        $this->prefix = 'tenant_' . $this->tenant?->npsn . '_';
    }

    /**
     * Get cached data
     */
    public function get(string $key, $default = null)
    {
        $fullKey = $this->prefix . $key;
        
        return Cache::get($fullKey, $default);
    }

    /**
     * Set cached data
     */
    public function put(string $key, $value, int $ttl = 3600): void
    {
        $fullKey = $this->prefix . $key;
        
        Cache::put($fullKey, $value, $ttl);
    }

    /**
     * Cache tenant statistics
     */
    public function cacheTenantStats(): void
    {
        $stats = [
            'total_students' => $this->getTenantStat('students'),
            'total_teachers' => $this->getTenantStat('teachers'),
            'total_classes' => $this->getTenantStat('classes'),
            'total_subjects' => $this->getTenantStat('subjects'),
            'active_students' => $this->getTenantStat('active_students'),
            'active_teachers' => $this->getTenantStat('active_teachers'),
        ];

        $this->put('tenant_stats', $stats, 1800); // 30 minutes
    }

    /**
     * Cache user data
     */
    public function cacheUserData(int $userId): void
    {
        $user = \App\Models\User::find($userId);
        
        if ($user) {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
            ];

            $this->put("user_{$userId}", $userData, 3600); // 1 hour
        }
    }

    /**
     * Cache class data
     */
    public function cacheClassData(int $classId): void
    {
        $class = \App\Models\Tenant\ClassRoom::find($classId);
        
        if ($class) {
            $classData = [
                'id' => $class->id,
                'name' => $class->name,
                'level' => $class->level,
                'major' => $class->major,
                'capacity' => $class->capacity,
                'student_count' => $class->students()->count(),
                'teacher_count' => $class->teachers()->count(),
            ];

            $this->put("class_{$classId}", $classData, 1800); // 30 minutes
        }
    }

    /**
     * Cache subject data
     */
    public function cacheSubjectData(int $subjectId): void
    {
        $subject = \App\Models\Tenant\Subject::find($subjectId);
        
        if ($subject) {
            $subjectData = [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'credits' => $subject->credits,
                'level' => $subject->level,
                'category' => $subject->category,
                'teacher_count' => $subject->teachers()->count(),
                'schedule_count' => $subject->schedules()->count(),
            ];

            $this->put("subject_{$subjectId}", $subjectData, 1800); // 30 minutes
        }
    }

    /**
     * Cache schedule data
     */
    public function cacheScheduleData(int $scheduleId): void
    {
        $schedule = \App\Models\Tenant\Schedule::find($scheduleId);
        
        if ($schedule) {
            $scheduleData = [
                'id' => $schedule->id,
                'day' => $schedule->day,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'room' => $schedule->room,
                'teacher' => $schedule->teacher,
                'subject' => $schedule->subject,
                'class' => $schedule->classRoom,
            ];

            $this->put("schedule_{$scheduleId}", $scheduleData, 1800); // 30 minutes
        }
    }

    /**
     * Cache grade data
     */
    public function cacheGradeData(int $gradeId): void
    {
        $grade = \App\Models\Tenant\Grade::find($gradeId);
        
        if ($grade) {
            $gradeData = [
                'id' => $grade->id,
                'student' => $grade->student,
                'subject' => $grade->subject,
                'teacher' => $grade->teacher,
                'score' => $grade->score,
                'grade_letter' => $grade->grade_letter,
                'assignment_type' => $grade->assignment_type,
                'assignment_name' => $grade->assignment_name,
            ];

            $this->put("grade_{$gradeId}", $gradeData, 1800); // 30 minutes
        }
    }

    /**
     * Cache attendance data
     */
    public function cacheAttendanceData(int $attendanceId): void
    {
        $attendance = \App\Models\Tenant\Attendance::find($attendanceId);
        
        if ($attendance) {
            $attendanceData = [
                'id' => $attendance->id,
                'student' => $attendance->student,
                'teacher' => $attendance->teacher,
                'date' => $attendance->date,
                'status' => $attendance->status,
                'check_in_time' => $attendance->check_in_time,
                'check_out_time' => $attendance->check_out_time,
            ];

            $this->put("attendance_{$attendanceId}", $attendanceData, 1800); // 30 minutes
        }
    }

    /**
     * Get tenant statistic
     */
    protected function getTenantStat(string $type): int
    {
        $model = match($type) {
            'students' => \App\Models\Tenant\Student::class,
            'teachers' => \App\Models\Tenant\Teacher::class,
            'classes' => \App\Models\Tenant\ClassRoom::class,
            'subjects' => \App\Models\Tenant\Subject::class,
            'active_students' => \App\Models\Tenant\Student::class,
            'active_teachers' => \App\Models\Tenant\Teacher::class,
            default => null,
        };

        if (!$model) {
            return 0;
        }

        $query = $model::where('instansi_id', $this->tenant->id);
        
        if (str_contains($type, 'active_')) {
            $query->where('is_active', true);
        }

        return $query->count();
    }

    /**
     * Clear tenant cache
     */
    public function clearTenantCache(): void
    {
        $keys = [
            'tenant_stats',
            'user_*',
            'class_*',
            'subject_*',
            'schedule_*',
            'grade_*',
            'attendance_*',
        ];

        foreach ($keys as $key) {
            if (str_contains($key, '*')) {
                // This would typically clear all keys matching the pattern
                // For now, we'll just log the action
                Log::info('Clearing cache pattern', ['pattern' => $key]);
            } else {
                Cache::forget($this->prefix . $key);
            }
        }
    }

    /**
     * Clear specific cache
     */
    public function clearCache(string $key): void
    {
        Cache::forget($this->prefix . $key);
    }

    /**
     * Get cache statistics
     */
    public function getCacheStats(): array
    {
        return [
            'total_keys' => 0,
            'memory_usage' => 0,
            'hit_rate' => 0,
            'miss_rate' => 0,
        ];
    }
}
