<?php

namespace App\Policies\Tenant;

use App\Models\User;
use App\Models\Tenant\Teacher;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Teacher Policy
 * 
 * Handles authorization for Teacher resource
 */
class TeacherPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any teachers
     */
    public function viewAny(User $user): bool
    {
        return $this->hasModuleAccess($user, 'teachers');
    }

    /**
     * Determine if user can view the teacher
     */
    public function view(User $user, Teacher $teacher): bool
    {
        if (!$this->hasModuleAccess($user, 'teachers')) {
            return false;
        }

        // Check if teacher belongs to user's tenant (either primary or branch)
        return $this->teacherBelongsToTenant($user, $teacher) || $user->role === 'super_admin';
    }

    /**
     * Determine if user can create teachers
     */
    public function create(User $user): bool
    {
        return $this->hasModuleAccess($user, 'teachers');
    }

    /**
     * Determine if user can update the teacher
     */
    public function update(User $user, Teacher $teacher): bool
    {
        if (!$this->hasModuleAccess($user, 'teachers')) {
            return false;
        }

        return $this->teacherBelongsToTenant($user, $teacher) || $user->role === 'super_admin';
    }

    /**
     * Determine if user can delete the teacher
     */
    public function delete(User $user, Teacher $teacher): bool
    {
        if (!$this->hasModuleAccess($user, 'teachers')) {
            return false;
        }

        if (!in_array($user->role, ['super_admin', 'school_admin'])) {
            return false;
        }

        return $this->teacherBelongsToTenant($user, $teacher) || $user->role === 'super_admin';
    }

    /**
     * Check if user has access to teachers module
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
            // Teachers can view their own profile and basic info
            // But full access requires module permission
            if ($user->teacher->hasAdditionalDuty('kepala_sekolah')) {
                return true;
            }

            return $user->teacher->hasModuleAccess($module);
        }

        return false;
    }

    /**
     * Check if teacher belongs to user's tenant
     */
    protected function teacherBelongsToTenant(User $user, Teacher $teacher): bool
    {
        // Direct tenant relationship
        if ($teacher->instansi_id == $user->instansi_id) {
            return true;
        }

        // Check through teacher_tenants table (branch relationship)
        $teacherTenant = \Illuminate\Support\Facades\DB::table('teacher_tenants')
            ->where('teacher_id', $teacher->id)
            ->where('tenant_id', $user->instansi_id)
            ->where('is_active', true)
            ->exists();

        return $teacherTenant;
    }
}

