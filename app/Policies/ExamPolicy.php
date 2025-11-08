<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Tenant\Exam;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any exams.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'school_admin', 'teacher', 'student']);
    }

    /**
     * Determine whether the user can view the exam.
     */
    public function view(User $user, Exam $exam): bool
    {
        // Super admin can view any exam
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only view exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can view any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        // Teachers can view exams they have subjects in
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return false;
            }

            return $exam->examSubjects()
                ->where('teacher_id', $teacher->id)
                ->exists();
        }

        // Students can view exams they have attempts for
        if ($user->role === 'student') {
            return $exam->attempts()
                ->where('student_id', $user->student->id ?? 0)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create exams.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can update the exam.
     */
    public function update(User $user, Exam $exam): bool
    {
        // Super admin can update any exam
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only update exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can update any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the exam.
     */
    public function delete(User $user, Exam $exam): bool
    {
        // Super admin can delete any exam
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only delete exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can delete any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view grade adjustments.
     */
    public function viewGradeAdjustment(User $user, Exam $exam): bool
    {
        // Super admin can view any grade adjustments
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only view grade adjustments for exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can view grade adjustments for any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        // Teachers can view grade adjustments for exams they have subjects in
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return false;
            }

            return $exam->examSubjects()
                ->where('teacher_id', $teacher->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can apply grade adjustments.
     */
    public function applyGradeAdjustment(User $user, Exam $exam): bool
    {
        // Super admin can apply grade adjustments to any exam
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only apply grade adjustments to exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can apply grade adjustments to any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        // Teachers can apply grade adjustments to exams they have subjects in
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return false;
            }

            return $exam->examSubjects()
                ->where('teacher_id', $teacher->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can manage questions for the exam.
     */
    public function manageQuestions(User $user, Exam $exam): bool
    {
        // Super admin can manage questions for any exam
        if ($user->role === 'super_admin') {
            return true;
        }

        // Users can only manage questions for exams from their tenant
        if ($user->instansi_id !== $exam->instansi_id) {
            return false;
        }

        // School admin can manage questions for any exam in their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        // Teachers can manage questions for exams they have subjects in
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return false;
            }

            return $exam->examSubjects()
                ->where('teacher_id', $teacher->id)
                ->exists();
        }

        return false;
    }
}
