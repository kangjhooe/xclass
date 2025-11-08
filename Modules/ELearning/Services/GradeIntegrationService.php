<?php

namespace Modules\ELearning\Services;

use Modules\ELearning\app\Models\CourseAssignmentSubmission;
use Modules\ELearning\app\Models\CourseQuizAttempt;
use App\Models\Tenant\StudentGrade;
use Illuminate\Support\Facades\DB;

class GradeIntegrationService
{
    /**
     * Sync assignment grade to gradebook
     */
    public function syncAssignmentGrade(CourseAssignmentSubmission $submission)
    {
        if ($submission->synced_to_gradebook) {
            return;
        }

        try {
            DB::beginTransaction();

            $assignment = $submission->assignment;
            $course = $assignment->course;
            $student = $submission->student;

            // Get or create student grade
            $studentGrade = StudentGrade::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $course->subject_id,
                    'teacher_id' => $course->teacher_id,
                    'academic_year_id' => $this->getCurrentAcademicYearId(),
                    'semester' => $this->getCurrentSemester(),
                    'assignment_type' => 'tugas',
                    'assignment_name' => $assignment->title,
                    'instansi_id' => $submission->instansi_id,
                ],
                [
                    'score' => $submission->score,
                    'max_score' => $assignment->max_score,
                    'weight' => $assignment->weight,
                    'notes' => 'Nilai dari E-Learning: ' . $assignment->title,
                ]
            );

            $studentGrade->calculateFinalScore();

            $submission->update(['synced_to_gradebook' => true]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Sync quiz grade to gradebook (optional)
     */
    public function syncQuizGrade(CourseQuizAttempt $attempt)
    {
        if ($attempt->synced_to_gradebook || !$attempt->quiz->send_to_gradebook) {
            return;
        }

        try {
            DB::beginTransaction();

            $quiz = $attempt->quiz;
            $course = $quiz->course;
            $student = $attempt->student;

            $studentGrade = StudentGrade::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $course->subject_id,
                    'teacher_id' => $course->teacher_id,
                    'academic_year_id' => $this->getCurrentAcademicYearId(),
                    'semester' => $this->getCurrentSemester(),
                    'assignment_type' => 'quiz',
                    'assignment_name' => $quiz->title,
                    'instansi_id' => $attempt->instansi_id,
                ],
                [
                    'score' => $attempt->score,
                    'max_score' => $quiz->max_score,
                    'weight' => 0.5, // Default weight for quiz
                    'notes' => 'Nilai dari E-Learning Quiz: ' . $quiz->title,
                ]
            );

            $studentGrade->calculateFinalScore();

            $attempt->update(['synced_to_gradebook' => true]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get current academic year ID
     */
    private function getCurrentAcademicYearId()
    {
        $academicYear = \App\Models\Tenant\AcademicYear::where('is_active', true)->first();
        return $academicYear ? $academicYear->id : null;
    }

    /**
     * Get current semester
     */
    private function getCurrentSemester()
    {
        $month = now()->month;
        // Semester 1: July - December, Semester 2: January - June
        return ($month >= 1 && $month <= 6) ? 2 : 1;
    }
}

