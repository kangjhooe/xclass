<?php

namespace Modules\ELearning\Services;

use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseEnrollment;
use Illuminate\Support\Facades\DB;

class CourseService
{
    /**
     * Enroll student to course
     */
    public function enrollStudent(Course $course, $studentId)
    {
        if (!$course->canEnroll($studentId)) {
            throw new \Exception('Tidak dapat mendaftar ke kursus ini');
        }

        return CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $studentId,
            'instansi_id' => $course->instansi_id,
            'status' => 'enrolled',
            'enrolled_at' => now(),
        ]);
    }

    /**
     * Unenroll student from course
     */
    public function unenrollStudent(Course $course, $studentId)
    {
        $enrollment = $course->enrollments()->where('student_id', $studentId)->first();
        
        if ($enrollment) {
            $enrollment->update(['status' => 'dropped']);
        }

        return $enrollment;
    }

    /**
     * Get student enrolled courses
     */
    public function getStudentCourses($studentId, $status = 'enrolled')
    {
        return Course::whereHas('enrollments', function($query) use ($studentId, $status) {
            $query->where('student_id', $studentId)->where('status', $status);
        })->with(['teacher', 'subject'])->get();
    }

    /**
     * Get teacher courses
     */
    public function getTeacherCourses($teacherId)
    {
        return Course::forTeacher($teacherId)
            ->with(['subject', 'enrollments'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

