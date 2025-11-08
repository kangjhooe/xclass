<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Schedule;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Schedule Policy
 * 
 * Handles authorization for Schedule resource
 */
class SchedulePolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any schedules
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'schedules');
    }

    /**
     * Determine if user can view the schedule
     */
    public function view(User $user, Schedule $schedule): bool
    {
        if (!$this->hasModuleAccess($user, 'schedules')) {
            return false;
        }

        return $user->instansi_id == $schedule->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create schedules
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'schedules');
    }

    /**
     * Determine if user can update the schedule
     */
    public function update(User $user, Schedule $schedule): bool
    {
        if (!$this->hasModuleAccess($user, 'schedules')) {
            return false;
        }

        return $user->instansi_id == $schedule->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the schedule
     */
    public function delete(User $user, Schedule $schedule): bool
    {
        if (!$this->hasModuleAccess($user, 'schedules')) {
            return false;
        }

        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        return $user->instansi_id == $schedule->instansi_id || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to schedules module
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

