<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\Services\CourseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseEnrollmentController extends Controller
{
    protected $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    public function enroll(Course $course)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return redirect()->back()->with('error', 'Anda bukan siswa');
            }

            $this->courseService->enrollStudent($course, $student->id);
            return redirect()->back()->with('success', 'Berhasil mendaftar ke kursus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function unenroll(Course $course)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return redirect()->back()->with('error', 'Anda bukan siswa');
            }

            $this->courseService->unenrollStudent($course, $student->id);
            return redirect()->back()->with('success', 'Berhasil keluar dari kursus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function myCourses()
    {
        $student = Auth::user()->student;
        if (!$student) {
            return redirect()->route('tenant.dashboard')->with('error', 'Anda bukan siswa');
        }

        $courses = $this->courseService->getStudentCourses($student->id);
        
        return view('elearning::student.my-courses', [
            'title' => 'Kursus Saya',
            'pageTitle' => 'Kursus Saya',
            'courses' => $courses,
        ]);
    }
}

