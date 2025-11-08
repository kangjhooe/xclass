<?php

namespace App\Services;

use App\Models\Core\Tenant;
use App\Models\Core\TenantActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class TenantActivityLogService
{
    /**
     * Log an activity
     */
    public function log(
        Tenant $tenant,
        string $action,
        string $description,
        ?Model $model = null,
        ?int $userId = null,
        ?Request $request = null,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = []
    ): TenantActivityLog {
        $logData = [
            'tenant_id' => $tenant->id,
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'description' => $description,
            'logged_at' => now(),
        ];

        if ($model) {
            $logData['model_type'] = get_class($model);
            $logData['model_id'] = $model->id;
        }

        if ($request) {
            $logData['ip_address'] = $request->ip();
            $logData['user_agent'] = $request->userAgent();
            $logData['url'] = $request->fullUrl();
            $logData['method'] = $request->method();
        }

        if (!empty($oldValues)) {
            $logData['old_values'] = $oldValues;
        }

        if (!empty($newValues)) {
            $logData['new_values'] = $newValues;
        }

        if (!empty($metadata)) {
            $logData['metadata'] = $metadata;
        }

        return TenantActivityLog::create($logData);
    }

    /**
     * Log model creation
     */
    public function logCreate(Tenant $tenant, Model $model, ?Request $request = null): TenantActivityLog
    {
        return $this->log(
            $tenant,
            'create',
            "Created {$this->getModelName($model)}",
            $model,
            auth()->id(),
            $request,
            [],
            $model->getAttributes()
        );
    }

    /**
     * Log model update
     */
    public function logUpdate(Tenant $tenant, Model $model, array $oldValues, ?Request $request = null): TenantActivityLog
    {
        return $this->log(
            $tenant,
            'update',
            "Updated {$this->getModelName($model)}",
            $model,
            auth()->id(),
            $request,
            $oldValues,
            $model->getChanges()
        );
    }

    /**
     * Log model deletion
     */
    public function logDelete(Tenant $tenant, Model $model, ?Request $request = null): TenantActivityLog
    {
        return $this->log(
            $tenant,
            'delete',
            "Deleted {$this->getModelName($model)}",
            $model,
            auth()->id(),
            $request,
            $model->getAttributes()
        );
    }

    /**
     * Log user login
     */
    public function logLogin(Tenant $tenant, int $userId, ?Request $request = null): TenantActivityLog
    {
        return $this->log(
            $tenant,
            'login',
            'User logged in',
            null,
            $userId,
            $request
        );
    }

    /**
     * Log user logout
     */
    public function logLogout(Tenant $tenant, int $userId, ?Request $request = null): TenantActivityLog
    {
        return $this->log(
            $tenant,
            'logout',
            'User logged out',
            null,
            $userId,
            $request
        );
    }

    /**
     * Get model name for logging
     */
    protected function getModelName(Model $model): string
    {
        $className = class_basename($model);
        return str_replace('_', ' ', snake_case($className));
    }

    /**
     * Get activity logs for tenant
     */
    public function getLogs(Tenant $tenant, array $filters = [], int $perPage = 50)
    {
        $query = $tenant->activityLogs()->with('user')->latest('logged_at');

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (isset($filters['model_type'])) {
            $query->where('model_type', $filters['model_type']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->dateRange($filters['start_date'], $filters['end_date']);
        }

        return $query->paginate($perPage);
    }
}

