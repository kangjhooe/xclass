<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Subject;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Subject Policy
 * 
 * Handles authorization for Subject resource
 */
class SubjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any subjects
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'subjects');
    }

    /**
     * Determine if user can view the subject
     */
    public function view(User $user, Subject $subject): bool
    {
        if (!$this->hasModuleAccess($user, 'subjects')) {
            return false;
        }

        return $user->instansi_id == $subject->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create subjects
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'subjects');
    }

    /**
     * Determine if user can update the subject
     */
    public function update(User $user, Subject $subject): bool
    {
        if (!$this->hasModuleAccess($user, 'subjects')) {
            return false;
        }

        return $user->instansi_id == $subject->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the subject
     */
    public function delete(User $user, Subject $subject): bool
    {
        if (!$this->hasModuleAccess($user, 'subjects')) {
            return false;
        }

        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        return $user->instansi_id == $subject->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to subjects module
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

