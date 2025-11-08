<?php

namespace App\Services;

use App\Models\Tenant\StudentActivityLog;
use App\Models\Tenant\Student;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentActivityService
{
    /**
     * Log student login activity
     */
    public function logLogin($studentId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'login',
            'auth',
            'login',
            'Student logged in to the system',
            $metadata
        );
    }

    /**
     * Log student logout activity
     */
    public function logLogout($studentId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'logout',
            'auth',
            'logout',
            'Student logged out from the system',
            $metadata
        );
    }

    /**
     * Log exam start activity
     */
    public function logExamStart($studentId, $examId, $attemptId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'exam_start',
            'exam',
            'start',
            'Student started an exam',
            array_merge($metadata ?? [], [
                'exam_id' => $examId,
                'attempt_id' => $attemptId,
            ])
        );
    }

    /**
     * Log exam submit activity
     */
    public function logExamSubmit($studentId, $examId, $attemptId, $score, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'exam_submit',
            'exam',
            'submit',
            'Student submitted exam answers',
            array_merge($metadata ?? [], [
                'exam_id' => $examId,
                'attempt_id' => $attemptId,
                'score' => $score,
            ])
        );
    }

    /**
     * Log answer save activity
     */
    public function logAnswerSave($studentId, $examId, $attemptId, $questionId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'answer_save',
            'exam',
            'save_answer',
            'Student saved an answer',
            array_merge($metadata ?? [], [
                'exam_id' => $examId,
                'attempt_id' => $attemptId,
                'question_id' => $questionId,
            ])
        );
    }

    /**
     * Log exam review activity
     */
    public function logExamReview($studentId, $examId, $attemptId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'exam_review',
            'exam',
            'review',
            'Student reviewed exam results',
            array_merge($metadata ?? [], [
                'exam_id' => $examId,
                'attempt_id' => $attemptId,
            ])
        );
    }

    /**
     * Log profile update activity
     */
    public function logProfileUpdate($studentId, $updatedFields, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'profile_update',
            'profile',
            'update',
            'Student updated profile information',
            array_merge($metadata ?? [], [
                'updated_fields' => $updatedFields,
            ])
        );
    }

    /**
     * Log password change activity
     */
    public function logPasswordChange($studentId, $metadata = null)
    {
        return $this->logActivity(
            $studentId,
            'password_change',
            'auth',
            'change_password',
            'Student changed password',
            $metadata
        );
    }

    /**
     * Log custom activity
     */
    public function logCustomActivity(
        $studentId,
        $activityType,
        $module,
        $action,
        $description,
        $metadata = null
    ) {
        return $this->logActivity(
            $studentId,
            $activityType,
            $module,
            $action,
            $description,
            $metadata
        );
    }

    /**
     * Log activity with automatic student detection
     */
    public function logActivity(
        $studentId,
        $activityType,
        $module,
        $action = null,
        $description = null,
        $metadata = null
    ) {
        try {
            // Auto-detect student ID if not provided
            if (!$studentId && Auth::check() && Auth::user()->user_type === 'student') {
                $studentId = Auth::user()->student_id ?? Auth::id();
            }

            if (!$studentId) {
                Log::warning('Cannot log activity: No student ID provided');
                return null;
            }

            // Verify student exists
            $student = Student::find($studentId);
            if (!$student) {
                Log::warning('Cannot log activity: Student not found', ['student_id' => $studentId]);
                return null;
            }

            // Add request information to metadata
            $requestMetadata = array_merge($metadata ?? [], [
                'user_agent' => request()->userAgent(),
                'ip_address' => request()->ip(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
            ]);

            return StudentActivityLog::logActivity(
                $studentId,
                $activityType,
                $module,
                $action,
                $description,
                $requestMetadata
            );

        } catch (\Exception $e) {
            Log::error('Failed to log student activity: ' . $e->getMessage(), [
                'student_id' => $studentId,
                'activity_type' => $activityType,
                'module' => $module,
                'error' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Get student activity feed
     */
    public function getStudentActivityFeed($studentId, $limit = 20, $offset = 0)
    {
        return StudentActivityLog::where('student_id', $studentId)
            ->with('student')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get();
    }

    /**
     * Get recent activities for dashboard
     */
    public function getRecentActivities($studentId, $days = 7, $limit = 10)
    {
        return StudentActivityLog::where('student_id', $studentId)
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activity statistics
     */
    public function getActivityStatistics($studentId = null, $days = 30)
    {
        if ($studentId) {
            return StudentActivityLog::getStudentStatistics($studentId, $days);
        }

        return StudentActivityLog::getInstansiStatistics(tenant('id'), $days);
    }

    /**
     * Get activity trends
     */
    public function getActivityTrends($studentId = null, $days = 30)
    {
        $query = StudentActivityLog::query();
        
        if ($studentId) {
            $query->where('student_id', $studentId);
        } else {
            $query->where('instansi_id', tenant('id'));
        }

        return $query->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, activity_type, COUNT(*) as count')
            ->groupBy('date', 'activity_type')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(function ($dayActivities) {
                return $dayActivities->pluck('count', 'activity_type');
            });
    }

    /**
     * Clean old activity logs
     */
    public function cleanOldLogs($days = 90)
    {
        $cutoffDate = now()->subDays($days);
        
        $deletedCount = StudentActivityLog::where('created_at', '<', $cutoffDate)->delete();
        
        Log::info("Cleaned {$deletedCount} old activity logs older than {$days} days");
        
        return $deletedCount;
    }

    /**
     * Export activity logs
     */
    public function exportActivityLogs($studentId = null, $startDate = null, $endDate = null, $format = 'excel')
    {
        $query = StudentActivityLog::with('student');
        
        if ($studentId) {
            $query->where('student_id', $studentId);
        } else {
            $query->where('instansi_id', tenant('id'));
        }

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'csv') {
            return $this->exportToCsv($logs);
        }

        return $this->exportToExcel($logs);
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($logs)
    {
        $filename = 'student_activity_logs_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Tanggal',
                'Nama Siswa',
                'Tipe Aktivitas',
                'Modul',
                'Aksi',
                'Deskripsi',
                'IP Address',
                'User Agent'
            ]);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->student->name ?? 'N/A',
                    $log->activity_type,
                    $log->module,
                    $log->action,
                    $log->description,
                    $log->ip_address,
                    $log->user_agent
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to Excel
     */
    private function exportToExcel($logs)
    {
        // This would use Laravel Excel package
        // For now, return CSV as fallback
        return $this->exportToCsv($logs);
    }
}
