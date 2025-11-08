<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Core\Services\TenantService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service for Activity Log management
 * 
 * Handles business logic for activity log operations
 */
class ActivityLogService
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get activity logs for current tenant
     */
    public function getLogs(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $query = ActivityLog::forTenant($tenant->id)
            ->with(['user', 'model'])
            ->latest();

        // Apply filters
        if (isset($filters['user_id']) && $filters['user_id']) {
            $query->forUser($filters['user_id']);
        }

        if (isset($filters['model_type']) && $filters['model_type']) {
            $query->forModel($filters['model_type']);
        }

        if (isset($filters['action']) && $filters['action']) {
            $query->forAction($filters['action']);
        }

        if (isset($filters['start_date']) && $filters['start_date']) {
            $endDate = $filters['end_date'] ?? now()->format('Y-m-d');
            $query->dateRange($filters['start_date'], $endDate);
        }

        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('user', function ($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'like', "%{$searchTerm}%");
                })
                ->orWhere('description', 'like', "%{$searchTerm}%")
                ->orWhere('model_type', 'like', "%{$searchTerm}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get activity logs for specific model
     */
    public function getModelLogs(string $modelType, int $modelId, int $perPage = 15): LengthAwarePaginator
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        return ActivityLog::forTenant($tenant->id)
            ->forModel($modelType)
            ->where('model_id', $modelId)
            ->with(['user'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get recent activity logs
     */
    public function getRecentLogs(int $limit = 10): Collection
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        return ActivityLog::forTenant($tenant->id)
            ->with(['user', 'model'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get activity statistics
     */
    public function getStatistics(): array
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $query = ActivityLog::forTenant($tenant->id);
        
        return [
            'total' => $query->count(),
            'today' => $query->whereDate('created_at', today())->count(),
            'this_week' => $query->whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => $query->whereMonth('created_at', now()->month)->count(),
            'by_action' => $query->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action')
                ->toArray(),
            'by_model' => $query->selectRaw('model_type, COUNT(*) as count')
                ->groupBy('model_type')
                ->pluck('count', 'model_type')
                ->toArray(),
            'by_user' => $query->join('users', 'activity_logs.user_id', '=', 'users.id')
                ->selectRaw('users.name, COUNT(*) as count')
                ->groupBy('users.id', 'users.name')
                ->pluck('count', 'name')
                ->toArray(),
        ];
    }

    /**
     * Get activity logs for dashboard
     */
    public function getDashboardLogs(): array
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        return [
            'recent_activities' => $this->getRecentLogs(5),
            'statistics' => $this->getStatistics(),
            'top_users' => ActivityLog::forTenant($tenant->id)
                ->join('users', 'activity_logs.user_id', '=', 'users.id')
                ->selectRaw('users.name, COUNT(*) as activity_count')
                ->groupBy('users.id', 'users.name')
                ->orderBy('activity_count', 'desc')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Export activity logs
     */
    public function exportLogs(array $filters = []): Collection
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $query = ActivityLog::forTenant($tenant->id)
            ->with(['user', 'model']);

        // Apply same filters as getLogs
        if (isset($filters['user_id']) && $filters['user_id']) {
            $query->forUser($filters['user_id']);
        }

        if (isset($filters['model_type']) && $filters['model_type']) {
            $query->forModel($filters['model_type']);
        }

        if (isset($filters['action']) && $filters['action']) {
            $query->forAction($filters['action']);
        }

        if (isset($filters['start_date']) && $filters['start_date']) {
            $endDate = $filters['end_date'] ?? now()->format('Y-m-d');
            $query->dateRange($filters['start_date'], $endDate);
        }

        return $query->latest()->get();
    }

    /**
     * Format activity log for export
     */
    public function formatForExport(ActivityLog $log): array
    {
        return [
            'Tanggal' => $log->created_at->format('d-m-Y H:i:s'),
            'User' => $log->user->name ?? 'Unknown',
            'Aksi' => $log->action_label,
            'Model' => $log->model_name,
            'Deskripsi' => $log->description,
            'IP Address' => $log->ip_address,
            'User Agent' => $log->user_agent,
            'Perubahan' => $log->changes ? json_encode($log->changes, JSON_PRETTY_PRINT) : null,
        ];
    }

    /**
     * Clean old activity logs
     */
    public function cleanOldLogs(int $days = 90): int
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $cutoffDate = now()->subDays($days);
        
        return ActivityLog::forTenant($tenant->id)
            ->where('created_at', '<', $cutoffDate)
            ->delete();
    }

    /**
     * Get model types for filter
     */
    public function getModelTypes(): array
    {
        return [
            'App\\Models\\Tenant\\Institution' => 'Lembaga',
            'App\\Models\\Tenant\\Teacher' => 'Guru',
            'App\\Models\\Tenant\\Student' => 'Siswa',
            'App\\Models\\Tenant\\Staff' => 'Staf',
            'App\\Models\\Tenant\\ClassRoom' => 'Kelas',
        ];
    }

    /**
     * Get actions for filter
     */
    public function getActions(): array
    {
        return [
            'create' => 'Membuat',
            'update' => 'Memperbarui',
            'delete' => 'Menghapus',
            'export' => 'Mengekspor',
            'import' => 'Mengimpor',
        ];
    }
}
