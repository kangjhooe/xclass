<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Grade;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Grade Policy
 * 
 * Handles authorization for Grade resource
 */
class GradePolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any grades
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'grades');
    }

    /**
     * Determine if user can view the grade
     */
    public function view(User $user, Grade $grade): bool
    {
        if (!$this->hasModuleAccess($user, 'grades')) {
            return false;
        }

        return $user->instansi_id == $grade->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create grades
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'grades');
    }

    /**
     * Determine if user can update the grade
     */
    public function update(User $user, Grade $grade): bool
    {
        if (!$this->hasModuleAccess($user, 'grades')) {
            return false;
        }

        return $user->instansi_id == $grade->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the grade
     */
    public function delete(User $user, Grade $grade): bool
    {
        if (!$this->hasModuleAccess($user, 'grades')) {
            return false;
        }

        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        return $user->instansi_id == $grade->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to grades module
     */
    protected function hasModuleAccess(User $user, string $module): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'school_admin') {
            return true;
        }

        if ($user->role === 'teacher' && $user->teacher) {
            if ($user->teacher->hasAdditionalDuty('kepala_sekolah')) {
                return true;
            }

            return $user->teacher->hasModuleAccess($module);
        }

        return false;
    }
}

