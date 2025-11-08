<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Models\User;
use App\Models\SystemLog;
use App\Models\SystemBackup;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Show super admin dashboard - Global scope only
     */
    public function index()
    {
        // Global statistics only
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'inactive_tenants' => Tenant::where('is_active', false)->count(),
            'total_admin_tenants' => User::where('role', 'school_admin')->count(),
            'active_admin_tenants' => User::where('role', 'school_admin')->where('is_active', true)->count(),
            'total_global_users' => User::whereIn('role', ['super_admin', 'school_admin'])->count(),
            'active_global_users' => User::whereIn('role', ['super_admin', 'school_admin'])->where('is_active', true)->count(),
            'total_backups' => SystemBackup::count(),
            'recent_backups' => SystemBackup::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        // Recent tenants (metadata only)
        $recent_tenants = Tenant::select('id', 'name', 'npsn', 'is_active', 'subscription_plan', 'created_at')
            ->latest()
            ->take(5)
            ->get();

        // Recent admin tenants (global users only)
        $recent_admin_tenants = User::with('tenant:id,name,npsn')
            ->where('role', 'school_admin')
            ->select('id', 'name', 'email', 'instansi_id', 'is_active', 'last_login_at', 'created_at')
            ->latest()
            ->take(5)
            ->get();

        // Recent system logs
        $recent_logs = SystemLog::with(['user:id,name', 'tenant:id,name'])
            ->latest()
            ->take(10)
            ->get();

        // System health indicators
        $system_health = [
            'database_status' => $this->checkDatabaseStatus(),
            'storage_status' => $this->checkStorageStatus(),
            'backup_status' => $this->checkBackupStatus(),
            'error_rate' => $this->getErrorRate(),
        ];

        return view('admin.dashboard', compact(
            'stats', 
            'recent_tenants', 
            'recent_admin_tenants', 
            'recent_logs',
            'system_health'
        ));
    }

    /**
     * Check database connection status
     */
    private function checkDatabaseStatus(): string
    {
        try {
            \DB::connection()->getPdo();
            return 'healthy';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Check storage status
     */
    private function checkStorageStatus(): string
    {
        $freeSpace = disk_free_space(storage_path());
        $totalSpace = disk_total_space(storage_path());
        $usedPercentage = (($totalSpace - $freeSpace) / $totalSpace) * 100;

        if ($usedPercentage > 90) {
            return 'critical';
        } elseif ($usedPercentage > 75) {
            return 'warning';
        }

        return 'healthy';
    }

    /**
     * Check backup status
     */
    private function checkBackupStatus(): string
    {
        $lastBackup = SystemBackup::where('status', 'completed')
            ->latest()
            ->first();

        if (!$lastBackup) {
            return 'no_backup';
        }

        $daysSinceLastBackup = $lastBackup->created_at->diffInDays(now());

        if ($daysSinceLastBackup > 7) {
            return 'outdated';
        }

        return 'healthy';
    }

    /**
     * Get error rate percentage
     */
    private function getErrorRate(): float
    {
        $totalLogs = SystemLog::where('created_at', '>=', now()->subDays(7))->count();
        $errorLogs = SystemLog::where('created_at', '>=', now()->subDays(7))
            ->whereIn('level', ['error', 'critical'])
            ->count();

        if ($totalLogs === 0) {
            return 0;
        }

        return round(($errorLogs / $totalLogs) * 100, 2);
    }
}
