<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\ClassRoom;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * ClassRoom Policy
 * 
 * Handles authorization for ClassRoom resource
 */
class ClassRoomPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any classrooms
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'classes');
    }

    /**
     * Determine if user can view the classroom
     */
    public function view(User $user, ClassRoom $classRoom): bool
    {
        if (!$this->hasModuleAccess($user, 'classes')) {
            return false;
        }

        // Ensure user's tenant matches classroom's tenant
        return $user->instansi_id == $classRoom->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create classrooms
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'classes');
    }

    /**
     * Determine if user can update the classroom
     */
    public function update(User $user, ClassRoom $classRoom): bool
    {
        if (!$this->hasModuleAccess($user, 'classes')) {
            return false;
        }

        // Ensure user's tenant matches classroom's tenant
        return $user->instansi_id == $classRoom->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the classroom
     */
    public function delete(User $user, ClassRoom $classRoom): bool
    {
        if (!$this->hasModuleAccess($user, 'classes')) {
            return false;
        }

        // Only school_admin and super_admin can delete
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches classroom's tenant
        return $user->instansi_id == $classRoom->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to classes module
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

