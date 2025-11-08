<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Staff;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Staff Policy
 * 
 * Handles authorization for Staff (Non-Teaching Staff) resource
 */
class StaffPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any staff
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'data_pokok');
    }

    /**
     * Determine if user can view the staff
     */
    public function view(User $user, Staff $staff): bool
    {
        if (!$this->hasModuleAccess($user, 'data_pokok')) {
            return false;
        }

        // Ensure user's tenant matches staff's tenant
        return $user->instansi_id == $staff->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create staff
     */
    public function create(User $user): bool
    {
        if (!$this->hasModuleAccess($user, 'data_pokok')) {
            return false;
        }

        // Only admin roles can create staff
        return in_array($user->role, ['super_admin', 'school_admin']) || 
               $this->hasPermission($user, 'data_pokok:create');
    }

    /**
     * Determine if user can update the staff
     */
    public function update(User $user, Staff $staff): bool
    {
        if (!$this->hasModuleAccess($user, 'data_pokok')) {
            return false;
        }

        // Ensure user's tenant matches staff's tenant
        if ($user->instansi_id != $staff->instansi_id && $user->role !== 'super_admin') {
            return false;
        }

        // Only admin roles or users with update permission
        return in_array($user->role, ['super_admin', 'school_admin']) || 
               $this->hasPermission($user, 'data_pokok:update');
    }

    /**
     * Determine if user can delete the staff
     */
    public function delete(User $user, Staff $staff): bool
    {
        if (!$this->hasModuleAccess($user, 'data_pokok')) {
            return false;
        }

        // Ensure user's tenant matches staff's tenant
        if ($user->instansi_id != $staff->instansi_id && $user->role !== 'super_admin') {
            return false;
        }

        // Only admin roles or users with delete permission
        return in_array($user->role, ['super_admin', 'school_admin']) || 
               $this->hasPermission($user, 'data_pokok:delete');
    }

    /**
     * Check if user has access to data_pokok module
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

    /**
     * Check if user has specific permission
     */
    protected function hasPermission(User $user, string $permission): bool
    {
        if ($user->role === 'teacher' && $user->teacher) {
            return $user->teacher->hasPermission($permission);
        }

        return false;
    }
}

