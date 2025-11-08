<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Student;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Student Policy
 * 
 * Handles authorization for Student resource
 */
class StudentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any students
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'students');
    }

    /**
     * Determine if user can view the student
     */
    public function view(User $user, Student $student): bool
    {
        if (!$this->hasModuleAccess($user, 'students')) {
            return false;
        }

        // Ensure user's tenant matches student's tenant
        return $user->instansi_id == $student->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create students
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'students');
    }

    /**
     * Determine if user can update the student
     */
    public function update(User $user, Student $student): bool
    {
        if (!$this->hasModuleAccess($user, 'students')) {
            return false;
        }

        // Ensure user's tenant matches student's tenant
        return $user->instansi_id == $student->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the student
     */
    public function delete(User $user, Student $student): bool
    {
        if (!$this->hasModuleAccess($user, 'students')) {
            return false;
        }

        // Only school_admin and super_admin can delete
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches student's tenant
        return $user->instansi_id == $student->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can import students
     */
    public function import(User $user): bool
    {
        if (!$this->hasModuleAccess($user, 'students')) {
            return false;
        }

        // Only admin roles can import
        return in_array($user->role, ['super_admin', 'school_admin']);
    }

    /**
     * Determine if user can export students
     */
    public function export(User $user): bool
    {
        if (!$this->hasModuleAccess($user, 'students')) {
            return false;
        }

        // Only admin roles can export
        return in_array($user->role, ['super_admin', 'school_admin']);
    }

    /**
     * Check if user has access to students module
     */
    protected function hasModuleAccess(User $user, string $module): bool
    {
        // Super admin has all access
        if ($user->role === 'super_admin') {
            return true;
        }

        // School admin has access to all modules for their tenant
        if ($user->role === 'school_admin') {
            return true;
        }

        // Teacher needs module access check
        if ($user->role === 'teacher' && $user->teacher) {
            // Kepala sekolah has access to all modules
            if ($user->teacher->hasAdditionalDuty('kepala_sekolah')) {
                return true;
            }

            return $user->teacher->hasModuleAccess($module);
        }

        return false;
    }
}

