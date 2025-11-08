<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\AdditionalDuty;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Additional Duty Policy
 * 
 * Handles authorization for AdditionalDuty resource
 */
class AdditionalDutyPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any additional duties
     */
    public function viewAny(User $user): bool
    {
        // Only admin can manage additional duties
        return in_array($user->role, ['super_admin', 'school_admin']);
    }

    /**
     * Determine if user can view the additional duty
     */
    public function view(User $user, AdditionalDuty $additionalDuty): bool
    {
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches additional duty's tenant
        return $user->instansi_id == $additionalDuty->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create additional duties
     */
    public function create(User $user): bool
    {
        // Only admin roles can create
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Check permission if teacher role
        if ($user->role === 'teacher' && $user->teacher) {
            return $user->teacher->hasPermission('teachers:update');
        }

        return true;
    }

    /**
     * Determine if user can update the additional duty
     */
    public function update(User $user, AdditionalDuty $additionalDuty): bool
    {
        // Only admin roles can update
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches additional duty's tenant
        if ($user->instansi_id != $additionalDuty->instansi_id && $user->role !== 'super_admin') {
            return false;
        }

        return true;
    }

    /**
     * Determine if user can delete the additional duty
     */
    public function delete(User $user, AdditionalDuty $additionalDuty): bool
    {
        // Only admin roles can delete
        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        // Ensure user's tenant matches additional duty's tenant
        if ($user->instansi_id != $additionalDuty->instansi_id && $user->role !== 'super_admin') {
            return false;
        }

        return true;
    }
}

