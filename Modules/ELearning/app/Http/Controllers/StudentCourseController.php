<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\Services\CourseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentCourseController extends Controller
{
    protected $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    public function index()
    {
        $student = Auth::user()->student;
        if (!$student) {
            return redirect()->route('tenant.dashboard')->with('error', 'Anda bukan siswa');
        }

        $courses = $this->courseService->getStudentCourses($student->id);
        
        return view('elearning::student.courses', [
            'title' => 'Kursus Saya',
            'courses' => $courses,
        ]);
    }

    public function show(Course $course)
    {
        $student = Auth::user()->student;
        if (!$student) {
            return redirect()->route('tenant.dashboard')->with('error', 'Anda bukan siswa');
        }

        $enrollment = $course->enrollments()
            ->where('student_id', $student->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('tenant.elearning.student.courses')
                ->with('error', 'Anda belum terdaftar di kursus ini');
        }

        $course->load([
            'materials' => function($q) { $q->published()->orderBy('order'); },
            'videos' => function($q) { $q->published()->orderBy('order'); },
            'assignments' => function($q) { $q->published()->orderBy('due_date'); },
            'quizzes' => function($q) { $q->published()->orderBy('created_at'); },
            'forums',
            'announcements' => function($q) { $q->published()->orderBy('created_at', 'desc'); }
        ]);

        return view('elearning::student.course-show', [
            'title' => $course->title,
            'course' => $course,
            'enrollment' => $enrollment,
        ]);
    }

    public function dashboard(Course $course)
    {
        $student = Auth::user()->student;
        if (!$student) {
            return redirect()->route('tenant.dashboard')->with('error', 'Anda bukan siswa');
        }

        $enrollment = $course->enrollments()
            ->where('student_id', $student->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('tenant.elearning.student.courses')
                ->with('error', 'Anda belum terdaftar di kursus ini');
        }

        $stats = [
            'progress_percentage' => $enrollment->progress_percentage,
            'materials_completed' => $course->materials()->count(),
            'videos_completed' => $course->videos()->count(),
            'assignments_completed' => $course->assignments()->count(),
            'quizzes_completed' => $course->quizzes()->count(),
        ];

        $course->load(['announcements', 'assignments']);
        
        $recentAnnouncements = $course->announcements()
            ->published()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $upcomingAssignments = $course->assignments()
            ->published()
            ->where('due_date', '>', now())
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        return view('elearning::student.dashboard', [
            'title' => 'Dashboard Kursus',
            'course' => $course,
            'enrollment' => $enrollment,
            'stats' => $stats,
            'recentAnnouncements' => $recentAnnouncements,
            'upcomingAssignments' => $upcomingAssignments,
        ]);
    }
}

