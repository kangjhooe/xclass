<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\AcademicYear;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Academic Year Policy
 * 
 * Handles authorization for AcademicYear resource
 */
class AcademicYearPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any academic years
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users in tenant can view academic years
        return true;
    }

    /**
     * Determine if user can view the academic year
     */
    public function view(User $user, AcademicYear $academicYear): bool
    {
        // Ensure user's tenant matches academic year's tenant
        return $user->instansi_id == $academicYear->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create academic years
     */
    public function create(User $user): bool
    {
        // Only admin roles can create academic years
        return in_array($user->role, ['super_admin', 'school_admin']);
    }

    /**
     * Determine if user can update the academic year
     */
    public function update(User $user, AcademicYear $academicYear): bool
    {
        // Only admin roles can update
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches academic year's tenant
        return $user->instansi_id == $academicYear->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the academic year
     */
    public function delete(User $user, AcademicYear $academicYear): bool
    {
        // Only admin roles can delete
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches academic year's tenant
        if ($user->instansi_id != $academicYear->instansi_id && $user->role !== 'super_admin') {
            return false;
        }

        // Cannot delete active academic year
        if ($academicYear->is_active) {
            return false;
        }

        return true;
    }

    /**
     * Determine if user can set academic year as active
     */
    public function setActive(User $user, AcademicYear $academicYear): bool
    {
        // Only admin roles can set active
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches academic year's tenant
        return $user->instansi_id == $academicYear->instansi_id || $user->role === 'super_admin';
    }
}

