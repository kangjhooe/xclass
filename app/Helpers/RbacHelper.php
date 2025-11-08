<?php

namespace App\Helpers;

use App\Models\User;
use App\Policies\DataPokokPolicy;

/**
 * RBAC Helper
 * 
 * Provides convenient methods for role-based access control
 */
class RbacHelper
{
    protected static $policy;

    /**
     * Get policy instance
     */
    protected static function getPolicy(): DataPokokPolicy
    {
        if (!self::$policy) {
            self::$policy = app(DataPokokPolicy::class);
        }
        return self::$policy;
    }

    /**
     * Check if user has permission
     */
    public static function hasPermission(User $user, string $permission): bool
    {
        return self::getPolicy()->canPerformAction($user, $permission);
    }

    /**
     * Check if user can view data pokok
     */
    public static function canView(User $user): bool
    {
        return self::hasPermission($user, 'view');
    }

    /**
     * Check if user can create data pokok
     */
    public static function canCreate(User $user): bool
    {
        return self::hasPermission($user, 'create');
    }

    /**
     * Check if user can update data pokok
     */
    public static function canUpdate(User $user): bool
    {
        return self::hasPermission($user, 'update');
    }

    /**
     * Check if user can delete data pokok
     */
    public static function canDelete(User $user): bool
    {
        return self::hasPermission($user, 'delete');
    }

    /**
     * Check if user can export data pokok
     */
    public static function canExport(User $user): bool
    {
        return self::hasPermission($user, 'export');
    }

    /**
     * Check if user can import data pokok
     */
    public static function canImport(User $user): bool
    {
        return self::hasPermission($user, 'import');
    }

    /**
     * Check if user can manage mutasi siswa
     */
    public static function canManageMutasi(User $user): bool
    {
        return self::hasPermission($user, 'mutasi');
    }

    /**
     * Check if user can manage assignments
     */
    public static function canManageAssignments(User $user): bool
    {
        return self::hasPermission($user, 'assignments');
    }

    /**
     * Check if user can view activity logs
     */
    public static function canViewLogs(User $user): bool
    {
        return self::hasPermission($user, 'logs');
    }

    /**
     * Get user role display name
     */
    public static function getRoleDisplayName(string $role): string
    {
        return match($role) {
            'super_admin' => 'Administrator',
            'school_admin' => 'Admin Sekolah',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get role badge class
     */
    public static function getRoleBadgeClass(string $role): string
    {
        return match($role) {
            'super_admin' => 'badge-danger',
            'school_admin' => 'badge-primary',
            default => 'badge-secondary'
        };
    }

    /**
     * Get all permissions for user
     */
    public static function getAllPermissions(User $user): array
    {
        return self::getPolicy()->getAllPermissions($user);
    }

    /**
     * Check if user is admin
     */
    public static function isAdmin(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Check if user is operator
     */
    public static function isOperator(User $user): bool
    {
        return $user->role === 'school_admin';
    }

    /**
     * Check if user is kepala sekolah
     */
    public static function isKepalaSekolah(User $user): bool
    {
        return $user->role === 'school_admin';
    }

    /**
     * Get permission display name
     */
    public static function getPermissionDisplayName(string $permission): string
    {
        return match($permission) {
            'data_pokok:read' => 'Baca Data Pokok',
            'data_pokok:create' => 'Buat Data Pokok',
            'data_pokok:update' => 'Update Data Pokok',
            'data_pokok:delete' => 'Hapus Data Pokok',
            'data_pokok:export' => 'Export Data Pokok',
            'data_pokok:import' => 'Import Data Pokok',
            'data_pokok:mutasi' => 'Kelola Mutasi Siswa',
            'data_pokok:assignments' => 'Kelola Penugasan Lintas Tenant',
            'data_pokok:logs' => 'Lihat Log Aktivitas',
            default => $permission
        };
    }

    /**
     * Get accessible entities for user
     */
    public static function getAccessibleEntities(User $user): array
    {
        $entities = [];
        
        if (self::canView($user)) {
            $entities[] = 'institutions';
            $entities[] = 'teachers';
            $entities[] = 'students';
            $entities[] = 'staff';
            $entities[] = 'classrooms';
        }

        if (self::canManageMutasi($user)) {
            $entities[] = 'mutasi_siswa';
        }

        if (self::canManageAssignments($user)) {
            $entities[] = 'tenant_assignments';
        }

        if (self::canViewLogs($user)) {
            $entities[] = 'activity_logs';
        }

        return $entities;
    }

    /**
     * Get action buttons for entity based on permissions
     */
    public static function getActionButtons(User $user, string $entity): array
    {
        $buttons = [];

        if (self::canView($user)) {
            $buttons[] = 'view';
        }

        if (self::canCreate($user)) {
            $buttons[] = 'create';
        }

        if (self::canUpdate($user)) {
            $buttons[] = 'edit';
        }

        if (self::canDelete($user)) {
            $buttons[] = 'delete';
        }

        if (self::canExport($user)) {
            $buttons[] = 'export';
        }

        if (self::canImport($user)) {
            $buttons[] = 'import';
        }

        return $buttons;
    }
}
