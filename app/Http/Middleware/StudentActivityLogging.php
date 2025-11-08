<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\StudentActivityService;
use Illuminate\Support\Facades\Auth;

class StudentActivityLogging
{
    protected $activityService;

    public function __construct(StudentActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log for authenticated students
        if (Auth::check() && Auth::user()->user_type === 'student') {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    /**
     * Log activity based on request
     */
    protected function logActivity(Request $request, $response)
    {
        $studentId = Auth::user()->student_id ?? Auth::id();
        $route = $request->route();
        $routeName = $route ? $route->getName() : null;

        // Skip logging for certain routes
        if ($this->shouldSkipLogging($routeName, $request)) {
            return;
        }

        // Determine activity type based on route
        $activityInfo = $this->getActivityInfo($routeName, $request);

        if ($activityInfo) {
            $this->activityService->logCustomActivity(
                $studentId,
                $activityInfo['type'],
                $activityInfo['module'],
                $activityInfo['action'],
                $activityInfo['description'],
                $this->getRequestMetadata($request)
            );
        }
    }

    /**
     * Check if logging should be skipped for this route
     */
    protected function shouldSkipLogging($routeName, Request $request)
    {
        // Skip AJAX requests for auto-save
        if ($request->ajax() && str_contains($request->path(), 'save-answer')) {
            return true;
        }

        // Skip certain routes
        $skipRoutes = [
            'tenant.exam.save-answer',
            'tenant.exam.progress',
            'tenant.exam.auto-save',
        ];

        return in_array($routeName, $skipRoutes);
    }

    /**
     * Get activity information based on route
     */
    protected function getActivityInfo($routeName, Request $request)
    {
        $activityMap = [
            // Exam activities
            'tenant.exam.take' => [
                'type' => 'exam_start',
                'module' => 'exam',
                'action' => 'start',
                'description' => 'Memulai ujian'
            ],
            'tenant.exam.submit' => [
                'type' => 'exam_submit',
                'module' => 'exam',
                'action' => 'submit',
                'description' => 'Mengirim jawaban ujian'
            ],
            'tenant.exam.results' => [
                'type' => 'exam_review',
                'module' => 'exam',
                'action' => 'review',
                'description' => 'Melihat hasil ujian'
            ],
            'tenant.exam.index' => [
                'type' => 'page_view',
                'module' => 'exam',
                'action' => 'view_dashboard',
                'description' => 'Melihat dashboard ujian'
            ],

            // Profile activities
            'tenant.profile.edit' => [
                'type' => 'profile_view',
                'module' => 'profile',
                'action' => 'view_edit',
                'description' => 'Melihat halaman edit profil'
            ],
            'tenant.profile.update' => [
                'type' => 'profile_update',
                'module' => 'profile',
                'action' => 'update',
                'description' => 'Memperbarui profil'
            ],

            // Dashboard
            'tenant.dashboard' => [
                'type' => 'page_view',
                'module' => 'dashboard',
                'action' => 'view',
                'description' => 'Melihat dashboard'
            ],

            // Attendance
            'tenant.attendance.index' => [
                'type' => 'page_view',
                'module' => 'attendance',
                'action' => 'view',
                'description' => 'Melihat absensi'
            ],

            // Grades
            'tenant.grades.index' => [
                'type' => 'page_view',
                'module' => 'grades',
                'action' => 'view',
                'description' => 'Melihat nilai'
            ],
        ];

        return $activityMap[$routeName] ?? null;
    }

    /**
     * Get request metadata
     */
    protected function getRequestMetadata(Request $request)
    {
        return [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'route' => $request->route()?->getName(),
            'parameters' => $request->route()?->parameters(),
            'query_params' => $request->query(),
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'session_id' => session()->getId(),
        ];
    }
}
