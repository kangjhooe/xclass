<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Attendance;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Attendance Policy
 * 
 * Handles authorization for Attendance resource
 */
class AttendancePolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any attendances
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'attendance');
    }

    /**
     * Determine if user can view the attendance
     */
    public function view(User $user, Attendance $attendance): bool
    {
        if (!$this->hasModuleAccess($user, 'attendance')) {
            return false;
        }

        return $user->instansi_id == $attendance->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create attendances
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'attendance');
    }

    /**
     * Determine if user can update the attendance
     */
    public function update(User $user, Attendance $attendance): bool
    {
        if (!$this->hasModuleAccess($user, 'attendance')) {
            return false;
        }

        return $user->instansi_id == $attendance->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the attendance
     */
    public function delete(User $user, Attendance $attendance): bool
    {
        if (!$this->hasModuleAccess($user, 'attendance')) {
            return false;
        }

        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        return $user->instansi_id == $attendance->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to attendance module
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

