<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Student;
use App\Models\Tenant\StudentActivityLog;
use App\Services\StudentActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentActivityController extends Controller
{
    protected $activityService;

    public function __construct(StudentActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    /**
     * Display activity logs for current student
     */
    public function index(Request $request)
    {
        $studentId = Auth::user()->student_id ?? Auth::id();
        $student = Student::findOrFail($studentId);

        $query = StudentActivityLog::where('student_id', $studentId)
            ->with('student')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->paginate(20);

        // Get statistics
        $statistics = $this->activityService->getActivityStatistics($studentId, 30);

        // Get activity types and modules for filters
        $activityTypes = StudentActivityLog::where('student_id', $studentId)
            ->distinct()
            ->pluck('activity_type')
            ->sort()
            ->values();

        $modules = StudentActivityLog::where('student_id', $studentId)
            ->distinct()
            ->pluck('module')
            ->sort()
            ->values();

        return view('tenant.student.activity-logs', [
            'title' => 'Log Aktivitas',
            'student' => $student,
            'activities' => $activities,
            'statistics' => $statistics,
            'activityTypes' => $activityTypes,
            'modules' => $modules,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Log Aktivitas', 'url' => null]
            ]
        ]);
    }

    /**
     * Display activity logs for admin (all students)
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', StudentActivityLog::class);

        $query = StudentActivityLog::with('student')
            ->where('instansi_id', tenant('id'))
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->paginate(20);

        // Get statistics
        $statistics = $this->activityService->getActivityStatistics(null, 30);

        // Get students for filter
        $students = Student::where('instansi_id', tenant('id'))
            ->orderBy('name')
            ->get();

        // Get activity types and modules for filters
        $activityTypes = StudentActivityLog::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('activity_type')
            ->sort()
            ->values();

        $modules = StudentActivityLog::where('instansi_id', tenant('id'))
            ->distinct()
            ->pluck('module')
            ->sort()
            ->values();

        return view('tenant.admin.activity-logs', [
            'title' => 'Log Aktivitas Siswa',
            'activities' => $activities,
            'statistics' => $statistics,
            'students' => $students,
            'activityTypes' => $activityTypes,
            'modules' => $modules,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Log Aktivitas', 'url' => null]
            ]
        ]);
    }

    /**
     * Get activity statistics as JSON
     */
    public function statistics(Request $request)
    {
        $studentId = $request->get('student_id');
        $days = $request->get('days', 30);

        $statistics = $this->activityService->getActivityStatistics($studentId, $days);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Get activity trends as JSON
     */
    public function trends(Request $request)
    {
        $studentId = $request->get('student_id');
        $days = $request->get('days', 30);

        $trends = $this->activityService->getActivityTrends($studentId, $days);

        return response()->json([
            'success' => true,
            'data' => $trends
        ]);
    }

    /**
     * Export activity logs
     */
    public function export(Request $request)
    {
        $studentId = $request->get('student_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'excel');

        return $this->activityService->exportActivityLogs($studentId, $startDate, $endDate, $format);
    }

    /**
     * Get recent activities for dashboard widget
     */
    public function recent(Request $request)
    {
        $studentId = Auth::user()->student_id ?? Auth::id();
        $limit = $request->get('limit', 10);

        $activities = $this->activityService->getRecentActivities($studentId, 7, $limit);

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Clean old activity logs
     */
    public function clean(Request $request)
    {
        $this->authorize('delete', StudentActivityLog::class);

        $days = $request->get('days', 90);
        $deletedCount = $this->activityService->cleanOldLogs($days);

        return response()->json([
            'success' => true,
            'message' => "Berhasil menghapus {$deletedCount} log aktivitas lama",
            'deleted_count' => $deletedCount
        ]);
    }
}
