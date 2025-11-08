<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseEnrollment;
use Modules\ELearning\app\Models\CourseProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseProgressController extends Controller
{
    public function index(Course $course)
    {
        $enrollments = $course->enrollments()
            ->with('student')
            ->where('status', 'enrolled')
            ->paginate(20);

        return view('elearning::progress.index', [
            'title' => 'Progress Siswa',
            'course' => $course,
            'enrollments' => $enrollments,
        ]);
    }

    public function studentProgress(Course $course, $studentId)
    {
        $enrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('student_id', $studentId)
            ->first();

        if (!$enrollment) {
            return redirect()->back()->with('error', 'Siswa tidak terdaftar di kursus ini');
        }

        $progress = $enrollment->progress()
            ->with('progressable')
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_items' => $course->materials()->count() + 
                           $course->videos()->count() + 
                           $course->assignments()->count() + 
                           $course->quizzes()->count(),
            'completed_items' => $progress->where('completed_at', '!=', null)->count(),
            'progress_percentage' => $enrollment->progress_percentage,
        ];

        return view('elearning::progress.student', [
            'title' => 'Progress Siswa',
            'course' => $course,
            'enrollment' => $enrollment,
            'progress' => $progress,
            'stats' => $stats,
        ]);
    }

    public function analytics(Course $course)
    {
        $enrollments = $course->enrollments()->where('status', 'enrolled')->get();

        $analytics = [
            'total_students' => $enrollments->count(),
            'average_progress' => $enrollments->avg('progress_percentage') ?? 0,
            'completed_students' => $enrollments->where('status', 'completed')->count(),
            'in_progress_students' => $enrollments->where('status', 'enrolled')->count(),
            'average_score' => $enrollments->avg('final_score') ?? 0,
        ];

        // Progress distribution
        $progressDistribution = [
            '0-25%' => $enrollments->filter(fn($e) => $e->progress_percentage >= 0 && $e->progress_percentage < 25)->count(),
            '25-50%' => $enrollments->filter(fn($e) => $e->progress_percentage >= 25 && $e->progress_percentage < 50)->count(),
            '50-75%' => $enrollments->filter(fn($e) => $e->progress_percentage >= 50 && $e->progress_percentage < 75)->count(),
            '75-100%' => $enrollments->filter(fn($e) => $e->progress_percentage >= 75)->count(),
        ];

        return view('elearning::progress.analytics', [
            'title' => 'Analitik Kursus',
            'course' => $course,
            'analytics' => $analytics,
            'progressDistribution' => $progressDistribution,
        ]);
    }
}

