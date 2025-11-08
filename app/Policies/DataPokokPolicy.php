<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Data Pokok Policy
 * 
 * Handles authorization for Data Pokok module
 */
class DataPokokPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view data pokok
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:read');
    }

    /**
     * Determine if user can view specific data pokok
     */
    public function view(User $user, $model): bool
    {
        return $this->hasPermission($user, 'data_pokok:read');
    }

    /**
     * Determine if user can create data pokok
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:create');
    }

    /**
     * Determine if user can update data pokok
     */
    public function update(User $user, $model): bool
    {
        return $this->hasPermission($user, 'data_pokok:update');
    }

    /**
     * Determine if user can delete data pokok
     */
    public function delete(User $user, $model): bool
    {
        return $this->hasPermission($user, 'data_pokok:delete');
    }

    /**
     * Determine if user can export data pokok
     */
    public function export(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:export');
    }

    /**
     * Determine if user can import data pokok
     */
    public function import(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:import');
    }

    /**
     * Determine if user can manage mutasi siswa
     */
    public function manageMutasi(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:mutasi');
    }

    /**
     * Determine if user can manage cross-tenant assignments
     */
    public function manageAssignments(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:assignments');
    }

    /**
     * Determine if user can view activity logs
     */
    public function viewActivityLogs(User $user): bool
    {
        return $this->hasPermission($user, 'data_pokok:logs');
    }

    /**
     * Check if user has specific permission
     */
    protected function hasPermission(User $user, string $permission): bool
    {
        // Super admin has all permissions
        if ($user->role === 'super_admin') {
            return true;
        }

        // Check role-based permissions
        $rolePermissions = $this->getRolePermissions($user->role);
        
        if (in_array($permission, $rolePermissions)) {
            return true;
        }

        // Check custom permissions
        if ($user->permissions && in_array($permission, $user->permissions)) {
            return true;
        }

        return false;
    }

    /**
     * Get permissions for specific role
     */
    protected function getRolePermissions(string $role): array
    {
        return match($role) {
            'super_admin' => [
                'data_pokok:read',
                'data_pokok:create',
                'data_pokok:update',
                'data_pokok:delete',
                'data_pokok:export',
                'data_pokok:import',
                'data_pokok:mutasi',
                'data_pokok:assignments',
                'data_pokok:logs',
            ],
            'school_admin' => [
                'data_pokok:read',
                'data_pokok:create',
                'data_pokok:update',
                'data_pokok:export',
                'data_pokok:import',
                'data_pokok:mutasi',
            ],
            default => []
        };
    }

    /**
     * Get all permissions for user
     */
    public function getAllPermissions(User $user): array
    {
        $rolePermissions = $this->getRolePermissions($user->role);
        $customPermissions = $user->permissions ?? [];
        
        return array_unique(array_merge($rolePermissions, $customPermissions));
    }

    /**
     * Check if user can perform action on specific model
     */
    public function canPerformAction(User $user, string $action, $model = null): bool
    {
        return match($action) {
            'view' => $this->view($user, $model),
            'create' => $this->create($user),
            'update' => $this->update($user, $model),
            'delete' => $this->delete($user, $model),
            'export' => $this->export($user),
            'import' => $this->import($user),
            'mutasi' => $this->manageMutasi($user),
            'assignments' => $this->manageAssignments($user),
            'logs' => $this->viewActivityLogs($user),
            default => false
        };
    }
}