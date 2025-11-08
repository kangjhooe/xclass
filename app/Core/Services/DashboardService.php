<?php

namespace App\Core\Services;

use App\Models\Core\Tenant;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Schedule;
use App\Models\Tenant\Attendance;
use App\Models\Tenant\Grade;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    protected $tenant;
    protected $cacheService;

    public function __construct(TenantService $tenantService, CacheService $cacheService)
    {
        $this->tenant = $tenantService->getTenant();
        $this->cacheService = $cacheService;
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): array
    {
        $cacheKey = 'dashboard_stats';
        $cached = $this->cacheService->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $stats = [
            'overview' => $this->getOverviewStats(),
            'academic' => $this->getAcademicStats(),
            'attendance' => $this->getAttendanceStats(),
            'performance' => $this->getPerformanceStats(),
            'recent_activities' => $this->getRecentActivities(),
        ];

        $this->cacheService->put($cacheKey, $stats, 1800); // 30 minutes

        return $stats;
    }

    /**
     * Get overview statistics
     */
    protected function getOverviewStats(): array
    {
        return [
            'total_students' => Student::where('instansi_id', $this->tenant->id)->count(),
            'active_students' => Student::where('instansi_id', $this->tenant->id)->where('is_active', true)->count(),
            'total_teachers' => Teacher::where('instansi_id', $this->tenant->id)->count(),
            'active_teachers' => Teacher::where('instansi_id', $this->tenant->id)->where('is_active', true)->count(),
            'total_classes' => ClassRoom::where('instansi_id', $this->tenant->id)->count(),
            'total_subjects' => Subject::where('instansi_id', $this->tenant->id)->count(),
        ];
    }

    /**
     * Get academic statistics
     */
    protected function getAcademicStats(): array
    {
        $currentYear = '2024/2025';
        $currentSemester = 1;

        $grades = Grade::where('instansi_id', $this->tenant->id)
            ->where('academic_year', $currentYear)
            ->where('semester', $currentSemester)
            ->get();

        return [
            'total_grades' => $grades->count(),
            'average_score' => $grades->avg('score'),
            'highest_score' => $grades->max('score'),
            'lowest_score' => $grades->min('score'),
            'grade_distribution' => $grades->groupBy('grade_letter')->map->count(),
            'subjects_with_grades' => $grades->groupBy('subject_id')->count(),
        ];
    }

    /**
     * Get attendance statistics
     */
    protected function getAttendanceStats(): array
    {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        $attendances = Attendance::where('instansi_id', $this->tenant->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $totalRecords = $attendances->count();
        $presentCount = $attendances->where('status', 'present')->count();
        $absentCount = $attendances->where('status', 'absent')->count();
        $lateCount = $attendances->where('status', 'late')->count();

        return [
            'total_records' => $totalRecords,
            'present_count' => $presentCount,
            'absent_count' => $absentCount,
            'late_count' => $lateCount,
            'attendance_rate' => $totalRecords > 0 ? round(($presentCount / $totalRecords) * 100, 2) : 0,
            'daily_average' => $totalRecords > 0 ? round($totalRecords / $startDate->diffInDays($endDate), 2) : 0,
        ];
    }

    /**
     * Get performance statistics
     */
    protected function getPerformanceStats(): array
    {
        $currentYear = '2024/2025';
        $currentSemester = 1;

        $grades = Grade::where('instansi_id', $this->tenant->id)
            ->where('academic_year', $currentYear)
            ->where('semester', $currentSemester)
            ->get();

        $students = Student::where('instansi_id', $this->tenant->id)->get();
        $classes = ClassRoom::where('instansi_id', $this->tenant->id)->get();

        return [
            'students_with_grades' => $grades->groupBy('student_id')->count(),
            'classes_with_grades' => $grades->groupBy('student.class_id')->count(),
            'average_per_student' => $students->count() > 0 ? round($grades->count() / $students->count(), 2) : 0,
            'average_per_class' => $classes->count() > 0 ? round($grades->count() / $classes->count(), 2) : 0,
            'top_performing_students' => $this->getTopPerformingStudents($grades),
            'top_performing_classes' => $this->getTopPerformingClasses($grades),
        ];
    }

    /**
     * Get recent activities
     */
    protected function getRecentActivities(): array
    {
        $activities = [];

        // Recent grades
        $recentGrades = Grade::where('instansi_id', $this->tenant->id)
            ->with(['student', 'subject', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentGrades as $grade) {
            $activities[] = [
                'type' => 'grade',
                'message' => "Nilai baru ditambahkan untuk {$grade->student->name} - {$grade->subject->name}",
                'data' => $grade,
                'created_at' => $grade->created_at,
            ];
        }

        // Recent attendances
        $recentAttendances = Attendance::where('instansi_id', $this->tenant->id)
            ->with(['student', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentAttendances as $attendance) {
            $activities[] = [
                'type' => 'attendance',
                'message' => "Presensi {$attendance->student->name} - {$attendance->status}",
                'data' => $attendance,
                'created_at' => $attendance->created_at,
            ];
        }

        // Sort by created_at desc
        usort($activities, function($a, $b) {
            return $b['created_at'] <=> $a['created_at'];
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get top performing students
     */
    protected function getTopPerformingStudents($grades): array
    {
        $studentAverages = $grades->groupBy('student_id')->map(function($studentGrades) {
            return [
                'student' => $studentGrades->first()->student,
                'average' => $studentGrades->avg('score'),
                'count' => $studentGrades->count(),
            ];
        })->sortByDesc('average')->take(5);

        return $studentAverages->values()->toArray();
    }

    /**
     * Get top performing classes
     */
    protected function getTopPerformingClasses($grades): array
    {
        $classAverages = $grades->groupBy('student.class_id')->map(function($classGrades) {
            return [
                'class' => $classGrades->first()->student->classRoom,
                'average' => $classGrades->avg('score'),
                'count' => $classGrades->count(),
            ];
        })->sortByDesc('average')->take(5);

        return $classAverages->values()->toArray();
    }

    /**
     * Get class statistics
     */
    public function getClassStats(int $classId): array
    {
        $cacheKey = "class_stats_{$classId}";
        $cached = $this->cacheService->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $class = ClassRoom::find($classId);
        
        if (!$class) {
            return [];
        }

        $stats = [
            'class_info' => [
                'id' => $class->id,
                'name' => $class->name,
                'level' => $class->level,
                'major' => $class->major,
                'capacity' => $class->capacity,
            ],
            'students' => [
                'total' => $class->students()->count(),
                'active' => $class->students()->where('is_active', true)->count(),
                'inactive' => $class->students()->where('is_active', false)->count(),
            ],
            'teachers' => [
                'total' => $class->teachers()->count(),
                'active' => $class->teachers()->where('is_active', true)->count(),
            ],
            'schedules' => [
                'total' => $class->schedules()->count(),
                'active' => $class->schedules()->where('is_active', true)->count(),
            ],
            'grades' => [
                'total' => Grade::whereHas('student', function($q) use ($classId) {
                    $q->where('class_id', $classId);
                })->count(),
                'average' => Grade::whereHas('student', function($q) use ($classId) {
                    $q->where('class_id', $classId);
                })->avg('score'),
            ],
        ];

        $this->cacheService->put($cacheKey, $stats, 1800); // 30 minutes

        return $stats;
    }

    /**
     * Get teacher statistics
     */
    public function getTeacherStats(int $teacherId): array
    {
        $cacheKey = "teacher_stats_{$teacherId}";
        $cached = $this->cacheService->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $teacher = Teacher::find($teacherId);
        
        if (!$teacher) {
            return [];
        }

        $stats = [
            'teacher_info' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'nip' => $teacher->nip,
            ],
            'subjects' => [
                'total' => $teacher->subjects()->count(),
                'active' => $teacher->subjects()->where('is_active', true)->count(),
            ],
            'schedules' => [
                'total' => $teacher->schedules()->count(),
                'active' => $teacher->schedules()->where('is_active', true)->count(),
            ],
            'grades' => [
                'total' => Grade::where('teacher_id', $teacherId)->count(),
                'average' => Grade::where('teacher_id', $teacherId)->avg('score'),
            ],
            'students' => [
                'total' => $teacher->schedules()->with('classRoom.students')->get()
                    ->pluck('classRoom.students')->flatten()->unique('id')->count(),
            ],
        ];

        $this->cacheService->put($cacheKey, $stats, 1800); // 30 minutes

        return $stats;
    }

    /**
     * Clear dashboard cache
     */
    public function clearDashboardCache(): void
    {
        $this->cacheService->clearCache('dashboard_stats');
        $this->cacheService->clearCache('class_stats_*');
        $this->cacheService->clearCache('teacher_stats_*');
    }
}
