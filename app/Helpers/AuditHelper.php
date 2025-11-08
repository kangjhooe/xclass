<?php

namespace App\Helpers;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditHelper
{
    /**
     * Log system activity
     */
    public static function log(string $level, string $message, array $context = [], $tenantId = null): void
    {
        SystemLog::create([
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'user_id' => Auth::id(),
            'tenant_id' => $tenantId,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log info level activity
     */
    public static function info(string $message, array $context = [], $tenantId = null): void
    {
        self::log('info', $message, $context, $tenantId);
    }

    /**
     * Log warning level activity
     */
    public static function warning(string $message, array $context = [], $tenantId = null): void
    {
        self::log('warning', $message, $context, $tenantId);
    }

    /**
     * Log error level activity
     */
    public static function error(string $message, array $context = [], $tenantId = null): void
    {
        self::log('error', $message, $context, $tenantId);
    }

    /**
     * Log critical level activity
     */
    public static function critical(string $message, array $context = [], $tenantId = null): void
    {
        self::log('critical', $message, $context, $tenantId);
    }

    /**
     * Log tenant creation
     */
    public static function logTenantCreated($tenant): void
    {
        self::info("Tenant created: {$tenant->name} (NPSN: {$tenant->npsn})", [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'tenant_npsn' => $tenant->npsn,
            'subscription_plan' => $tenant->subscription_plan,
        ]);
    }

    /**
     * Log tenant update
     */
    public static function logTenantUpdated($tenant, array $changes = []): void
    {
        self::info("Tenant updated: {$tenant->name}", [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'changes' => $changes,
        ]);
    }

    /**
     * Log tenant activation/deactivation
     */
    public static function logTenantStatusChanged($tenant, bool $isActive): void
    {
        $action = $isActive ? 'activated' : 'deactivated';
        self::info("Tenant {$action}: {$tenant->name}", [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'is_active' => $isActive,
        ]);
    }

    /**
     * Log user creation
     */
    public static function logUserCreated($user): void
    {
        self::info("User created: {$user->name} ({$user->email})", [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_role' => $user->role,
            'tenant_id' => $user->instansi_id,
        ], $user->instansi_id);
    }

    /**
     * Log user update
     */
    public static function logUserUpdated($user, array $changes = []): void
    {
        self::info("User updated: {$user->name}", [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'changes' => $changes,
        ], $user->instansi_id);
    }

    /**
     * Log user activation/deactivation
     */
    public static function logUserStatusChanged($user, bool $isActive): void
    {
        $action = $isActive ? 'activated' : 'deactivated';
        self::info("User {$action}: {$user->name}", [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'is_active' => $isActive,
        ], $user->instansi_id);
    }

    /**
     * Log backup creation
     */
    public static function logBackupCreated($backup): void
    {
        self::info("Backup created: {$backup->filename}", [
            'backup_id' => $backup->id,
            'filename' => $backup->filename,
            'size' => $backup->size,
            'description' => $backup->description,
        ]);
    }

    /**
     * Log backup deletion
     */
    public static function logBackupDeleted($backup): void
    {
        self::info("Backup deleted: {$backup->filename}", [
            'backup_id' => $backup->id,
            'filename' => $backup->filename,
        ]);
    }

    /**
     * Log system settings update
     */
    public static function logSettingsUpdated(array $changes = []): void
    {
        self::info("System settings updated", [
            'changes' => $changes,
        ]);
    }
}
